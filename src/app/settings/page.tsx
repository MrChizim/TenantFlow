'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Zap, AlertCircle, LogOut, User, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/plan';
import { isProActive, FREE_LIMITS } from '@/lib/plan';
import { useStore } from '@/lib/store';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon size={13} color="var(--text-3)" />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{title}</p>
      </div>
      <div className="surface" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, danger, onClick }: { label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 20px', borderBottom: '1px solid var(--line)',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'background 0.1s' : undefined,
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 14, color: danger ? '#E5484D' : 'var(--text-1)', fontWeight: 400 }}>{label}</span>
      {value && <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{value}</span>}
    </div>
  );
}

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
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Settings</h1>
      </div>

      {/* Account */}
      <Section title="Account" icon={User}>
        <Row label={userEmail || '—'} />
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: 'var(--text-1)' }}>Plan</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!loading && (isPro
              ? <><Crown size={13} color="#C4992A" /><span style={{ fontSize: 13.5, fontWeight: 600, color: '#C4992A' }}>Pro</span></>
              : <><Zap size={13} color="var(--text-3)" /><span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>Free</span></>
            )}
            {profile?.plan === 'trial' && trialDaysLeft !== null && (
              <span style={{ fontSize: 11, fontWeight: 700, background: '#FDF8EC', border: '1px solid #EDD98A', color: '#B8880E', borderRadius: 99, padding: '2px 8px' }}>
                {trialDaysLeft}d left
              </span>
            )}
          </div>
        </div>
        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Properties', count: properties.length, limit: isPro ? null : FREE_LIMITS.properties },
              { label: 'Tenants', count: tenants.length, limit: isPro ? null : FREE_LIMITS.tenants },
            ].map(({ label, count, limit }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontSize: 13, color: limit && count >= limit ? '#E5484D' : 'var(--text-3)' }}>
                    {count}{limit ? ` / ${limit}` : ' · unlimited'}
                  </span>
                </div>
                {limit && (
                  <div style={{ height: 3, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (count / limit) * 100)}%`, background: count >= limit ? '#E5484D' : '#C4992A', borderRadius: 99 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Billing */}
      {!loading && (
        <Section title="Billing" icon={CreditCard}>
          {!isPro ? (
            <div style={{ padding: '24px 20px' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <AlertCircle size={13} color="#E5484D" />
                  <span style={{ fontSize: 13, color: '#E5484D' }}>{error}</span>
                </div>
              )}
              <div style={{ background: '#1C1B18', borderRadius: 14, padding: '20px 20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Crown size={15} color="#C4992A" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Upgrade to Pro</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {['Unlimited properties', 'Unlimited tenants', 'Renewal reminders', 'Reports & ROI', 'Priority support'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={12} color="#C4992A" strokeWidth={2.5} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>₦10,000</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>/year</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>· 7-day free trial</span>
                </div>
                <button onClick={handleUpgrade} disabled={upgrading}
                  style={{ width: '100%', padding: '13px', borderRadius: 11, background: 'linear-gradient(135deg,#C4992A,#E8C94A)', border: 'none', color: '#1C1B18', fontSize: 14, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer', opacity: upgrading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {upgrading
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#1C1B18', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Opening checkout...</>
                    : 'Start free trial'
                  }
                </button>
              </div>
            </div>
          ) : (
            <>
              <Row label="Plan renews annually" value="₦10,000 / year" />
              {!confirmCancel
                ? <Row label="Cancel subscription" danger onClick={() => setConfirmCancel(true)} />
                : (
                  <div style={{ padding: '16px 20px', background: 'rgba(229,72,77,0.04)' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Cancel your subscription?</p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.6 }}>You'll lose Pro access immediately. Your data stays safe.</p>
                    {error && <p style={{ fontSize: 13, color: '#E5484D', marginBottom: 10 }}>{error}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleCancel} disabled={cancelling}
                        style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#E5484D', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', opacity: cancelling ? 0.7 : 1 }}>
                        {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                      </button>
                      <button onClick={() => { setConfirmCancel(false); setError(''); }}
                        style={{ fontSize: 13, color: 'var(--text-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
                        Keep Pro
                      </button>
                    </div>
                  </div>
                )
              }
            </>
          )}
        </Section>
      )}

      {/* Sign out */}
      <Section title="Danger zone" icon={LogOut}>
        <Row label="Sign out" danger onClick={handleSignOut} />
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
