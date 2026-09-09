import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  const properties = await db.fetchProperties();
  const [tenants, expenses, installments] = await Promise.all([
    db.fetchTenants(properties),
    db.fetchExpenses(),
    db.fetchInstallments(),
  ]);
  return NextResponse.json({ properties, tenants, expenses, installments });
}
