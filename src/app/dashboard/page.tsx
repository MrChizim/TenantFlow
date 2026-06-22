'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Building2, Users, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatNaira, formatDate, daysUntil } from '@/lib/utils';
import { useStore } from '@/lib/store';


export default function DashboardPage() {
  const tenants = useStore(s => s.tenants);
  const properties = useStore(s => s.properties);

  const urgent = useMemo(() =>
    tenants
      .filter(t => t.status === 'expiring' || t.status === 'expired')
      .sort((a, b) => daysUntil(a.lease_end) - daysUntil(b.lease_end)),
    [tenants]
  );

  const stats = useMemo(() => ({
    total_annual_rent: tenants.reduce((s, t) => s + t.rent_amount, 0),
    total_properties: properties.length,
    total_tenants: tenants.length,
    active_tenants: tenants.filter(t => t.status === 'active').length,
    expiring_tenants: tenants.filter(t => t.status === 'expiring').length,
    expired_tenants: tenants.filter(t => t.status === 'expired').length,
  }), [tenants, properties]);

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ maxWidth: 1080 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: '#B8B5AE', marginBottom: 6, letterSpacing: '0.02em' }}>{today}</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.1rem', color: '#1C1B18', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
          Welcome to TenantFlow.
        </h1>
        <p style={{ color: '#A8A59E', fontSize: 14 }}>
          {properties.length === 0
            ? 'Start by adding your first property.'
            : urgent.length > 0
            ? `${urgent.length} lease${urgent.length > 1 ? 's' : ''} need${urgent.length === 1 ? 's' : ''} your attention`
            : 'All leases are in good standing'}
        </p>
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 20, padding: '48px 32px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#F0EFEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Building2 size={22} color="#C4992A" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#1C1B18', marginBottom: 6 }}>No properties yet</p>
          <p style={{ fontSize: 13, color: '#A8A59E', marginBottom: 24 }}>Add a property, then add tenants to start tracking leases.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/properties/new" className="btn btn-dark" style={{ textDecoration: 'none' }}>
              <Building2 size={14} /> Add property
            </Link>
            <Link href="/tenants/new" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <Users size={14} /> Add tenant
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Annual Revenue" value={formatNaira(stats.total_annual_rent)} sub="Combined portfolio" icon={TrendingUp} accent />
        <StatCard label="Properties" value={stats.total_properties} sub="In your portfolio" icon={Building2} />
        <StatCard label="Tenants" value={stats.total_tenants} sub={`${stats.active_tenants} active`} icon={Users} />
        <StatCard label="Need Attention" value={stats.expiring_tenants + stats.expired_tenants} sub="Expiring or overdue" icon={AlertTriangle} />
      </div>

      {/* Main grid */}
      <div className="main-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Properties */}
          <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontWeight: 600, color: '#1C1B18', fontSize: 14 }}>Properties</p>
              <Link href="/properties" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12.5, color: '#C4992A', textDecoration: 'none', fontWeight: 500 }}>
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {properties.map(p => {
                const propTenants = tenants.filter(t => t.property_id === p.id);
                const pct = Math.round((propTenants.length / p.total_units) * 100);
                return (
                  <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 14px', borderRadius: 12,
                      border: '1px solid #F0EFEB',
                      background: '#FAFAF8',
                      transition: 'border-color 0.15s, background 0.15s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4F3EF'; (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; (e.currentTarget as HTMLElement).style.borderColor = '#F0EFEB'; }}
                    >
                      <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', background: '#F0EFEB', flexShrink: 0 }}>
                        {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: '#1C1B18', marginBottom: 3 }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: '#A8A59E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.address}, {p.city}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#C4992A', fontFamily: 'Inter, sans-serif' }}>{pct}%</p>
                        <p style={{ fontSize: 11, color: '#A8A59E', marginTop: 2 }}>{propTenants.length}/{p.total_units} units</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Needs attention */}
          {urgent.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontWeight: 600, color: '#1C1B18', fontSize: 14 }}>Needs Attention</p>
                <Link href="/renewals" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12.5, color: '#C4992A', textDecoration: 'none', fontWeight: 500 }}>
                  Renewals <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="card-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {urgent.map((t) => {
                  const days = daysUntil(t.lease_end);
                  return (
                    <Link key={t.id} href={`/tenants/${t.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '18px 20px', borderRadius: 14,
                        border: '1px solid #F0EFEB', background: '#FAFAF8',
                        transition: 'background 0.12s, border-color 0.12s', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', gap: 14,
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4F3EF'; (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; (e.currentTarget as HTMLElement).style.borderColor = '#F0EFEB'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18' }}>{t.first_name} {t.last_name}</p>
                            <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{t.unit}</p>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#A8A59E' }}>Property</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1B18' }}>{t.property?.name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#A8A59E' }}>Rent</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1B18' }}>{formatNaira(t.rent_amount)}/yr</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#A8A59E' }}>Expires</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: days < 0 ? '#C0392B' : '#B45309' }}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`} · {formatDate(t.lease_end)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Lease health */}
          <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '22px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontWeight: 600, color: '#1C1B18', fontSize: 14, marginBottom: 22 }}>Lease Health</p>
            {[
              { label: 'Active',   count: stats.active_tenants,   color: '#1A7F4B',  track: '#E8F5EE' },
              { label: 'Expiring', count: stats.expiring_tenants, color: '#B45309',  track: '#FFF8ED' },
              { label: 'Expired',  count: stats.expired_tenants,  color: '#C0392B',  track: '#FEF3F2' },
            ].map(({ label, count, color, track }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: '#6B6860' }}>{label}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 400, color }}>{count}</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: track, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: color, width: `${stats.total_tenants > 0 ? (count / stats.total_tenants) * 100 : 0}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '22px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontWeight: 600, color: '#1C1B18', fontSize: 14, marginBottom: 14 }}>Quick links</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/reminders', label: 'Send reminders', sub: 'WhatsApp, SMS, email' },
                { href: '/renewals', label: 'Renewals tracker', sub: 'Expiring leases' },
                { href: '/expenses', label: 'Log expenses', sub: 'Maintenance & repairs' },
                { href: '/roi', label: 'ROI calculator', sub: 'Investment return' },
              ].map(({ href, label, sub }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, background: '#FAFAF8', border: '1px solid #F0EFEB', transition: 'background 0.12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4F3EF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18' }}>{label}</p>
                    <p style={{ fontSize: 11.5, color: '#A8A59E', marginTop: 1 }}>{sub}</p>
                  </div>
                  <ArrowUpRight size={13} color="#C4992A" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: '/tenants/new', label: 'Add a tenant', sub: 'Fill in lease details' },
              { href: '/properties/new', label: 'Add a property', sub: 'Expand your portfolio' },
            ].map(({ href, label, sub }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: '#fff', border: '1px solid #ECEAE5',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; }}
                >
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: '#1C1B18' }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{sub}</p>
                  </div>
                  <ArrowUpRight size={15} color="#C4992A" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
