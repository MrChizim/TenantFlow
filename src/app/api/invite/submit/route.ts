import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '@/lib/rate-limit';

const MAX_LEN: Record<string, number> = {
  first_name: 80, last_name: 80, phone: 32, whatsapp: 32, email: 254,
  unit: 80, notes: 1000, nin: 20,
};

function clip(value: string, field: string): string {
  const max = MAX_LEN[field] ?? 255;
  return value.slice(0, max);
}

export async function POST(req: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { token, first_name, last_name, phone, whatsapp, unit, rent_amount, lease_start, notes, payment_status } = body as Record<string, string>;

  const missing = [];
  if (!token) missing.push('token');
  if (!first_name) missing.push('first_name');
  if (!phone) missing.push('phone');
  if (!unit) missing.push('unit');
  if (!rent_amount) missing.push('rent_amount');
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
  }

  const rentAmountNum = Number(rent_amount);
  if (!Number.isFinite(rentAmountNum) || rentAmountNum <= 0 || rentAmountNum > 1_000_000_000) {
    return NextResponse.json({ error: 'Invalid rent_amount' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(`invite:${token}`, 5, 10 * 60 * 1000) || isRateLimited(`invite-ip:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  // Look up invite link
  const { data: link } = await admin
    .from('tenant_invite_links')
    .select('user_id, property_id, expires_at')
    .eq('token', token)
    .single();

  if (!link) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired. Ask your landlord for a new one.' }, { status: 410 });
  }

  const allowedPaymentStatus = ['paid', 'owing', 'uncertain'];
  const safePaymentStatus = allowedPaymentStatus.includes(payment_status) ? payment_status : 'uncertain';

  // Insert tenant
  const { error } = await admin.from('tenants').insert({
    user_id: link.user_id,
    property_id: link.property_id,
    first_name: clip(first_name, 'first_name'),
    last_name: clip(last_name || '', 'last_name'),
    phone: clip(phone, 'phone'),
    whatsapp: clip(whatsapp || phone, 'whatsapp'),
    email: clip(String(body.email || ''), 'email'),
    unit: clip(unit, 'unit'),
    rent_amount: rentAmountNum,
    lease_start: lease_start || null,
    lease_end: null,
    payment_schedule: null,
    agreement_signed: false,
    notes: clip(notes || '', 'notes'),
    payment_status: safePaymentStatus,
    nin: clip(String(body.nin || ''), 'nin'),
    rent_history: [],
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
