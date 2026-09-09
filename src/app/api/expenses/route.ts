import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const expense = await db.createExpense(data);
  return NextResponse.json(expense);
}
