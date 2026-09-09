import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { method, reference } = await req.json();
  const installment = await db.markInstallmentPaid(id, method, reference);
  return NextResponse.json(installment);
}
