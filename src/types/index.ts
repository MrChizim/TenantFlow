export type PropertyType =
  | 'apartment'
  | '1_bedroom_flat'
  | 'self_contain'
  | '2_bedroom_flat'
  | '3_bedroom_flat'
  | 'duplex'
  | 'bungalow'
  | 'commercial'
  | 'land';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: PropertyType;
  total_units: number;
  image_url?: string;
  purchase_price?: number;
  build_cost?: number;
  purchase_date?: string;
  owner_name?: string;
  created_at: string;
}

export type PaymentSchedule = 'annual' | 'biannual' | 'quarterly' | 'monthly';

export interface PaymentInstallment {
  id: string;
  tenant_id: string;
  due_date: string;
  amount: number;
  paid: boolean;
  paid_date?: string;
  method?: 'bank_transfer' | 'cash' | 'online';
  reference?: string;
}

export interface RentHistoryEntry {
  date: string;
  amount: number;
  note?: string;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  nin?: string;
  property_id: string;
  unit: string;
  rent_amount: number;
  rent_history?: RentHistoryEntry[];
  payment_schedule: PaymentSchedule;
  lease_start: string;
  lease_end: string;
  status: 'active' | 'expiring' | 'expired';
  document_url?: string;
  agreement_signed?: boolean;
  created_at: string;
  property?: Property;
}

export interface ReminderLog {
  id: string;
  tenant_id: string;
  tenant_name: string;
  channel: 'whatsapp' | 'sms' | 'email';
  message_type: '12_months' | '6_months' | '3_months' | '1_month';
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  tenant?: Tenant;
}

export interface Payment {
  id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  method: 'bank_transfer' | 'cash' | 'online';
  reference?: string;
  note?: string;
  tenant?: Tenant;
}

export interface Expense {
  id: string;
  property_id: string;
  category: 'maintenance' | 'repair' | 'agent_fee' | 'legal' | 'utilities' | 'insurance' | 'other';
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface DashboardStats {
  total_properties: number;
  total_tenants: number;
  active_tenants: number;
  expiring_tenants: number;
  expired_tenants: number;
  total_annual_rent: number;
  reminders_sent_this_month: number;
}
