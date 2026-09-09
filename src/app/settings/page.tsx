'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Trash2, Receipt } from 'lucide-react';
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

function Row({ label, danger, onClick }: { label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'background 0.1s' : undefined,
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 14, color: danger ? '#E5484D' : 'var(--text-1)', fontWeight: 400 }}>{label}</span>
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [savingBusinessName, setSavingBusinessName] = useState(false);
  const [businessNameSaved, setBusinessNameSaved] = useState(false);
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setBusinessName(data.business_name ?? '');
      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveBusinessName() {
    setSavingBusinessName(true); setBusinessNameSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName || null }),
      });
      setBusinessNameSaved(true);
      setTimeout(() => setBusinessNameSaved(false), 2000);
    } finally { setSavingBusinessName(false); }
  }

  async function handleSignOut() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Portfolio overview</p>
      </div>

      {/* Account */}
      <Section title="Portfolio" icon={User}>
        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Properties', count: properties.length },
              { label: 'Tenants', count: tenants.length },
            ].map(({ label, count }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Receipts */}
      <Section title="Receipts" icon={Receipt}>
        <div style={{ padding: '16px 20px' }}>
          <label style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Landlord / business name</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="field"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Chizim Properties"
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSaveBusinessName}
              disabled={savingBusinessName || loading}
              className="btn btn-dark"
              style={{ whiteSpace: 'nowrap' }}
            >
              {savingBusinessName ? '...' : businessNameSaved ? 'Saved' : 'Save'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.6 }}>
            This appears at the top of every payment receipt you generate for tenants.
          </p>
        </div>
      </Section>

      {/* Sign out */}
      <Section title="Session" icon={Trash2}>
        <Row label="Sign out" onClick={handleSignOut} />
      </Section>
    </div>
  );
}
