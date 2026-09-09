import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { newAmount, note, currentTenant } = await req.json();
  const tenant = await db.updateTenantRent(id, newAmount, note, currentTenant);
  return NextResponse.json(tenant);
}
