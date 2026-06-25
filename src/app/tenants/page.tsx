'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatNaira, formatDate, daysUntil } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';

type Filter = 'all' | 'active' | 'expiring' | 'expired';

export default function TenantsPage() {
  const tenants = useStore(s => s.tenants);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => tenants.filter(t => {
    const statusOk = filter === 'all' || t.status === filter;
    const q = search.trim().toLowerCase();
    const searchOk = !q
      || `${t.first_name} ${t.last_name}`.toLowerCase().includes(q)
      || t.phone.includes(q)
      || (t.property?.name ?? '').toLowerCase().includes(q)
      || t.unit.toLowerCase().includes(q);
    return statusOk && searchOk;
  }), [tenants, filter, search]);

  const counts = useMemo(() => ({
    all: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    expiring: tenants.filter(t => t.status === 'expiring').length,
    expired: tenants.filter(t => t.status === 'expired').length,
  }), [tenants]);

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
            Tenants
          </h1>
          <p style={{ color: '#A8A59E', fontSize: 13.5 }}>{tenants.length} tenant{tenants.length !== 1 ? 's' : ''} across all properties</p>
        </div>
        <Link href="/tenants/new" className="btn btn-dark page-header-btn" style={{ textDecoration: 'none' }}>
          <Plus size={14} strokeWidth={2.5} /> Add tenant
        </Link>
      </div>

      {/* Filter + search bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid #ECEAE5' }}>
          <Search size={14} color="#B8B5AE" style={{ flexShrink: 0 }} />
          <input
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1C1B18', width: '100%', minWidth: 0 }}
            placeholder="Search by name, phone, property or unit…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8B5AE', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'active', 'expiring', 'expired'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: 99, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: filter === f ? '#1C1B18' : '#fff',
                color: filter === f ? '#fff' : '#8C8880',
                border: filter === f ? '1px solid transparent' : '1px solid #ECEAE5',
                transition: 'all 0.12s',
                textTransform: 'capitalize',
              } as React.CSSProperties}
            >
              {f} <span style={{ opacity: filter === f ? 0.5 : 0.4, fontSize: 12 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16 }}>
          <p style={{ fontSize: 15, color: '#1C1B18', fontWeight: 500, marginBottom: 6 }}>No tenants yet</p>
          <p style={{ fontSize: 13, color: '#A8A59E', marginBottom: 20 }}>Add your first tenant to start tracking leases and payments.</p>
          <Link href="/tenants/new" className="btn btn-dark" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> Add tenant
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="tenants-table" style={{ border: '1px solid #ECEAE5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 700 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 180px 140px 160px 110px 110px 32px', padding: '11px 24px', borderBottom: '1px solid #ECEAE5', background: '#FAFAF8' }}>
                  {['Tenant', 'Property', 'Rent / yr', 'Lease expires', 'Status', 'Payment', ''].map(h => (
                    <p key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#B8B5AE' }}>{h}</p>
                  ))}
                </div>
                {filtered.map((t) => {
                  const days = daysUntil(t.lease_end);
                  const ps = t.payment_status ?? 'paid';
                  return (
                    <Link key={t.id} href={`/tenants/${t.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '220px 180px 140px 160px 110px 110px 32px',
                        padding: '18px 24px', borderTop: '1px solid #F2F1EE',
                        alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1B18', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.first_name} {t.last_name}</p>
                          <p style={{ fontSize: 12, color: '#A8A59E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.phone}</p>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, color: '#1C1B18', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.property?.name}</p>
                          <p style={{ fontSize: 12, color: '#A8A59E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.unit}</p>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18', whiteSpace: 'nowrap' }}>{formatNaira(t.rent_amount)}</p>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, color: '#1C1B18', marginBottom: 2, whiteSpace: 'nowrap' }}>{formatDate(t.lease_end)}</p>
                          <p style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', color: days < 0 ? '#C0392B' : days <= 90 ? '#B45309' : '#A8A59E' }}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </p>
                        </div>
                        <StatusBadge status={t.status} />
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          padding: '3px 9px', borderRadius: 99, whiteSpace: 'nowrap',
                          background: ps === 'owing' ? '#FEF3F2' : ps === 'uncertain' ? '#FFF8ED' : '#E8F5EE',
                          color: ps === 'owing' ? '#C0392B' : ps === 'uncertain' ? '#B45309' : '#1A7F4B',
                          border: `1px solid ${ps === 'owing' ? '#F9BDBA' : ps === 'uncertain' ? '#F5D78E' : '#A8E0B8'}`,
                        }}>
                          {ps === 'owing' ? 'Owing' : ps === 'uncertain' ? 'Uncertain' : 'Paid'}
                        </span>
                        <ArrowUpRight size={15} color="#C4992A" />
                      </div>
                    </Link>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: '48px 0', textAlign: 'center', color: '#A8A59E', fontSize: 14 }}>No tenants match your search.</div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="tenants-cards" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
            {filtered.map((t) => {
              const days = daysUntil(t.lease_end);
              const ps = t.payment_status ?? 'paid';
              return (
                <Link key={t.id} href={`/tenants/${t.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.first_name} {t.last_name}</p>
                        <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{t.phone}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          padding: '3px 9px', borderRadius: 99,
                          background: ps === 'owing' ? '#FEF3F2' : ps === 'uncertain' ? '#FFF8ED' : '#E8F5EE',
                          color: ps === 'owing' ? '#C0392B' : ps === 'uncertain' ? '#B45309' : '#1A7F4B',
                          border: `1px solid ${ps === 'owing' ? '#F9BDBA' : ps === 'uncertain' ? '#F5D78E' : '#A8E0B8'}`,
                        }}>
                          {ps === 'owing' ? 'Owing' : ps === 'uncertain' ? 'Uncertain' : 'Paid'}
                        </span>
                        <StatusBadge status={t.status} />
                        <ArrowUpRight size={14} color="#C4992A" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#FAFAF8', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#A8A59E', flexShrink: 0 }}>Property</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1B18', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.property?.name} · {t.unit}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#A8A59E' }}>Rent</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1B18' }}>{formatNaira(t.rent_amount)}/yr</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#A8A59E' }}>Expires</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: days < 0 ? '#C0392B' : days <= 90 ? '#B45309' : '#1C1B18' }}>
                          {formatDate(t.lease_end)} · {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#A8A59E', fontSize: 14 }}>No tenants match your search.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
