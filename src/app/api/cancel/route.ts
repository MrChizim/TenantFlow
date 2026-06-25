import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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

  // Get subscription code from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('paystack_subscription_code, paystack_customer_code')
    .eq('id', user.id)
    .single();

  if (!profile?.paystack_subscription_code) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  // Disable subscription via Paystack API
  const res = await fetch(`https://api.paystack.co/subscription/disable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: profile.paystack_subscription_code,
      token: profile.paystack_customer_code,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    return NextResponse.json({ error: json.message ?? 'Failed to cancel' }, { status: 500 });
  }

  // Downgrade immediately via admin client
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await admin
    .from('profiles')
    .update({ plan: 'free', paystack_subscription_code: null })
    .eq('id', user.id);

  return NextResponse.json({ ok: true });
}
