'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { PaymentSchedule } from '@/types';

function Field({ label, value, onChange, placeholder, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="eyebrow">{label}{required ? ' *' : ''}</label>
      <input type={type} className="field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', color: 'var(--text-1)', marginBottom: 14 }}>{title}</p>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>
      {children}
    </div>
  );
}

const scheduleOptions: { value: PaymentSchedule; label: string; sub: string }[] = [
  { value: 'annual',    label: 'Annual',    sub: 'Full year upfront (Nigerian default)' },
  { value: 'biannual',  label: 'Bi-annual', sub: 'Two payments per year' },
  { value: 'quarterly', label: 'Quarterly', sub: 'Every 3 months' },
  { value: 'monthly',   label: 'Monthly',   sub: 'Month-by-month installments' },
];

export default function NewTenantPage() {
  const router = useRouter();
  const properties = useStore(s => s.properties);
  const addTenant = useStore(s => s.addTenant);
  const addNotification = useStore(s => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', whatsapp: '', nin: '',
    property_id: '', unit: '', rent_amount: '', lease_start: '', lease_end: '',
    payment_schedule: 'annual' as PaymentSchedule,
    agreement_signed: false,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const rentNum = Number(form.rent_amount) || 0;
  const installmentAmounts: Record<PaymentSchedule, number> = {
    annual: rentNum, biannual: Math.round(rentNum / 2),
    quarterly: Math.round(rentNum / 4), monthly: Math.round(rentNum / 12),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.property_id) { setError('Please select a property.'); return; }
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await addTenant(supabase, user.id, {
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        nin: form.nin, property_id: form.property_id, unit: form.unit,
        rent_amount: rentNum, payment_schedule: form.payment_schedule,
        lease_start: form.lease_start, lease_end: form.lease_end,
        agreement_signed: form.agreement_signed,
      });
      addNotification({ title: 'Tenant added', body: `${form.first_name} ${form.last_name} has been added.` });
      router.push('/tenants');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href="/tenants" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Add tenant</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Fill in lease details and contact info</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section title="Personal information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First name" value={form.first_name} onChange={v => set('first_name', v)} placeholder="Emeka" required />
            <Field label="Last name" value={form.last_name} onChange={v => set('last_name', v)} placeholder="Okafor" required />
          </div>
          <Field label="Email" value={form.email} onChange={v => set('email', v)} placeholder="emeka@gmail.com" type="email" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="08012345678" required />
            <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="08012345678" required />
          </div>
          <Field label="NIN" value={form.nin} onChange={v => set('nin', v)} placeholder="12345678901" />
        </Section>

        <Section title="Lease details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Property *</label>
            <select className="field" value={form.property_id} onChange={e => set('property_id', e.target.value)} required>
              <option value="">Select a property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
            </select>
          </div>
          <Field label="Unit / Flat" value={form.unit} onChange={v => set('unit', v)} placeholder="Flat 1A" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Annual rent (₦) *</label>
            <input type="number" className="field" value={form.rent_amount} onChange={e => set('rent_amount', e.target.value)} placeholder="1800000" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Lease start" value={form.lease_start} onChange={v => set('lease_start', v)} type="date" required />
            <Field label="Lease end" value={form.lease_end} onChange={v => set('lease_end', v)} type="date" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="eyebrow">Payment schedule *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {scheduleOptions.map(opt => {
                const active = form.payment_schedule === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => set('payment_schedule', opt.value)} style={{ padding: '11px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', border: active ? '2px solid var(--gold)' : '1.5px solid var(--line-2)', background: active ? 'var(--gold-tint)' : 'var(--surface)', transition: 'all 0.12s' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--gold)' : 'var(--text-1)', marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{rentNum > 0 ? `₦${installmentAmounts[opt.value].toLocaleString('en-NG')} each` : opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.agreement_signed} onChange={e => set('agreement_signed', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
            <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Tenancy agreement has been signed</span>
          </label>
        </Section>

        {error && <p style={{ fontSize: 13, color: '#C0392B', background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} className="btn btn-dark">
            {loading ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Save tenant'}
          </button>
          <Link href="/tenants" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
