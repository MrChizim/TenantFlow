'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

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

export default function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);
  const updateTenant = useStore(s => s.updateTenant);
  const addNotification = useStore(s => s.addNotification);

  const tenant = tenants.find(t => t.id === id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: tenant?.first_name ?? '', last_name: tenant?.last_name ?? '',
    email: tenant?.email ?? '', phone: tenant?.phone ?? '',
    whatsapp: tenant?.whatsapp ?? '', nin: tenant?.nin ?? '',
    property_id: tenant?.property_id ?? '', unit: tenant?.unit ?? '',
    rent_amount: String(tenant?.rent_amount ?? ''),
    lease_start: tenant?.lease_start ?? '', lease_end: tenant?.lease_end ?? '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (!tenant) return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Tenant not found.</p>
      <Link href="/tenants" className="btn btn-outline" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>Back to tenants</Link>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      await updateTenant(supabase, id, {
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        nin: form.nin, property_id: form.property_id, unit: form.unit,
        rent_amount: Number(form.rent_amount),
        lease_start: form.lease_start, lease_end: form.lease_end,
      });
      addNotification({ title: 'Tenant updated', body: `${form.first_name} ${form.last_name}'s details have been updated.` });
      router.push(`/tenants/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href={`/tenants/${id}`} className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Edit tenant</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{tenant.first_name} {tenant.last_name}</p>
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
            <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="08012345678" />
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
        </Section>

        {error && <p style={{ fontSize: 13, color: '#C0392B', background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} className="btn btn-dark">
            {loading ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Save changes'}
          </button>
          <Link href={`/tenants/${id}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
