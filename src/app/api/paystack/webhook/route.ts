import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for webhook writes
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = getAdminClient();

  if (event.event === 'subscription.create') {
    const data = event.data;
    // Only process TenantFlow payments — all our transactions set metadata.user_id
    const userId = data.metadata?.user_id ?? event.metadata?.user_id;
    if (!userId) return NextResponse.json({ ok: true });

    await supabase.from('profiles').upsert({
      id: userId,
      plan: 'pro',
      trial_ends_at: null,
      paystack_customer_code: data.customer?.customer_code ?? null,
      paystack_subscription_code: data.subscription_code ?? null,
    });
  }

  if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew') {
    const subCode = event.data?.subscription_code;
    if (!subCode) return NextResponse.json({ ok: true });

    await supabase
      .from('profiles')
      .update({ plan: 'free', paystack_subscription_code: null })
      .eq('paystack_subscription_code', subCode);
  }

  if (event.event === 'invoice.payment_failed') {
    const subCode = event.data?.subscription?.subscription_code;
    if (!subCode) return NextResponse.json({ ok: true });

    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('paystack_subscription_code', subCode);
  }

  return NextResponse.json({ ok: true });
}
