'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Zap, AlertCircle, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/plan';
import { isProActive, FREE_LIMITS } from '@/lib/plan';
import { useStore } from '@/lib/store';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? '');
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data as UserProfile);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade() {
    setUpgrading(true); setError('');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to start checkout');
      window.location.href = json.url;
    } catch (e) { setError((e as Error).message); setUpgrading(false); }
  }

  async function handleCancel() {
    setCancelling(true); setError('');
    try {
      const res = await fetch('/api/cancel', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to cancel');
      setProfile(p => p ? { ...p, plan: 'free', paystack_subscription_code: null } : p);
      setConfirmCancel(false);
    } catch (e) { setError((e as Error).message); } finally { setCancelling(false); }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const isPro = profile ? isProActive(profile) : false;
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Account and billing</p>
      </div>

      {/* Account */}
      <div className="surface" style={{ padding: '20px 24px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Account</p>
        <p style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{userEmail}</p>
      </div>

      {/* Plan */}
      {!loading && (
        <div className="surface" style={{ padding: '20px 24px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Plan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {isPro ? <Crown size={18} color="#C4992A" /> : <Zap size={18} color="var(--text-3)" />}
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              {isPro ? 'Pro' : 'Free'}
            </span>
            {profile?.plan === 'trial' && trialDaysLeft !== null && (
              <span style={{ fontSize: 12, fontWeight: 600, background: '#FDF8EC', border: '1px solid #EDD98A', color: '#B8880E', borderRadius: 99, padding: '3px 10px' }}>
                {trialDaysLeft}d trial left
              </span>
            )}
            {isPro && <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 'auto' }}>₦10,000/year</span>}
          </div>

          {/* Usage bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: isPro ? 16 : 20 }}>
            {[
              { label: 'Properties', count: properties.length, limit: isPro ? null : FREE_LIMITS.properties },
              { label: 'Tenants', count: tenants.length, limit: isPro ? null : FREE_LIMITS.tenants },
            ].map(({ label, count, limit }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontSize: 13, color: limit && count >= limit ? '#E5484D' : 'var(--text-3)' }}>
                    {count}{limit ? ` / ${limit}` : ''}{!limit && <span style={{ marginLeft: 4, fontSize: 11 }}>unlimited</span>}
                  </span>
                </div>
                {limit && (
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (count / limit) * 100)}%`, background: count >= limit ? '#E5484D' : '#C4992A', borderRadius: 99 }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upgrade */}
          {!isPro && (
            <>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                  <AlertCircle size={13} color="#E5484D" />
                  <span style={{ fontSize: 13, color: '#E5484D' }}>{error}</span>
                </div>
              )}
              <div style={{ background: '#1C1B18', borderRadius: 14, padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {['Unlimited properties', 'Unlimited tenants', 'Renewal reminders', 'Reports & ROI'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={13} color="#C4992A" strokeWidth={2.5} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleUpgrade} disabled={upgrading}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#C4992A,#E8C94A)', border: 'none', color: '#1C1B18', fontSize: 14, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer', opacity: upgrading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {upgrading ? 'Opening checkout...' : 'Upgrade — ₦10,000/year · 7-day free trial'}
                </button>
              </div>
            </>
          )}

          {/* Cancel */}
          {isPro && (
            !confirmCancel
              ? <button onClick={() => setConfirmCancel(true)} style={{ fontSize: 13, color: '#E5484D', background: 'none', border: '1px solid rgba(229,72,77,0.3)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>Cancel subscription</button>
              : <div style={{ background: 'rgba(229,72,77,0.06)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Cancel your subscription?</p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.6 }}>You'll lose Pro access immediately. Your data stays safe.</p>
                  {error && <p style={{ fontSize: 13, color: '#E5484D', marginBottom: 10 }}>{error}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCancel} disabled={cancelling} style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#E5484D', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
                      {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                    </button>
                    <button onClick={() => { setConfirmCancel(false); setError(''); }} style={{ fontSize: 13, color: 'var(--text-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
                      Keep Pro
                    </button>
                  </div>
                </div>
          )}
        </div>
      )}

      {/* Sign out */}
      <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginTop: 4 }}>
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}
