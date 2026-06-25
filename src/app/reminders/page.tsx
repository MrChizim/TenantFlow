'use client';

import { useMemo } from 'react';
import { MessageCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { formatDate, formatNaira, daysUntil } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';

function buildWhatsAppMessage(tenantName: string, daysLeft: number, leaseEnd: string, rent: number, propertyName: string): string {
  if (daysLeft < 0) {
    return `Hello ${tenantName}, your rent at ${propertyName} expired on ${formatDate(leaseEnd)} (${Math.abs(daysLeft)} days ago). Kindly make payment of ${formatNaira(rent)} to avoid any issues. Thank you.`;
  }
  if (daysLeft <= 30) {
    return `Hello ${tenantName}, your rent at ${propertyName} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${formatDate(leaseEnd)}. Please prepare to renew (${formatNaira(rent)}). Thank you.`;
  }
  if (daysLeft <= 90) {
    return `Hello ${tenantName}, just a reminder that your rent at ${propertyName} expires in about ${Math.round(daysLeft / 30)} months on ${formatDate(leaseEnd)}. Amount due: ${formatNaira(rent)}. Thank you.`;
  }
  return `Hello ${tenantName}, this is a friendly reminder that your rent at ${propertyName} will expire on ${formatDate(leaseEnd)}. Amount due: ${formatNaira(rent)}. Thank you.`;
}

function urgencyColor(days: number) {
  if (days < 0) return { color: '#C0392B', bg: '#FEF3F2', border: '#F9BDBA' };
  if (days <= 30) return { color: '#C0392B', bg: '#FEF3F2', border: '#F9BDBA' };
  if (days <= 90) return { color: '#B45309', bg: '#FFF8ED', border: '#F5D78E' };
  return { color: '#C4992A', bg: '#FDF8EC', border: '#EDD98A' };
}

export default function RemindersPage() {
  const tenants = useStore(s => s.tenants);

  const needsReminder = useMemo(() =>
    tenants
      .filter(t => t.lease_end)
      .filter(t => daysUntil(t.lease_end) <= 365)
      .sort((a, b) => daysUntil(a.lease_end) - daysUntil(b.lease_end)),
    [tenants]
  );

  const owing = useMemo(() =>
    tenants.filter(t => t.payment_status === 'owing' || t.payment_status === 'uncertain'),
    [tenants]
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.02em', marginBottom: 4 }}>Reminders</h1>
        <p style={{ color: '#A8A59E', fontSize: 13.5 }}>Tap to send a WhatsApp message directly to your tenant</p>
      </div>

      {/* Owing / uncertain tenants */}
      {owing.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={14} color="#C0392B" />
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18' }}>Payment issues</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {owing.map(t => {
              const ps = t.payment_status ?? 'paid';
              const msg = ps === 'owing'
                ? `Hello ${t.first_name}, we noticed your rent at ${t.property?.name ?? 'the property'} has not been paid yet (${formatNaira(t.rent_amount)}/year). Kindly make payment at your earliest convenience. Thank you.`
                : `Hello ${t.first_name}, we wanted to check in regarding your tenancy at ${t.property?.name ?? 'the property'}. Please let us know if you'll be renewing or vacating. Thank you.`;
              const waNum = (t.whatsapp || t.phone).replace(/\D/g, '').replace(/^0/, '234');
              const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

              return (
                <div key={t.id} style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>{t.first_name} {t.last_name}</p>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: 99,
                        background: ps === 'owing' ? '#FEF3F2' : '#FFF8ED',
                        color: ps === 'owing' ? '#C0392B' : '#B45309',
                        border: `1px solid ${ps === 'owing' ? '#F9BDBA' : '#F5D78E'}`,
                      }}>
                        {ps === 'owing' ? 'Owing' : 'Uncertain'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#A8A59E' }}>{t.property?.name} · {formatNaira(t.rent_amount)}/yr</p>
                  </div>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiring leases */}
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18', marginBottom: 14 }}>
          Lease renewals {needsReminder.length > 0 ? `(${needsReminder.length})` : ''}
        </p>

        {needsReminder.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#1C1B18', fontWeight: 500, marginBottom: 6 }}>No upcoming renewals</p>
            <p style={{ fontSize: 13, color: '#A8A59E' }}>Tenants whose lease expires within a year will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {needsReminder.map(t => {
              const days = daysUntil(t.lease_end);
              const urg = urgencyColor(days);
              const waNum = (t.whatsapp || t.phone).replace(/\D/g, '').replace(/^0/, '234');
              const msg = buildWhatsAppMessage(`${t.first_name}`, days, t.lease_end!, t.rent_amount, t.property?.name ?? 'the property');
              const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

              return (
                <div key={t.id} style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>{t.first_name} {t.last_name}</p>
                        <StatusBadge status={t.status} />
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: urg.bg, color: urg.color, border: `1px solid ${urg.border}` }}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#A8A59E' }}>{t.property?.name} · {t.unit} · {formatNaira(t.rent_amount)}/yr</p>
                      <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>Expires {formatDate(t.lease_end)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link href={`/tenants/${t.id}`} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-2)', textDecoration: 'none', fontSize: 13 }}>
                        <ArrowUpRight size={15} />
                      </Link>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
                        <MessageCircle size={15} /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
