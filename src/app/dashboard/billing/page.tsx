'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Zap, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/plan';
import { isProActive, FREE_LIMITS } from '@/lib/plan';
import { useStore } from '@/lib/store';

export default function BillingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data as UserProfile);
      setLoading(false);
    }
    load();
  }, []);

  async function handleCancel() {
    setCancelling(true);
    setError('');
    try {
      const res = await fetch('/api/cancel', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to cancel');
      setProfile(p => p ? { ...p, plan: 'free', paystack_subscription_code: null } : p);
      setConfirmCancel(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to start checkout');
      window.location.href = json.url;
    } catch (e) {
      setError((e as Error).message);
      setUpgrading(false);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--line)', borderTopColor: 'var(--text-1)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const isPro = profile ? isProActive(profile) : false;
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Billing & plan</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Manage your TenantFlow subscription</p>
      </div>

      {/* Current plan */}
      <div className="surface" style={{ padding: '24px 28px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Current plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isPro
                ? <Crown size={20} color="#C4992A" />
                : <Zap size={20} color="var(--text-3)" />
              }
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                {isPro ? 'Pro' : 'Free'}
              </span>
              {profile?.plan === 'trial' && trialDaysLeft !== null && (
                <span style={{ fontSize: 12, fontWeight: 600, background: '#FDF8EC', border: '1px solid #EDD98A', color: '#B8880E', borderRadius: 99, padding: '3px 10px' }}>
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in trial
                </span>
              )}
            </div>
          </div>
          {isPro && (
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>₦10,000 / year</span>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="surface" style={{ padding: '24px 28px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>Usage</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Properties', count: properties.length, limit: isPro ? null : FREE_LIMITS.properties },
            { label: 'Tenants', count: tenants.length, limit: isPro ? null : FREE_LIMITS.tenants },
          ].map(({ label, count, limit }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{label}</span>
                <span style={{ fontSize: 13, color: limit && count >= limit ? '#E5484D' : 'var(--text-3)' }}>
                  {count}{limit ? ` / ${limit}` : ''}
                  {!limit && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-3)' }}>unlimited</span>}
                </span>
              </div>
              {limit && (
                <div style={{ height: 4, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (count / limit) * 100)}%`, background: count >= limit ? '#E5484D' : '#C4992A', borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade card — only shown on free/expired trial */}
      {!isPro && (
        <div style={{ background: '#1C1B18', borderRadius: 20, padding: '32px 28px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Crown size={20} color="#C4992A" />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Upgrade to Pro</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
            {['Unlimited properties', 'Unlimited tenants', 'Renewal reminders', 'Reports & ROI', 'Priority support'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={14} color="#C4992A" strokeWidth={2.5} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦10,000</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/year · 7-day free trial</span>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,72,77,0.12)', border: '1px solid rgba(229,72,77,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <AlertCircle size={14} color="#E5484D" />
              <span style={{ fontSize: 13, color: '#E5484D' }}>{error}</span>
            </div>
          )}
          <button onClick={handleUpgrade} disabled={upgrading}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', border: 'none', color: '#1C1B18', fontSize: 14, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer', opacity: upgrading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {upgrading
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1C1B18', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Opening checkout...</>
              : 'Start 7-day free trial'
            }
          </button>
        </div>
      )}

      {isPro && (
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>Subscription</p>
          {!confirmCancel ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Your Pro plan renews annually at <strong>₦10,000</strong>.</p>
              <button onClick={() => setConfirmCancel(true)}
                style={{ fontSize: 13, color: '#E5484D', background: 'none', border: '1px solid rgba(229,72,77,0.3)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>
                Cancel subscription
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(229,72,77,0.06)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 14, padding: '20px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Cancel your subscription?</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.6 }}>You'll lose access to Pro features immediately. Your data stays safe.</p>
              {error && <p style={{ fontSize: 13, color: '#E5484D', marginBottom: 12 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCancel} disabled={cancelling}
                  style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#E5484D', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1 }}>
                  {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                </button>
                <button onClick={() => { setConfirmCancel(false); setError(''); }}
                  style={{ fontSize: 13, color: 'var(--text-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>
                  Keep Pro
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
