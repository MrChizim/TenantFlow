import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = getAdminClient();
  const { error } = await admin.storage.from('property-images').upload(path, file);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from('property-images').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
