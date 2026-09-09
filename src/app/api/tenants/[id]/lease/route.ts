import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { newLeaseEnd, currentTenant } = await req.json();
  const tenant = await db.renewTenantLease(id, newLeaseEnd, currentTenant);
  return NextResponse.json(tenant);
}
