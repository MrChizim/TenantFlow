import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { token, first_name, last_name, phone, whatsapp, unit, rent_amount, lease_start, notes, payment_status } = body;

  const missing = [];
  if (!token) missing.push('token');
  if (!first_name) missing.push('first_name');
  if (!phone) missing.push('phone');
  if (!unit) missing.push('unit');
  if (!rent_amount) missing.push('rent_amount');
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
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

  // Insert tenant
  const { error } = await admin.from('tenants').insert({
    user_id: link.user_id,
    property_id: link.property_id,
    first_name,
    last_name: last_name || '',
    phone,
    whatsapp: whatsapp || phone,
    email: body.email || '',
    unit,
    rent_amount: Number(rent_amount),
    lease_start: lease_start || null,
    lease_end: null,
    payment_schedule: null,
    agreement_signed: false,
    notes: notes || '',
    payment_status: payment_status || 'uncertain',
    nin: body.nin || '',
    rent_history: [],
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
