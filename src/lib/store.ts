'use client';

import { create } from 'zustand';
import type { Tenant, Property, Expense, PaymentInstallment } from '@/types';

export interface Notification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

interface AppStore {
  tenants: Tenant[];
  properties: Property[];
  expenses: Expense[];
  installments: PaymentInstallment[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // Lifecycle
  load: () => Promise<void>;
  clearAll: () => void;

  // Properties
  addProperty: (data: Omit<Property, 'id' | 'created_at'>) => Promise<void>;
  updateProperty: (id: string, data: Partial<Omit<Property, 'id' | 'created_at'>>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;

  // Tenants
  addTenant: (data: Omit<Tenant, 'id' | 'created_at' | 'status' | 'property'>) => Promise<void>;
  updateTenant: (id: string, data: Partial<Omit<Tenant, 'id' | 'created_at' | 'status' | 'property'>>) => Promise<void>;
  updateTenantRent: (id: string, newAmount: number, note?: string) => Promise<void>;
  renewTenantLease: (id: string, newLeaseEnd: string) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;

  // Expenses
  addExpense: (data: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Installments
  markInstallmentPaid: (id: string, method: 'bank_transfer' | 'cash' | 'online', reference?: string) => Promise<void>;

  // Notifications (client-only, not persisted)
  addNotification: (n: Omit<Notification, 'id' | 'at' | 'read'>) => void;
  markAllRead: () => void;
}

const CACHE_KEY = 'tf_cache';

export const useStore = create<AppStore>((set, get) => ({
  tenants: [],
  properties: [],
  expenses: [],
  installments: [],
  notifications: [],
  isLoading: false,
  error: null,

  load: async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { properties, tenants, expenses, installments } = JSON.parse(cached);
        set({ properties, tenants, expenses, installments, isLoading: true });
      } else {
        set({ isLoading: true, error: null });
      }
    } catch { set({ isLoading: true, error: null }); }

    try {
      const { properties, tenants, expenses, installments } = await api<{
        properties: Property[]; tenants: Tenant[]; expenses: Expense[]; installments: PaymentInstallment[];
      }>('/api/bootstrap');
      set({ properties, tenants, expenses, installments, isLoading: false });
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ properties, tenants, expenses, installments }));
      } catch { /* storage full, ignore */ }
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  clearAll: () => set({
    tenants: [], properties: [], expenses: [], installments: [],
    notifications: [], isLoading: false, error: null,
  }),

  // ── Properties ──────────────────────────────────────────────────────────
  addProperty: async (data) => {
    const property = await api<Property>('/api/properties', { method: 'POST', body: JSON.stringify(data) });
    set(s => ({ properties: [property, ...s.properties] }));
  },

  updateProperty: async (id, data) => {
    const updated = await api<Property>(`/api/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    set(s => ({ properties: s.properties.map(p => p.id === id ? updated : p) }));
  },

  deleteProperty: async (id) => {
    await api(`/api/properties/${id}`, { method: 'DELETE' });
    set(s => ({
      properties: s.properties.filter(p => p.id !== id),
      tenants: s.tenants.filter(t => t.property_id !== id),
      expenses: s.expenses.filter(e => e.property_id !== id),
      installments: s.installments.filter(i => {
        const tenant = s.tenants.find(t => t.id === i.tenant_id);
        return tenant?.property_id !== id;
      }),
    }));
  },

  // ── Tenants ─────────────────────────────────────────────────────────────
  addTenant: async (data) => {
    const { tenant, installments: newInstallments } = await api<{ tenant: Tenant; installments: PaymentInstallment[] }>(
      '/api/tenants', { method: 'POST', body: JSON.stringify(data) }
    );
    set(s => ({
      tenants: [tenant, ...s.tenants],
      installments: [...s.installments, ...newInstallments],
    }));
  },

  updateTenant: async (id, data) => {
    const updated = await api<Tenant>(`/api/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  updateTenantRent: async (id, newAmount, note) => {
    const current = get().tenants.find(t => t.id === id);
    if (!current) return;
    const updated = await api<Tenant>(`/api/tenants/${id}/rent`, {
      method: 'POST', body: JSON.stringify({ newAmount, note, currentTenant: current }),
    });
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  renewTenantLease: async (id, newLeaseEnd) => {
    const current = get().tenants.find(t => t.id === id);
    if (!current) return;
    const updated = await api<Tenant>(`/api/tenants/${id}/lease`, {
      method: 'POST', body: JSON.stringify({ newLeaseEnd, currentTenant: current }),
    });
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  deleteTenant: async (id) => {
    await api(`/api/tenants/${id}`, { method: 'DELETE' });
    set(s => ({
      tenants: s.tenants.filter(t => t.id !== id),
      installments: s.installments.filter(i => i.tenant_id !== id),
    }));
  },

  // ── Expenses ────────────────────────────────────────────────────────────
  addExpense: async (data) => {
    const expense = await api<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
    set(s => ({ expenses: [expense, ...s.expenses] }));
  },

  deleteExpense: async (id) => {
    await api(`/api/expenses/${id}`, { method: 'DELETE' });
    set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }));
  },

  // ── Installments ────────────────────────────────────────────────────────
  markInstallmentPaid: async (id, method, reference) => {
    const updated = await api<PaymentInstallment>(`/api/installments/${id}`, {
      method: 'POST', body: JSON.stringify({ method, reference }),
    });
    set(s => ({
      installments: s.installments.map(i => i.id === id ? updated : i),
    }));
  },

  // ── Notifications (in-memory only) ──────────────────────────────────────
  addNotification: (n) => {
    const note: Notification = { ...n, id: `n${Date.now()}`, at: new Date().toISOString(), read: false };
    set(s => ({ notifications: [note, ...s.notifications] }));
  },

  markAllRead: () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
  },
}));
