'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle, Mail, Phone, Send } from 'lucide-react';
import { formatDate, formatNaira, daysUntil } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type Channel = 'whatsapp' | 'sms' | 'email';

const chIcon = { whatsapp: MessageCircle, sms: Phone, email: Mail };
const chColor = { whatsapp: '#1A7F4B', sms: '#C4992A', email: '#2563EB' };
const chBg    = { whatsapp: '#F0FAF5', sms: '#FDF8EC', email: '#EFF6FF' };
const chBorder = { whatsapp: '#C3E9D5', sms: '#F0E0A0', email: '#BFDBFE' };
const msgLabel: Record<string, string> = { '12_months': '12 months', '6_months': '6 months', '3_months': '3 months', '1_month': '1 month' };

export default function RemindersPage() {
  const tenants = useStore(s => s.tenants);
  const addNotification = useStore(s => s.addNotification);
  // Map of tenantId -> set of channels currently sending
  const [sending, setSending] = useState<Record<string, Set<Channel>>>({});
  // Map of tenantId -> set of channels sent
  const [sentChannels, setSentChannels] = useState<Record<string, Set<Channel>>>({});

  const upcoming = useMemo(() =>
    tenants
      .filter(t => { const d = daysUntil(t.lease_end); return d >= 0 && d <= 365; })
      .sort((a, b) => daysUntil(a.lease_end) - daysUntil(b.lease_end)),
    [tenants]
  );

  function nextType(d: number) {
    if (d <= 30) return '1 month'; if (d <= 90) return '3 months'; if (d <= 180) return '6 months'; return '12 months';
  }

  function handleSendChannel(tenantId: string, channel: Channel, tenantName: string) {
    setSending(prev => {
      const s = new Set(prev[tenantId] ?? []);
      s.add(channel);
      return { ...prev, [tenantId]: s };
    });
    setTimeout(() => {
      setSending(prev => {
        const s = new Set(prev[tenantId] ?? []);
        s.delete(channel);
        return { ...prev, [tenantId]: s };
      });
      setSentChannels(prev => {
        const s = new Set(prev[tenantId] ?? []);
        s.add(channel);
        return { ...prev, [tenantId]: s };
      });
      addNotification({ title: 'Reminder sent', body: `${channel.charAt(0).toUpperCase() + channel.slice(1)} reminder sent to ${tenantName}.` });
    }, 900);
  }

  function handleSendAll(tenantId: string, tenantName: string) {
    const channels: Channel[] = ['whatsapp', 'sms', 'email'];
    channels.forEach((ch, i) => {
      setTimeout(() => handleSendChannel(tenantId, ch, tenantName), i * 300);
    });
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: '#1C1B18', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
          Reminders
        </h1>
        <p style={{ color: '#A8A59E', fontSize: 14 }}>Automated WhatsApp, SMS and email reminders for lease renewals</p>
      </div>

      {/* Schedule strip */}
      <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '22px 24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18', marginBottom: 16 }}>Automated schedule</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {[
            { n: '12', label: 'months before', color: '#C4992A', bg: '#FDF8EC', border: '#F0E0A0' },
            { n: '6',  label: 'months before', color: '#B45309', bg: '#FFFBF0', border: '#FCD88A' },
            { n: '3',  label: 'months before', color: '#D97706', bg: '#FFFBF0', border: '#FDE68A' },
            { n: '1',  label: 'month before',  color: '#C0392B', bg: '#FEF3F2', border: '#F9BDBA' },
          ].map(({ n, label, color, bg, border }) => (
            <div key={n} style={{ borderRadius: 14, padding: '16px 18px', background: bg, border: `1px solid ${border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color, lineHeight: 1, marginBottom: 6 }}>{n}</p>
              <p style={{ fontSize: 12.5, color, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {/* Pending */}
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18', marginBottom: 14 }}>Pending reminders</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((t) => {
              const days = daysUntil(t.lease_end);
              const tSent = sentChannels[t.id] ?? new Set<Channel>();
              const tSending = sending[t.id] ?? new Set<Channel>();
              const allSent = tSent.size === 3;

              return (
                <div key={t.id} style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>{t.first_name} {t.last_name}</p>
                      <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{t.property?.name} · {t.unit}</p>
                    </div>
                    <Link href={`/tenants/${t.id}`} style={{ color: '#C4992A', textDecoration: 'none', display: 'flex', flexShrink: 0 }}>
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', background: '#FAFAF8', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#A8A59E' }}>Lease expires</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: days <= 30 ? '#C0392B' : '#B45309' }}>{days}d left · {formatDate(t.lease_end)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#A8A59E' }}>Next reminder</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1B18' }}>{nextType(days)} notice</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#A8A59E' }}>Rent</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1B18' }}>{formatNaira(t.rent_amount)}/yr</span>
                    </div>
                  </div>

                  {/* Per-channel buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {(['whatsapp', 'sms', 'email'] as Channel[]).map(ch => {
                      const Icon = chIcon[ch];
                      const isSending = tSending.has(ch);
                      const isSent = tSent.has(ch);
                      return (
                        <button key={ch} onClick={() => !isSent && !isSending && handleSendChannel(t.id, ch, `${t.first_name} ${t.last_name}`)} style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px',
                          borderRadius: 8, border: `1px solid ${isSent ? '#C3E9D5' : chBorder[ch]}`,
                          background: isSent ? '#F0FAF5' : chBg[ch],
                          color: isSent ? '#1A7F4B' : chColor[ch],
                          fontSize: 12, fontWeight: 500, cursor: isSent ? 'default' : 'pointer',
                          textTransform: 'capitalize', transition: 'all 0.15s',
                        }}>
                          {isSending
                            ? <span style={{ width: 10, height: 10, border: `1.5px solid ${chColor[ch]}40`, borderTopColor: chColor[ch], borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                            : isSent ? <CheckCircle2 size={11} /> : <Icon size={11} />
                          }
                          {ch}
                        </button>
                      );
                    })}
                    <div style={{ marginLeft: 'auto' }}>
                      {allSent ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#1A7F4B', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> All sent
                        </span>
                      ) : (
                        <button onClick={() => handleSendAll(t.id, `${t.first_name} ${t.last_name}`)} style={{ background: '#1C1B18', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Send size={11} /> Send all
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History — populated as reminders are sent */}
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18', marginBottom: 14 }}>History</p>
          <div style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {Object.entries(sentChannels).flatMap(([tid, chSet]) => {
              const t = tenants.find(x => x.id === tid);
              if (!t) return [];
              return [...chSet].map(ch => ({ tid, ch, name: `${t.first_name} ${t.last_name}` }));
            }).length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#A8A59E', fontSize: 13 }}>
                No reminders sent yet. Send one above to see history here.
              </div>
            ) : (
              Object.entries(sentChannels).flatMap(([tid, chSet]) => {
                const t = tenants.find(x => x.id === tid);
                if (!t) return [];
                return [...chSet].map(ch => {
                  const Icon = chIcon[ch];
                  return (
                    <div key={`${tid}-${ch}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: '1px solid #F2F1EE' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: '#F0FAF5', border: '1px solid #C3E9D5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={14} color="#1A7F4B" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.first_name} {t.last_name}</p>
                        <p style={{ fontSize: 11.5, color: '#A8A59E', marginTop: 1 }}>Sent just now</p>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: chBg[ch], color: chColor[ch], border: `1px solid ${chBorder[ch]}`, flexShrink: 0 }}>
                        <Icon size={10} /> {ch}
                      </span>
                    </div>
                  );
                });
              })
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
