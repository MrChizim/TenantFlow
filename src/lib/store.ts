'use client';

import { create } from 'zustand';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tenant, Property, Expense, PaymentInstallment, RentHistoryEntry } from '@/types';
import * as db from '@/lib/db';

export interface Notification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
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
  loadFromSupabase: (client: SupabaseClient, userId: string) => Promise<void>;
  clearAll: () => void;

  // Properties
  addProperty: (client: SupabaseClient, userId: string, data: Omit<Property, 'id' | 'created_at'>) => Promise<void>;
  updateProperty: (client: SupabaseClient, id: string, data: Partial<Omit<Property, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  deleteProperty: (client: SupabaseClient, id: string) => Promise<void>;

  // Tenants
  addTenant: (client: SupabaseClient, userId: string, data: Omit<Tenant, 'id' | 'created_at' | 'status' | 'property'>) => Promise<void>;
  updateTenant: (client: SupabaseClient, id: string, data: Partial<Omit<Tenant, 'id' | 'created_at' | 'status' | 'property' | 'user_id'>>) => Promise<void>;
  updateTenantRent: (client: SupabaseClient, id: string, newAmount: number, note?: string) => Promise<void>;
  renewTenantLease: (client: SupabaseClient, id: string, newLeaseEnd: string) => Promise<void>;
  deleteTenant: (client: SupabaseClient, id: string) => Promise<void>;

  // Expenses
  addExpense: (client: SupabaseClient, userId: string, data: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  deleteExpense: (client: SupabaseClient, id: string) => Promise<void>;

  // Installments
  markInstallmentPaid: (client: SupabaseClient, id: string, method: 'bank_transfer' | 'cash' | 'online', reference?: string) => Promise<void>;

  // Notifications (client-only, not persisted)
  addNotification: (n: Omit<Notification, 'id' | 'at' | 'read'>) => void;
  markAllRead: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  tenants: [],
  properties: [],
  expenses: [],
  installments: [],
  notifications: [],
  isLoading: false,
  error: null,

  loadFromSupabase: async (client, userId) => {
    // Show cached data instantly while fresh data loads
    try {
      const cached = localStorage.getItem(`tf_cache_${userId}`);
      if (cached) {
        const { properties, tenants, expenses, installments } = JSON.parse(cached);
        set({ properties, tenants, expenses, installments, isLoading: true });
      } else {
        set({ isLoading: true, error: null });
      }
    } catch { set({ isLoading: true, error: null }); }

    try {
      const properties = await db.fetchProperties(client, userId);
      const [tenants, expenses, installments] = await Promise.all([
        db.fetchTenants(client, userId, properties),
        db.fetchExpenses(client, userId),
        db.fetchInstallments(client, userId),
      ]);
      set({ properties, tenants, expenses, installments, isLoading: false });
      try {
        localStorage.setItem(`tf_cache_${userId}`, JSON.stringify({ properties, tenants, expenses, installments }));
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
  addProperty: async (client, userId, data) => {
    const property = await db.createProperty(client, userId, data);
    set(s => ({ properties: [property, ...s.properties] }));
  },

  updateProperty: async (client, id, data) => {
    const updated = await db.updateProperty(client, id, data);
    set(s => ({ properties: s.properties.map(p => p.id === id ? updated : p) }));
  },

  deleteProperty: async (client, id) => {
    await db.deleteProperty(client, id);
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
  addTenant: async (client, userId, data) => {
    const { tenant, installments: newInstallments } = await db.createTenant(
      client, userId, data, get().properties
    );
    set(s => ({
      tenants: [tenant, ...s.tenants],
      installments: [...s.installments, ...newInstallments],
    }));
  },

  updateTenant: async (client, id, data) => {
    const updated = await db.updateTenant(client, id, data, get().properties);
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  updateTenantRent: async (client, id, newAmount, note) => {
    const current = get().tenants.find(t => t.id === id);
    if (!current) return;
    const updated = await db.updateTenantRent(client, id, newAmount, note, current);
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  renewTenantLease: async (client, id, newLeaseEnd) => {
    const current = get().tenants.find(t => t.id === id);
    if (!current) return;
    const updated = await db.renewTenantLease(client, id, newLeaseEnd, current);
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? updated : t) }));
  },

  deleteTenant: async (client, id) => {
    await db.deleteTenant(client, id);
    set(s => ({
      tenants: s.tenants.filter(t => t.id !== id),
      installments: s.installments.filter(i => i.tenant_id !== id),
    }));
  },

  // ── Expenses ────────────────────────────────────────────────────────────
  addExpense: async (client, userId, data) => {
    const expense = await db.createExpense(client, userId, data);
    set(s => ({ expenses: [expense, ...s.expenses] }));
  },

  deleteExpense: async (client, id) => {
    await db.deleteExpense(client, id);
    set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }));
  },

  // ── Installments ────────────────────────────────────────────────────────
  markInstallmentPaid: async (client, id, method, reference) => {
    const updated = await db.markInstallmentPaid(client, id, method, reference);
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
