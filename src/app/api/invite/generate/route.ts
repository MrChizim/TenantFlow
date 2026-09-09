import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { property_id } = await req.json();
  if (!property_id) return NextResponse.json({ error: 'property_id required' }, { status: 400 });

  const admin = getAdminClient();

  const { data: property } = await admin
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .single();

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  // Upsert — one active link per property
  const { data, error } = await admin
    .from('tenant_invite_links')
    .upsert({ property_id, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() }, { onConflict: 'property_id' })
    .select('token')
    .single();

  if (error) {
    // If upsert fails (no unique on property_id), just insert
    const { data: inserted, error: insertError } = await admin
      .from('tenant_invite_links')
      .insert({ property_id, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
      .select('token')
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    return NextResponse.json({ url: `${base}/join/${inserted.token}` });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return NextResponse.json({ url: `${base}/join/${data.token}` });
}
