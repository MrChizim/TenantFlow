import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.PAYSTACK_PLAN_CODE;
  if (!secretKey || !planCode) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
  }

  // Calculate trial end (7 days from now)
  const trialDays = 7;

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      amount: 1000000, // ₦10,000 in kobo
      plan: planCode,
      trial_period: trialDays, // Paystack trial_period in days
      metadata: {
        user_id: user.id,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/billing`,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/paystack/callback`,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    return NextResponse.json({ error: json.message ?? 'Paystack error' }, { status: 500 });
  }

  // Mark user as trial immediately
  const trialEndsAt = new Date(Date.now() + trialDays * 86400 * 1000).toISOString();
  await supabase.from('profiles').upsert({
    id: user.id,
    plan: 'trial',
    trial_ends_at: trialEndsAt,
  });

  return NextResponse.json({ url: json.data.authorization_url });
}
