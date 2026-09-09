import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const properties = await db.fetchProperties();
  const tenant = await db.updateTenant(id, data, properties);
  return NextResponse.json(tenant);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deleteTenant(id);
  return NextResponse.json({ ok: true });
}
