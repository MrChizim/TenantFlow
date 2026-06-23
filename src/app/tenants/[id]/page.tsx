'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, RefreshCw, CheckCircle2, Banknote, Pencil, Clock, FileText, AlertCircle, TrendingUp, Trash2 } from 'lucide-react';
import { formatNaira, formatDate, daysUntil } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const scheduleLabel: Record<string, string> = { annual: 'Annual', biannual: 'Bi-annual', quarterly: 'Quarterly', monthly: 'Monthly' };

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tenants = useStore(s => s.tenants);
  const updateTenantRent = useStore(s => s.updateTenantRent);
  const renewTenantLease = useStore(s => s.renewTenantLease);
  const markInstallmentPaid = useStore(s => s.markInstallmentPaid);
  const deleteTenant = useStore(s => s.deleteTenant);
  const addNotification = useStore(s => s.addNotification);
  const allInstallments = useStore(s => s.installments);

  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRent, setNewRent] = useState('');
  const [rentNote, setRentNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const tenant = tenants.find(t => t.id === id)!;

  if (!tenant) return (
    <div style={{ maxWidth: 500, paddingTop: 60, textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Tenant not found.</p>
      <Link href="/tenants" className="btn btn-outline" style={{ marginTop: 16, textDecoration: 'none' }}>Back to tenants</Link>
    </div>
  );

  const installments = allInstallments.filter(i => i.tenant_id === tenant.id);
  const isInstallment = tenant.payment_schedule !== 'annual';
  const days = daysUntil(tenant.lease_end);
  const pct = Math.min(100, Math.max(0, (() => {
    if (!tenant.lease_start || !tenant.lease_end) return 0;
    const s = new Date(tenant.lease_start).getTime();
    const e = new Date(tenant.lease_end).getTime();
    return ((Date.now() - s) / (e - s)) * 100;
  })()));
  const totalExpected = installments.reduce((s, i) => s + i.amount, 0);
  const totalPaid = installments.filter(i => i.paid).reduce((s, i) => s + i.amount, 0);
  const outstanding = totalExpected - totalPaid;
  const overdueInstallments = installments.filter(i => !i.paid && new Date(i.due_date) < new Date());

  async function handleUpdateRent() {
    if (!newRent) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      await updateTenantRent(supabase, id, Number(newRent), rentNote || undefined);
      addNotification({ title: 'Rent updated', body: `Rent for ${tenant.first_name} ${tenant.last_name} updated to ₦${Number(newRent).toLocaleString('en-NG')}/yr.` });
      setNewRent(''); setRentNote(''); setShowRentModal(false);
    } finally { setActionLoading(false); }
  }

  async function handleRenew() {
    setActionLoading(true);
    try {
      const supabase = createClient();
      const newLeaseEnd = addOneYear(tenant.lease_end ?? new Date().toISOString().split('T')[0]);
      await renewTenantLease(supabase, id, newLeaseEnd);
      addNotification({ title: 'Lease renewed', body: `${tenant.first_name} ${tenant.last_name}'s lease has been renewed to ${formatDate(newLeaseEnd)}.` });
    } finally { setActionLoading(false); }
  }

  async function handleMarkPaid(instId: string) {
    setMarkingPaid(instId);
    try {
      const supabase = createClient();
      await markInstallmentPaid(supabase, instId, 'bank_transfer');
    } finally { setMarkingPaid(null); }
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

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/tenants" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none', flexShrink: 0 }}><ArrowLeft size={15} /></Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: '1.7rem', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{tenant.first_name} {tenant.last_name}</h1>
            <StatusBadge status={tenant.status} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{tenant.property?.name} · {tenant.unit}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowRentModal(true)} className="btn btn-outline" style={{ fontSize: 13 }}><TrendingUp size={13} /> Update rent</button>
          <Link href={`/tenants/${id}/edit`} className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 13 }}><Pencil size={13} /> Edit</Link>
        </div>
      </div>

      {/* Alerts */}
      {(tenant.status === 'expiring' || tenant.status === 'expired') && (
        <div style={{ borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap', background: tenant.status === 'expired' ? 'var(--red-tint)' : 'var(--amber-tint)', border: `1px solid ${tenant.status === 'expired' ? 'var(--red-line)' : 'var(--amber-line)'}` }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: tenant.status === 'expired' ? 'var(--red)' : 'var(--amber)' }}>{tenant.status === 'expired' ? 'Lease has expired' : 'Lease expiring soon'}</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3 }}>{days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining — contact tenant to renew`}</p>
          </div>
          <button onClick={handleRenew} disabled={actionLoading} className="btn btn-dark" style={{ flexShrink: 0, fontSize: 13 }}>
            <RefreshCw size={13} /> Renew +1 year
          </button>
        </div>
      )}

      {overdueInstallments.length > 0 && (
        <div style={{ borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'var(--red-tint)', border: '1px solid var(--red-line)' }}>
          <AlertCircle size={18} color="var(--red)" />
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--red)' }}>{overdueInstallments.length} overdue installment{overdueInstallments.length > 1 ? 's' : ''} · {formatNaira(overdueInstallments.reduce((s, i) => s + i.amount, 0))} outstanding</p>
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
                    <p style={{ fontSize: 13.5, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lease */}
          <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Lease details</p>
              {tenant.agreement_signed ? <span className="tag tag-green"><CheckCircle2 size={10} /> Signed</span> : <span className="tag tag-amber"><FileText size={10} /> Unsigned</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 20 }}>
              {[['Start', formatDate(tenant.lease_start)], ['End', formatDate(tenant.lease_end)], ['Annual rent', formatNaira(tenant.rent_amount)], ['Schedule', (tenant.payment_schedule ? scheduleLabel[tenant.payment_schedule] : undefined) ?? 'Annual']].map(([l, v]) => (
                <div key={l}>
                  <p className="eyebrow" style={{ marginBottom: 5 }}>{l}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{v}</p>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Lease progress</p>
                <p style={{ fontSize: 11.5, color: pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'var(--text-3)' }}>{Math.round(pct)}% elapsed</p>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'linear-gradient(90deg, var(--gold), var(--gold-2))' }} />
              </div>
            </div>
          </div>

          {/* Installments */}
          {isInstallment && installments.length > 0 && (
            <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Payment schedule</p>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 500 }}>{formatNaira(totalPaid)} paid</span>
                  {outstanding > 0 && <span style={{ color: 'var(--red)', fontWeight: 500 }}>{formatNaira(outstanding)} due</span>}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: 'var(--green)', width: `${totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 5 }}>{installments.filter(i => i.paid).length} of {installments.length} installments paid</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {installments.map(inst => {
                  const isOverdue = !inst.paid && new Date(inst.due_date) < new Date();
                  return (
                    <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: inst.paid ? 'var(--green-tint)' : isOverdue ? 'var(--red-tint)' : 'var(--surface-2)', border: `1px solid ${inst.paid ? 'var(--green-line)' : isOverdue ? 'var(--red-line)' : 'var(--line)'}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: inst.paid ? 'var(--green)' : 'transparent' }}>
                        {inst.paid ? <CheckCircle2 size={13} color="#fff" /> : isOverdue ? <AlertCircle size={13} color="var(--red)" /> : <Clock size={13} color="var(--text-3)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{formatNaira(inst.amount)}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>Due {formatDate(inst.due_date)}{inst.paid && inst.paid_date ? ` · Paid ${formatDate(inst.paid_date)}` : ''}</p>
                      </div>
                      {!inst.paid && (
                        <button onClick={() => handleMarkPaid(inst.id)} disabled={markingPaid === inst.id} className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}>
                          {markingPaid === inst.id ? '...' : 'Mark paid'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isInstallment && (
            <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-tint)', border: '1px solid var(--green-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Banknote size={16} color="var(--green)" /></div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{formatNaira(tenant.rent_amount)}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>Annual payment due on {formatDate(tenant.lease_start)}</p>
                </div>
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
                { label: 'Days remaining', value: days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`, color: days < 0 ? 'var(--red)' : days < 90 ? 'var(--amber)' : 'var(--green)' },
                isInstallment ? { label: 'Total paid', value: formatNaira(totalPaid), color: 'var(--green)' } : null,
                isInstallment && outstanding > 0 ? { label: 'Outstanding', value: formatNaira(outstanding), color: 'var(--red)' } : null,
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
              <button onClick={() => setShowRentModal(true)} className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: 13, width: '100%' }}>
                <TrendingUp size={13} color="var(--gold)" /> Update rent
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

      {/* Rent history */}
      {(tenant.rent_history ?? []).length > 0 && (
        <div className="surface" style={{ padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginTop: 14 }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><TrendingUp size={14} color="var(--gold)" /> Rent history</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(tenant.rent_history ?? []).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{formatNaira(h.amount)}/yr</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{h.note ?? h.date}</p>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-3)', paddingTop: 2 }}>{h.date}</span>
              </div>
            ))}
            <div style={{ padding: '10px 14px', background: 'var(--gold-tint)', border: '1px solid var(--gold-border)', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Current rent</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gold)' }}>{formatNaira(tenant.rent_amount)}/yr</span>
            </div>
          </div>
        </div>
      )}

      {/* Rent update modal */}
      {showRentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowRentModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Update rent</p>
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
                  {actionLoading ? '...' : 'Save new rent'}
                </button>
                <button onClick={() => setShowRentModal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Remove tenant?</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
              This will permanently delete <strong style={{ color: 'var(--text-1)' }}>{tenant.first_name} {tenant.last_name}</strong> and all their payment records. This cannot be undone.
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
