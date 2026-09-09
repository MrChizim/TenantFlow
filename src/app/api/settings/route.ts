import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await getAdminClient()
    .from('app_settings')
    .select('business_name')
    .eq('id', 1)
    .single();
  if (error) return NextResponse.json({ business_name: null });
  return NextResponse.json({ business_name: data?.business_name ?? null });
}

export async function PATCH(req: NextRequest) {
  const { business_name } = await req.json();
  const { error } = await getAdminClient()
    .from('app_settings')
    .upsert({ id: 1, business_name: business_name || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
