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

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single();

  // Prevent repeated calls from resetting/extending the trial indefinitely
  if (profile?.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro' }, { status: 400 });
  }
  if (profile?.plan === 'trial' && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
    return NextResponse.json({ error: 'Trial already active' }, { status: 400 });
  }
  const hasUsedTrial = profile?.trial_ends_at != null;

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.PAYSTACK_PLAN_CODE;
  if (!secretKey || !planCode) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
  }

  // Only first-time subscribers get the 7-day free trial
  const trialDays = hasUsedTrial ? 0 : 7;

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
      ...(trialDays > 0 ? { trial_period: trialDays } : {}), // Paystack trial_period in days
      metadata: {
        user_id: user.id,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/settings`,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/paystack/callback`,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    return NextResponse.json({ error: json.message ?? 'Paystack error' }, { status: 500 });
  }

  // Mark user as trial immediately (only if they still have a trial to use)
  if (trialDays > 0) {
    const trialEndsAt = new Date(Date.now() + trialDays * 86400 * 1000).toISOString();
    await supabase.from('profiles').upsert({
      id: user.id,
      plan: 'trial',
      trial_ends_at: trialEndsAt,
    });
  }

  return NextResponse.json({ url: json.data.authorization_url });
}
