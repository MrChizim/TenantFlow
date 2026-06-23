import type { SupabaseClient } from '@supabase/supabase-js';
import type { Property, Tenant, Expense, PaymentInstallment, PaymentSchedule, PropertyType, RentHistoryEntry } from '@/types';

// ─── Status derivation ──────────────────────────────────────────────────────

export function deriveStatus(leaseEnd?: string | null): Tenant['status'] {
  if (!leaseEnd) return 'no_lease';
  const days = Math.ceil((new Date(leaseEnd).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring';
  return 'active';
}

function generateInstallments(tenantId: string, userId: string, rentAmount: number, schedule: PaymentSchedule, leaseStart: string, leaseEnd: string): Omit<PaymentInstallment, 'id'>[] {
  if (schedule === 'annual') return [];
  const intervals: Record<string, number> = { biannual: 6, quarterly: 3, monthly: 1 };
  const monthsPerPeriod = intervals[schedule] ?? 12;
  const amount = Math.round(rentAmount / (12 / monthsPerPeriod));
  const start = new Date(leaseStart);
  const end = new Date(leaseEnd);
  const result: Omit<PaymentInstallment, 'id'>[] = [];
  let current = new Date(start);
  while (current < end) {
    result.push({
      tenant_id: tenantId,
      due_date: current.toISOString().split('T')[0],
      amount,
      paid: false,
    } as Omit<PaymentInstallment, 'id'> & { user_id?: string });
    current = new Date(current);
    current.setMonth(current.getMonth() + monthsPerPeriod);
  }
  return result;
}

// ─── Properties ─────────────────────────────────────────────────────────────

export async function fetchProperties(client: SupabaseClient, userId: string): Promise<Property[]> {
  const { data, error } = await client
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function createProperty(
  client: SupabaseClient,
  userId: string,
  data: Omit<Property, 'id' | 'created_at'>
): Promise<Property> {
  const { data: row, error } = await client
    .from('properties')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return row as Property;
}

export async function updateProperty(
  client: SupabaseClient,
  id: string,
  data: Partial<Omit<Property, 'id' | 'created_at' | 'user_id'>>
): Promise<Property> {
  const { data: row, error } = await client
    .from('properties')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return row as Property;
}

export async function deleteProperty(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('properties').delete().eq('id', id);
  if (error) throw error;
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

export async function fetchTenants(client: SupabaseClient, userId: string, properties: Property[]): Promise<Tenant[]> {
  const { data, error } = await client
    .from('tenants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    ...row,
    status: deriveStatus(row.lease_end),
    property: properties.find(p => p.id === row.property_id),
  })) as Tenant[];
}

export async function createTenant(
  client: SupabaseClient,
  userId: string,
  data: Omit<Tenant, 'id' | 'created_at' | 'status' | 'property'>,
  properties: Property[]
): Promise<{ tenant: Tenant; installments: PaymentInstallment[] }> {
  const { data: row, error } = await client
    .from('tenants')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  if (error) throw error;

  const tenant: Tenant = {
    ...row,
    status: deriveStatus(row.lease_end),
    property: properties.find(p => p.id === row.property_id),
  };

  // Insert installments if not annual
  let installments: PaymentInstallment[] = [];
  if (data.payment_schedule && data.payment_schedule !== 'annual' && data.lease_start && data.lease_end) {
    const toInsert = generateInstallments(
      tenant.id, userId, data.rent_amount, data.payment_schedule, data.lease_start, data.lease_end
    ).map(i => ({ ...i, user_id: userId }));

    const { data: instRows, error: instError } = await client
      .from('payment_installments')
      .insert(toInsert)
      .select();
    if (instError) throw instError;
    installments = (instRows ?? []) as PaymentInstallment[];
  }

  return { tenant, installments };
}

export async function updateTenant(
  client: SupabaseClient,
  id: string,
  data: Partial<Omit<Tenant, 'id' | 'created_at' | 'status' | 'property' | 'user_id'>>,
  properties: Property[]
): Promise<Tenant> {
  const { data: row, error } = await client
    .from('tenants')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    ...row,
    status: deriveStatus(row.lease_end),
    property: properties.find(p => p.id === row.property_id),
  } as Tenant;
}

export async function deleteTenant(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('tenants').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTenantRent(
  client: SupabaseClient,
  id: string,
  newAmount: number,
  note: string | undefined,
  currentTenant: Tenant
): Promise<Tenant> {
  const entry: RentHistoryEntry = {
    date: new Date().toISOString().split('T')[0],
    amount: currentTenant.rent_amount,
    note: note ?? `Updated from ₦${currentTenant.rent_amount.toLocaleString('en-NG')} to ₦${newAmount.toLocaleString('en-NG')}`,
  };
  const newHistory = [...(currentTenant.rent_history ?? []), entry];

  const { data: row, error } = await client
    .from('tenants')
    .update({ rent_amount: newAmount, rent_history: newHistory })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    ...row,
    status: deriveStatus(row.lease_end),
    property: currentTenant.property,
  } as Tenant;
}

export async function renewTenantLease(
  client: SupabaseClient,
  id: string,
  newLeaseEnd: string,
  currentTenant: Tenant
): Promise<Tenant> {
  const { data: row, error } = await client
    .from('tenants')
    .update({ lease_end: newLeaseEnd })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    ...row,
    status: deriveStatus(row.lease_end),
    property: currentTenant.property,
  } as Tenant;
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function fetchExpenses(client: SupabaseClient, userId: string): Promise<Expense[]> {
  const { data, error } = await client
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function createExpense(
  client: SupabaseClient,
  userId: string,
  data: Omit<Expense, 'id' | 'created_at'>
): Promise<Expense> {
  const { data: row, error } = await client
    .from('expenses')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return row as Expense;
}

export async function deleteExpense(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ─── Installments ────────────────────────────────────────────────────────────

export async function fetchInstallments(client: SupabaseClient, userId: string): Promise<PaymentInstallment[]> {
  const { data, error } = await client
    .from('payment_installments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentInstallment[];
}

export async function markInstallmentPaid(
  client: SupabaseClient,
  id: string,
  method: 'bank_transfer' | 'cash' | 'online',
  reference?: string
): Promise<PaymentInstallment> {
  const { data: row, error } = await client
    .from('payment_installments')
    .update({
      paid: true,
      paid_date: new Date().toISOString().split('T')[0],
      method,
      reference: reference ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return row as PaymentInstallment;
}
