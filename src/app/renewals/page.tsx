'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowUpRight, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, formatDate, daysUntil } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Tenant } from '@/types';

function ConfirmModal({ tenant, onConfirm, onCancel, loading }: { tenant: Tenant; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(28,27,24,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onCancel}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1B18', marginBottom: 4 }}>Confirm renewal</p>
            <p style={{ fontSize: 13, color: '#A8A59E' }}>Extends the lease by 1 year from today</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A8A59E' }}><X size={16} /></button>
        </div>
        <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[['Tenant', `${tenant.first_name} ${tenant.last_name}`], ['Unit', `${tenant.property?.name} · ${tenant.unit}`], ['Annual rent', formatNaira(tenant.rent_amount)]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#A8A59E' }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1B18' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, background: '#1C1B18', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
            {loading ? '...' : 'Yes, renew'}
          </button>
          <button onClick={onCancel} style={{ flex: 1, background: '#F2F1EE', color: '#6B6860', border: 'none', padding: '10px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export default function RenewalsPage() {
  const tenants = useStore(s => s.tenants);
  const renewTenantLease = useStore(s => s.renewTenantLease);
  const addNotification = useStore(s => s.addNotification);
  const [renewed, setRenewed] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<Tenant | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);

  const sorted = useMemo(() => [...tenants].sort((a, b) => daysUntil(a.lease_end) - daysUntil(b.lease_end)), [tenants]);
  const sections = useMemo(() => [
    { title: 'Overdue',          color: '#C0392B', items: sorted.filter(t => daysUntil(t.lease_end) < 0) },
    { title: 'Next 90 days',     color: '#B45309', items: sorted.filter(t => { const d = daysUntil(t.lease_end); return d >= 0 && d <= 90; }) },
    { title: '3 – 6 months',     color: '#D97706', items: sorted.filter(t => { const d = daysUntil(t.lease_end); return d > 90 && d <= 180; }) },
    { title: '6 – 12 months',    color: '#C4992A', items: sorted.filter(t => { const d = daysUntil(t.lease_end); return d > 180 && d <= 365; }) },
    { title: 'More than a year', color: '#1A7F4B', items: sorted.filter(t => daysUntil(t.lease_end) > 365) },
  ].filter(s => s.items.length > 0), [sorted]);

  async function handleConfirmRenew() {
    if (!confirming) return;
    setRenewLoading(true);
    try {
      const supabase = createClient();
      const newLeaseEnd = addOneYear(confirming.lease_end ?? new Date().toISOString().split('T')[0]);
      await renewTenantLease(supabase, confirming.id, newLeaseEnd);
      setRenewed(p => new Set([...p, confirming.id]));
      addNotification({ title: 'Lease renewed', body: `${confirming.first_name} ${confirming.last_name}'s lease extended to ${newLeaseEnd}.` });
      setConfirming(null);
    } finally { setRenewLoading(false); }
  }

  return (
    <div style={{ maxWidth: 920 }}>
      {confirming && <ConfirmModal tenant={confirming} onConfirm={handleConfirmRenew} onCancel={() => setConfirming(null)} loading={renewLoading} />}

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: '#1C1B18', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>Renewals</h1>
        <p style={{ color: '#A8A59E', fontSize: 14 }}>Track and manage lease renewals across your portfolio</p>
      </div>

      {tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16 }}>
          <p style={{ fontSize: 14, color: '#A8A59E' }}>No tenants yet. Add tenants to track renewals.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sections.map(({ title, color, items }) => (
            <div key={title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18' }}>{title}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color, background: `${color}18`, padding: '2px 8px', borderRadius: 99 }}>{items.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {items.map(t => {
                  const days = daysUntil(t.lease_end);
                  const isRenewed = renewed.has(t.id);
                  return (
                    <div key={t.id} style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>{t.first_name} {t.last_name}</p>
                          <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{t.property?.name} · {t.unit}</p>
                        </div>
                        {isRenewed
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#1A7F4B', background: '#F0FAF5', border: '1px solid #C3E9D5', padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}><CheckCircle2 size={11} /> Renewed</span>
                          : <StatusBadge status={t.status} />
                        }
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 14px', background: '#FAFAF8', borderRadius: 10 }}>
                        {[['Rent', `${formatNaira(t.rent_amount)}/yr`], ['Expires', formatDate(t.lease_end)], ['Status', days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`]].map(([l, v], i) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#A8A59E' }}>{l}</span>
                            <span style={{ fontSize: 12, fontWeight: i === 2 ? 600 : 500, color: i === 2 ? (days < 0 ? '#C0392B' : '#B45309') : '#1C1B18' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!isRenewed && (
                          <button onClick={() => setConfirming(t)} style={{ flex: 1, background: '#1C1B18', color: '#fff', border: 'none', padding: '8px 0', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                          >Renew</button>
                        )}
                        <Link href={`/tenants/${t.id}`} style={{ flex: isRenewed ? 1 : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1px solid #ECEAE5', background: '#fff', color: '#6B6860', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background 0.12s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4F3EF'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                        >View <ArrowUpRight size={13} /></Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
