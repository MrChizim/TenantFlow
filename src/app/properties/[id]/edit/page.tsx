'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

function Field({ label, value, onChange, placeholder, required, type = 'text', prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; prefix?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="eyebrow">{label}{required ? ' *' : ''}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none', zIndex: 1 }}>{prefix}</span>}
        <input type={type} className="field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={prefix ? { paddingLeft: 24 } : undefined} />
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 4 }}>{title}</p>
        {sub && <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{sub}</p>}
        <div style={{ height: 1, background: 'var(--line)', marginTop: 14 }} />
      </div>
      {children}
    </div>
  );
}

const PROP_TYPES: [string, string][] = [
  ['apartment', 'Apartment (general)'], ['self_contain', 'Self Contain'],
  ['1_bedroom_flat', '1 Bedroom Flat'], ['2_bedroom_flat', '2 Bedroom Flat'],
  ['3_bedroom_flat', '3 Bedroom Flat'], ['duplex', 'Duplex'],
  ['bungalow', 'Bungalow'], ['commercial', 'Commercial'], ['land', 'Land'],
];

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const properties = useStore(s => s.properties);
  const updateProperty = useStore(s => s.updateProperty);
  const addNotification = useStore(s => s.addNotification);

  const property = properties.find(p => p.id === id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: property?.name ?? '', address: property?.address ?? '',
    city: property?.city ?? '', state: property?.state ?? '',
    type: property?.type ?? 'apartment', total_units: String(property?.total_units ?? '1'),
    purchase_price: property?.purchase_price ? String(property.purchase_price) : '',
    build_cost: property?.build_cost ? String(property.build_cost) : '',
    purchase_date: property?.purchase_date ?? '', owner_name: property?.owner_name ?? '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const totalInvestment = (Number(form.purchase_price) || 0) + (Number(form.build_cost) || 0);

  if (!property) return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Property not found.</p>
      <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>Back to properties</Link>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      await updateProperty(supabase, id, {
        name: form.name, address: form.address, city: form.city, state: form.state,
        type: form.type as import('@/types').PropertyType,
        total_units: Number(form.total_units),
        purchase_price: Number(form.purchase_price) || undefined,
        build_cost: Number(form.build_cost) || undefined,
        purchase_date: form.purchase_date || undefined,
        owner_name: form.owner_name || undefined,
      });
      addNotification({ title: 'Property updated', body: `${form.name} has been updated.` });
      router.push(`/properties/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href={`/properties/${id}`} className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Edit property</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{property.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section title="Property details">
          <Field label="Property name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Adeola Court" required />
          <Field label="Street address" value={form.address} onChange={v => set('address', v)} placeholder="e.g. 14 Adeola Odeku Street" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="City" value={form.city} onChange={v => set('city', v)} placeholder="Victoria Island" required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">State *</label>
              <select className="field" value={form.state} onChange={e => set('state', e.target.value)} required>
                <option value="">Select</option>
                {['Lagos','Abuja','Rivers','Ogun','Kano','Anambra','Oyo','Kaduna','Delta','Enugu','Imo','Kwara','Osun','Ondo','Ekiti','Cross River','Akwa Ibom','Edo','Benue','Plateau'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">Type *</label>
              <select className="field" value={form.type} onChange={e => set('type', e.target.value)}>
                {PROP_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <Field label="Total units" type="number" value={form.total_units} onChange={v => set('total_units', v)} required />
          </div>
          <Field label="Owner / landlord name" value={form.owner_name} onChange={v => set('owner_name', v)} placeholder="e.g. Chukwuemeka Adeola" />
        </Section>

        <Section title="Investment cost" sub="Used for ROI calculations">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Land / purchase price (₦)" prefix="₦" type="number" value={form.purchase_price} onChange={v => set('purchase_price', v)} placeholder="45000000" />
            <Field label="Build / renovation cost (₦)" prefix="₦" type="number" value={form.build_cost} onChange={v => set('build_cost', v)} placeholder="30000000" />
          </div>
          <Field label="Date purchased / completed" type="date" value={form.purchase_date} onChange={v => set('purchase_date', v)} />
          {totalInvestment > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: 'var(--gold-tint)', border: '1px solid var(--gold-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Total investment</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>₦{totalInvestment.toLocaleString('en-NG')}</span>
            </div>
          )}
        </Section>

        {error && <p style={{ fontSize: 13, color: '#C0392B', background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} className="btn btn-dark">
            {loading ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Save changes'}
          </button>
          <Link href={`/properties/${id}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
