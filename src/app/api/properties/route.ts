import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const property = await db.createProperty(data);
  return NextResponse.json(property);
}
