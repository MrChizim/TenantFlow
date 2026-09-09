import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const properties = await db.fetchProperties();
  const result = await db.createTenant(data, properties);
  return NextResponse.json(result);
}
