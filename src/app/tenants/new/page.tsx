'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

function Field({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="eyebrow">{label}{required ? ' *' : ''}</label>
      <input type={type} className="field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

export default function NewTenantPage() {
  const router = useRouter();
  const properties = useStore(s => s.properties);
  const addTenant = useStore(s => s.addTenant);
  const addNotification = useStore(s => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', whatsapp: '',
    nin: '', property_id: '', unit: '', rent_amount: '', agreement_signed: false,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const selectedProperty = properties.find(p => p.id === form.property_id);

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
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || '',
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        nin: form.nin || undefined,
        property_id: form.property_id,
        unit: form.unit,
        rent_amount: Number(form.rent_amount) || 0,
        payment_schedule: 'annual',
        lease_start: '',
        lease_end: '',
        agreement_signed: form.agreement_signed,
        rent_history: [],
      });
      addNotification({ title: 'Tenant added', body: `${form.first_name} ${form.last_name} has been added.` });
      router.push('/tenants');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href="/tenants" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Add tenant</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Contact info and property assignment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Personal */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Personal information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First name" value={form.first_name} onChange={v => set('first_name', v)} placeholder="Emeka" required />
            <Field label="Last name" value={form.last_name} onChange={v => set('last_name', v)} placeholder="Okafor" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="08012345678" required />
            <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="Same as phone?" />
          </div>
          <Field label="Email" value={form.email} onChange={v => set('email', v)} placeholder="emeka@gmail.com" type="email" />
          <Field label="NIN (optional)" value={form.nin} onChange={v => set('nin', v)} placeholder="12345678901" />
        </div>

        {/* Property */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Property & unit</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Property *</label>
            <select className="field" value={form.property_id} onChange={e => set('property_id', e.target.value)} required>
              <option value="">Select a property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Unit / Flat *</label>
            {selectedProperty ? (
              <input
                className="field"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                placeholder={`e.g. Flat 1A, Room 3, Unit B`}
                required
                list="unit-suggestions"
              />
            ) : (
              <input className="field" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Select a property first" disabled style={{ opacity: 0.5 }} />
            )}
            {selectedProperty && (
              <datalist id="unit-suggestions">
                {Array.from({ length: selectedProperty.total_units }, (_, i) => (
                  <option key={i} value={`Flat ${i + 1}`} />
                ))}
                {['Ground Floor', 'First Floor', 'Second Floor', 'Top Floor', 'Room 1', 'Room 2', 'Room 3', 'Self Contain', 'Mini Flat'].map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Annual rent (₦)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
              <input type="number" className="field" value={form.rent_amount} onChange={e => set('rent_amount', e.target.value)} placeholder="1800000" style={{ paddingLeft: 24 }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>You can set payment details after adding the tenant.</p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.agreement_signed} onChange={e => set('agreement_signed', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
            <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Tenancy agreement has been signed</span>
          </label>
        </div>

        {error && <p style={{ fontSize: 13, color: '#C0392B', background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} className="btn btn-dark">
            {loading
              ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : 'Add tenant'}
          </button>
          <Link href="/tenants" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
