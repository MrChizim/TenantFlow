import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
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

  const { property_id } = await req.json();
  if (!property_id) return NextResponse.json({ error: 'property_id required' }, { status: 400 });

  // Verify property belongs to user
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('user_id', user.id)
    .single();

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  // Upsert — one active link per property
  const { data, error } = await supabase
    .from('tenant_invite_links')
    .upsert({ user_id: user.id, property_id, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() }, { onConflict: 'property_id' })
    .select('token')
    .single();

  if (error) {
    // If upsert fails (no unique on property_id), just insert
    const { data: inserted, error: insertError } = await supabase
      .from('tenant_invite_links')
      .insert({ user_id: user.id, property_id, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
      .select('token')
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    return NextResponse.json({ url: `${base}/join/${inserted.token}` });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return NextResponse.json({ url: `${base}/join/${data.token}` });
}
