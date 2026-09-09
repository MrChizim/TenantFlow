import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deleteExpense(id);
  return NextResponse.json({ ok: true });
}
