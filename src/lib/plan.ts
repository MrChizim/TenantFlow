import type { SupabaseClient } from '@supabase/supabase-js';

export type Plan = 'free' | 'trial' | 'pro';

export interface UserProfile {
  id: string;
  plan: Plan;
  trial_ends_at: string | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
}

export const FREE_LIMITS = { properties: 1, tenants: 3 };

export async function getProfile(client: SupabaseClient, userId: string): Promise<UserProfile> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export function isProActive(profile: UserProfile): boolean {
  if (profile.plan === 'pro') return true;
  if (profile.plan === 'trial' && profile.trial_ends_at) {
    return new Date(profile.trial_ends_at) > new Date();
  }
  return false;
}

export async function canAddProperty(client: SupabaseClient, userId: string, currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getProfile(client, userId);
  if (isProActive(profile)) return { allowed: true };
  if (currentCount >= FREE_LIMITS.properties) {
    return { allowed: false, reason: `Free plan is limited to ${FREE_LIMITS.properties} property. Upgrade to Pro for unlimited.` };
  }
  return { allowed: true };
}

export async function canAddTenant(client: SupabaseClient, userId: string, currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getProfile(client, userId);
  if (isProActive(profile)) return { allowed: true };
  if (currentCount >= FREE_LIMITS.tenants) {
    return { allowed: false, reason: `Free plan is limited to ${FREE_LIMITS.tenants} tenants. Upgrade to Pro for unlimited.` };
  }
  return { allowed: true };
}
