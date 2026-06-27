'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, CheckCircle2, Banknote, Pencil, FileText, TrendingUp, Trash2, StickyNote, Check, X, PlusCircle, Calendar } from 'lucide-react';
import { formatNaira, formatDate, daysUntil } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const DURATIONS = [
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
  { label: '6 months', months: 6 },
  { label: '3 months', months: 3 },
  { label: 'Custom', months: 0 },
];

const METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online / POS' },
];

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tenants = useStore(s => s.tenants);
  const updateTenantRent = useStore(s => s.updateTenantRent);
  const renewTenantLease = useStore(s => s.renewTenantLease);
  const deleteTenant = useStore(s => s.deleteTenant);
  const addNotification = useStore(s => s.addNotification);
  const updateTenant = useStore(s => s.updateTenant);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [newRent, setNewRent] = useState('');
  const [rentNote, setRentNote] = useState('');

  // Payment modal state
  const [payAmount, setPayAmount] = useState('');
  const [payDurationMonths, setPayDurationMonths] = useState(12);
  const [payCustomMonths, setPayCustomMonths] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'cash' | 'online'>('bank_transfer');
  const [payPartial, setPayPartial] = useState(false);
  const [payPartialNote, setPayPartialNote] = useState('');
  const [paySelectedDuration, setPaySelectedDuration] = useState('1 year');
  const [payOutstanding, setPayOutstanding] = useState('');

  const tenant = tenants.find(t => t.id === id)!;

  if (!tenant) return (
    <div style={{ maxWidth: 500, paddingTop: 60, textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Tenant not found.</p>
      <Link href="/tenants" className="btn btn-outline" style={{ marginTop: 16, textDecoration: 'none' }}>Back to tenants</Link>
    </div>
  );

  const days = daysUntil(tenant.lease_end);
  const paidUntil = tenant.lease_end;

  const pct = Math.min(100, Math.max(0, (() => {
    if (!tenant.lease_start || !tenant.lease_end) return 0;
    const s = new Date(tenant.lease_start).getTime();
    const e = new Date(tenant.lease_end).getTime();
    return ((Date.now() - s) / (e - s)) * 100;
  })()));

  function openPaymentModal() {
    setPayAmount(String(tenant.rent_amount));
    setPayDurationMonths(12);
    setPayCustomMonths('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('bank_transfer');
    setPayPartial(false);
    setPayPartialNote('');
    setPaySelectedDuration('1 year');
    setPayOutstanding('');
    setShowPaymentModal(true);
  }

  async function handleRecordPayment() {
    const finalMonths = paySelectedDuration === 'Custom' ? Number(payCustomMonths) : payDurationMonths;
    if (!finalMonths || finalMonths < 1) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      const newLeaseStart = payDate;
      const newLeaseEnd = addMonths(payDate, finalMonths);
      const outstandingAmount = payPartial && payOutstanding ? Number(payOutstanding) : 0;
      const note = payPartial ? (payPartialNote || `Partial payment of ${formatNaira(Number(payAmount))}`) : undefined;
      await renewTenantLease(supabase, id, newLeaseEnd);
      const entry = {
        date: payDate,
        amount: Number(payAmount),
        note: [
          `Paid ${formatNaira(Number(payAmount))} — covers ${finalMonths} month${finalMonths !== 1 ? 's' : ''} (until ${formatDate(newLeaseEnd)})`,
          payPartial ? ` · PARTIAL: ${payPartialNote || 'partial payment'}` : '',
          ` · ${METHODS.find(m => m.value === payMethod)?.label}`,
        ].join(''),
      };
      const newHistory = [...(tenant.rent_history ?? []), entry];
      await updateTenant(supabase, id, {
        lease_start: newLeaseStart,
        rent_history: newHistory,
        outstanding_balance: outstandingAmount,
        payment_status: outstandingAmount > 0 ? 'owing' : 'paid',
      } as Parameters<typeof updateTenant>[2]);
      addNotification({ title: 'Payment recorded', body: `${tenant.first_name} ${tenant.last_name} paid — covered until ${formatDate(newLeaseEnd)}.` });
      setShowPaymentModal(false);
    } finally { setActionLoading(false); }
  }

  async function handleUpdateRent() {
    if (!newRent) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      await updateTenantRent(supabase, id, Number(newRent), rentNote || undefined);
      addNotification({ title: 'Rent updated', body: `Rent updated to ${formatNaira(Number(newRent))}/yr.` });
      setNewRent(''); setRentNote(''); setShowRentModal(false);
    } finally { setActionLoading(false); }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      const supabase = createClient();
      await deleteTenant(supabase, id);
      addNotification({ title: 'Tenant removed', body: `${tenant.first_name} ${tenant.last_name} has been removed.` });
      router.push('/tenants');
    } catch { setActionLoading(false); setShowDeleteModal(false); }
  }

  async function handleSaveNotes() {
    setActionLoading(true);
    try {
      const supabase = createClient();
      await updateTenant(supabase, id, { notes: notesValue || null } as Parameters<typeof updateTenant>[2]);
      setEditingNotes(false);
    } finally { setActionLoading(false); }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/tenants" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none', flexShrink: 0 }}><ArrowLeft size={15} /></Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: '1.7rem', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{tenant.first_name} {tenant.last_name}</h1>
            <StatusBadge status={tenant.status} />
            {(() => {
              const ps = tenant.payment_status ?? 'paid';
              return (
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 99,
                  background: ps === 'owing' ? '#FEF3F2' : ps === 'uncertain' ? '#FFF8ED' : '#E8F5EE',
                  color: ps === 'owing' ? '#C0392B' : ps === 'uncertain' ? '#B45309' : '#1A7F4B',
                  border: `1px solid ${ps === 'owing' ? '#F9BDBA' : ps === 'uncertain' ? '#F5D78E' : '#A8E0B8'}`,
                }}>
                  {ps === 'owing' ? 'Owing' : ps === 'uncertain' ? 'Uncertain' : 'Paid'}
                </span>
              );
            })()}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{tenant.property?.name} · {tenant.unit}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={openPaymentModal} className="btn btn-dark" style={{ fontSize: 13 }}>
            <PlusCircle size={13} /> Record payment
          </button>
          <Link href={`/tenants/${id}/edit`} className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 13 }}><Pencil size={13} /> Edit</Link>
        </div>
      </div>

      {/* Status alerts */}
      {tenant.status === 'no_lease' && (
        <div style={{ borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-2)' }}>No payment recorded yet</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3 }}>Record a payment to start tracking when this tenant is paid up until.</p>
          </div>
          <button onClick={openPaymentModal} className="btn btn-dark" style={{ flexShrink: 0, fontSize: 13 }}>
            <PlusCircle size={13} /> Record payment
          </button>
        </div>
      )}

      {(tenant.status === 'expiring' || tenant.status === 'expired') && (
        <div style={{ borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap', background: tenant.status === 'expired' ? 'var(--red-tint)' : 'var(--amber-tint)', border: `1px solid ${tenant.status === 'expired' ? 'var(--red-line)' : 'var(--amber-line)'}` }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: tenant.status === 'expired' ? 'var(--red)' : 'var(--amber)' }}>
              {tenant.status === 'expired' ? 'Payment has expired' : 'Payment expiring soon'}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3 }}>
              {days < 0 ? `${Math.abs(days)} days overdue — tenant needs to pay` : `${days} days left — collect payment soon`}
            </p>
          </div>
          <button onClick={openPaymentModal} className="btn btn-dark" style={{ flexShrink: 0, fontSize: 13 }}>
            <PlusCircle size={13} /> Record payment
          </button>
        </div>
      )}

      {/* Payment status toggle */}
      <div className="surface" style={{ padding: '16px 20px', marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', flexShrink: 0 }}>Payment status:</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['paid', 'owing', 'uncertain'] as const).map(s => {
            const active = (tenant.payment_status ?? 'paid') === s;
            return (
              <button key={s} onClick={async () => {
                const supabase = createClient();
                await updateTenant(supabase, id, { payment_status: s } as Parameters<typeof updateTenant>[2]);
              }}
                style={{
                  padding: '7px 16px', borderRadius: 99, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  borderColor: active ? (s === 'paid' ? '#1A7F4B' : s === 'owing' ? '#C0392B' : '#B45309') : 'var(--line)',
                  background: active ? (s === 'paid' ? '#E8F5EE' : s === 'owing' ? '#FEF3F2' : '#FFF8ED') : 'var(--surface-2)',
                  color: active ? (s === 'paid' ? '#1A7F4B' : s === 'owing' ? '#C0392B' : '#B45309') : 'var(--text-3)',
                }}>
                {s === 'paid' ? 'Paid' : s === 'owing' ? 'Owing' : 'Uncertain'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outstanding balance box */}
      {(tenant.outstanding_balance ?? 0) > 0 && (
        <div style={{ background: '#FEF3F2', border: '1px solid var(--red-line)', borderRadius: 16, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 4 }}>Outstanding balance</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)', letterSpacing: '-0.02em' }}>{formatNaira(tenant.outstanding_balance!)}</p>
            <p style={{ fontSize: 12.5, color: 'var(--red)', opacity: 0.7, marginTop: 2 }}>Partial payment recorded — this amount is still owed</p>
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await updateTenant(supabase, id, { outstanding_balance: 0, payment_status: 'paid' } as Parameters<typeof updateTenant>[2]);
            }}
            style={{ fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10, background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            Mark as cleared
          </button>
        </div>
      )}

      <div className="tenant-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* Contact */}
          <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 18 }}>Contact</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { icon: Phone, label: 'Phone', value: tenant.phone },
                { icon: MessageCircle, label: 'WhatsApp', value: tenant.whatsapp },
                { icon: Mail, label: 'Email', value: tenant.email || '—' },
                { icon: MapPin, label: 'Unit', value: `${tenant.property?.name}, ${tenant.unit}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--gold-tint)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={13} color="var(--gold)" /></div>
                  <div style={{ minWidth: 0 }}>
                    <p className="eyebrow" style={{ marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 13.5, color: 'var(--text-1)', wordBreak: 'break-word' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment status */}
          <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Payment status</p>
              {tenant.agreement_signed
                ? <span className="tag tag-green"><CheckCircle2 size={10} /> Agreement signed</span>
                : <span className="tag tag-amber"><FileText size={10} /> No agreement</span>}
            </div>

            {paidUntil ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 20 }}>
                  {[
                    ['Last paid', formatDate(tenant.lease_start)],
                    ['Paid until', formatDate(paidUntil)],
                    ['Annual rent', formatNaira(tenant.rent_amount)],
                    ['Days left', days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="eyebrow" style={{ marginBottom: 5 }}>{l}</p>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: l === 'Days left' ? (days < 0 ? 'var(--red)' : days < 90 ? 'var(--amber)' : 'var(--green)') : 'var(--text-1)' }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Payment period progress</p>
                    <p style={{ fontSize: 11.5, color: pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'var(--text-3)' }}>{Math.round(pct)}% elapsed</p>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'linear-gradient(90deg, var(--gold), var(--gold-2))' }} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 13 }}>
                <Calendar size={24} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                No payment recorded. Use <strong>Record payment</strong> to log when this tenant paid and how long it covers.
              </div>
            )}
          </div>

          {/* Payment history */}
          {(tenant.rent_history ?? []).length > 0 && (
            <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Banknote size={14} color="var(--gold)" /> Payment history
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...(tenant.rent_history ?? [])].reverse().map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{formatNaira(h.amount)}</p>
                      {h.note && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>{h.note}</p>}
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-3)', paddingTop: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatDate(h.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="surface" style={{ padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 16 }}>At a glance</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([
                { label: 'Annual rent', value: formatNaira(tenant.rent_amount), color: 'var(--text-1)' },
                paidUntil
                  ? { label: 'Days left', value: days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`, color: days < 0 ? 'var(--red)' : days < 90 ? 'var(--amber)' : 'var(--green)' }
                  : { label: 'Status', value: 'No payment yet', color: 'var(--text-3)' },
                paidUntil ? { label: 'Paid until', value: formatDate(paidUntil), color: 'var(--text-1)' } : null,
                (tenant.outstanding_balance ?? 0) > 0
                  ? { label: 'Outstanding', value: formatNaira(tenant.outstanding_balance!), color: 'var(--red)' }
                  : null,
              ] as Array<{ label: string; value: string; color: string } | null>).filter(Boolean).map(row => {
                const r = row!;
                return (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{r.label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: r.color }}>{r.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 14 }}>Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={openPaymentModal} className="btn btn-dark" style={{ justifyContent: 'flex-start', fontSize: 13, width: '100%' }}>
                <PlusCircle size={13} /> Record payment
              </button>
              <button onClick={() => setShowRentModal(true)} className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: 13, width: '100%' }}>
                <TrendingUp size={13} color="var(--gold)" /> Update rent amount
              </button>
              <Link href={`/tenants/${id}/edit`} className="btn btn-outline" style={{ textDecoration: 'none', justifyContent: 'flex-start', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', color: 'var(--text-1)', cursor: 'pointer' }}>
                <Pencil size={13} color="var(--text-3)" /> Edit details
              </Link>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: 13, width: '100%', color: 'var(--red)', borderColor: 'var(--red-line)' }}>
                <Trash2 size={13} /> Remove tenant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <StickyNote size={14} color="var(--gold)" /> Notes
          </p>
          {!editingNotes && (
            <button onClick={() => { setNotesValue(tenant.notes ?? ''); setEditingNotes(true); }} className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>
              <Pencil size={11} /> {tenant.notes ? 'Edit' : 'Add note'}
            </button>
          )}
        </div>
        {editingNotes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea className="field" value={notesValue} onChange={e => setNotesValue(e.target.value)}
              placeholder="e.g. Pays via bank transfer. Has 2 dogs. Called about leaking roof Jan 2026."
              rows={4} style={{ resize: 'vertical', lineHeight: 1.6 }} autoFocus />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveNotes} disabled={actionLoading} className="btn btn-dark" style={{ fontSize: 13 }}><Check size={13} /> Save</button>
              {tenant.notes && (
                <button onClick={() => { setNotesValue(''); handleSaveNotes(); }} disabled={actionLoading} className="btn btn-outline" style={{ fontSize: 13, color: 'var(--red)', borderColor: 'var(--red-line)' }}>
                  <Trash2 size={13} /> Clear
                </button>
              )}
              <button onClick={() => setEditingNotes(false)} className="btn btn-outline" style={{ fontSize: 13 }}><X size={13} /> Cancel</button>
            </div>
          </div>
        ) : tenant.notes ? (
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: 'var(--surface-2)', padding: '14px 16px', borderRadius: 12 }}>{tenant.notes}</p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>No notes yet. Add anything worth remembering about this tenant.</p>
        )}
      </div>

      {/* Record Payment modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPaymentModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-1)' }}>Record payment</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{tenant.first_name} {tenant.last_name}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="eyebrow">Amount paid (₦) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
                  <input type="number" className="field" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={String(tenant.rent_amount)} style={{ paddingLeft: 26 }} autoFocus />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 2 }}>
                  <input type="checkbox" checked={payPartial} onChange={e => setPayPartial(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--gold)', cursor: 'pointer' }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>This is a partial payment (not the full rent)</span>
                </label>
                {payPartial && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#FEF3F2', border: '1px solid var(--red-line)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label className="eyebrow" style={{ color: 'var(--red)' }}>Amount still outstanding (₦)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
                        <input type="number" className="field" value={payOutstanding} onChange={e => setPayOutstanding(e.target.value)}
                          placeholder={payAmount ? String(Math.max(0, tenant.rent_amount - Number(payAmount))) : '0'}
                          style={{ paddingLeft: 26 }} />
                      </div>
                      {payAmount && Number(payOutstanding) > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--red)' }}>
                          Paid {formatNaira(Number(payAmount))} · still owes {formatNaira(Number(payOutstanding))}
                        </p>
                      )}
                    </div>
                    <input type="text" className="field" value={payPartialNote} onChange={e => setPayPartialNote(e.target.value)} placeholder="Note (optional) e.g. balance by end of month" />
                  </div>
                )}
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="eyebrow">Duration covered *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {DURATIONS.map(d => (
                    <button key={d.label} type="button"
                      onClick={() => { setPaySelectedDuration(d.label); setPayDurationMonths(d.months); }}
                      style={{ padding: '9px 6px', borderRadius: 10, border: `1.5px solid ${paySelectedDuration === d.label ? 'var(--gold)' : 'var(--line)'}`, background: paySelectedDuration === d.label ? 'var(--gold-tint)' : '#fff', fontSize: 13, fontWeight: paySelectedDuration === d.label ? 600 : 400, color: paySelectedDuration === d.label ? 'var(--gold)' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {paySelectedDuration === 'Custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" className="field" value={payCustomMonths} onChange={e => setPayCustomMonths(e.target.value)} placeholder="e.g. 18" style={{ flex: 1 }} min={1} />
                    <span style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>months</span>
                  </div>
                )}
                {/* Preview */}
                {(() => {
                  const months = paySelectedDuration === 'Custom' ? Number(payCustomMonths) : payDurationMonths;
                  if (!months || !payDate) return null;
                  return (
                    <p style={{ fontSize: 12.5, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 9 }}>
                      Paid until: <strong style={{ color: 'var(--text-1)' }}>{formatDate(addMonths(payDate, months))}</strong>
                    </p>
                  );
                })()}
              </div>

              {/* Date paid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="eyebrow">Date received *</label>
                <input type="date" className="field" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>

              {/* Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="eyebrow">Payment method</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {METHODS.map(m => (
                    <button key={m.value} type="button"
                      onClick={() => setPayMethod(m.value as typeof payMethod)}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${payMethod === m.value ? 'var(--gold)' : 'var(--line)'}`, background: payMethod === m.value ? 'var(--gold-tint)' : '#fff', fontSize: 12.5, fontWeight: payMethod === m.value ? 600 : 400, color: payMethod === m.value ? 'var(--gold)' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={handleRecordPayment}
                  disabled={!payAmount || actionLoading || (paySelectedDuration === 'Custom' && !payCustomMonths)}
                  className="btn btn-dark" style={{ flex: 1 }}>
                  {actionLoading ? '...' : 'Save payment'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent update modal */}
      {showRentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowRentModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Update rent amount</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Current: {formatNaira(tenant.rent_amount)}/yr</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="eyebrow">New annual rent (₦) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
                  <input type="number" className="field" value={newRent} onChange={e => setNewRent(e.target.value)} placeholder={String(tenant.rent_amount)} style={{ paddingLeft: 26 }} autoFocus />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="eyebrow">Note (optional)</label>
                <input type="text" className="field" value={rentNote} onChange={e => setRentNote(e.target.value)} placeholder="e.g. Annual review increase" />
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button onClick={handleUpdateRent} disabled={!newRent || Number(newRent) === tenant.rent_amount || actionLoading} className="btn btn-dark" style={{ flex: 1 }}>
                  {actionLoading ? '...' : 'Save'}
                </button>
                <button onClick={() => setShowRentModal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Remove tenant?</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
              This will permanently delete <strong style={{ color: 'var(--text-1)' }}>{tenant.first_name} {tenant.last_name}</strong> and all their records. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleDelete} disabled={actionLoading} className="btn btn-dark" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }}>
                {actionLoading ? '...' : 'Yes, remove'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
