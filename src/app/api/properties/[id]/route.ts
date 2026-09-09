import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const property = await db.updateProperty(id, data);
  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deleteProperty(id);
  return NextResponse.json({ ok: true });
}
