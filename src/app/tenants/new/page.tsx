'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { canAddTenant } from '@/lib/plan';

const UNIT_TYPES = [
  'Self Contain',
  'Room & Parlour',
  'Mini Flat',
  'Studio',
  '1 Bedroom Flat',
  '2 Bedroom Flat',
  '3 Bedroom Flat',
  '4 Bedroom Flat',
  '5 Bedroom Flat',
  '2 Bedroom Bungalow',
  '3 Bedroom Bungalow',
  '4 Bedroom Bungalow',
  '3 Bedroom Duplex',
  '4 Bedroom Duplex',
  '5 Bedroom Duplex',
  'Terraced House',
  'Semi-Detached',
  'Fully Detached',
  'Penthouse',
  "Boy's Quarters",
  'Shop',
  'Office Space',
  'Warehouse',
  'Land',
  'Other / Custom',
];

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
  const tenants = useStore(s => s.tenants);
  const addTenant = useStore(s => s.addTenant);
  const addNotification = useStore(s => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [unitType, setUnitType] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', whatsapp: '',
    nin: '', property_id: '', rent_amount: '', agreement_signed: false, notes: '', payment_status: 'paid' as 'paid' | 'owing' | 'uncertain',
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const selectedProperty = properties.find(p => p.id === form.property_id);
  const finalUnit = unitType === 'Other / Custom' ? customUnit : unitType;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.property_id) { setError('Please select a property.'); return; }
    if (!finalUnit) { setError('Please select or enter a unit type.'); return; }
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { allowed, reason } = await canAddTenant(supabase, user.id, tenants.length);
      if (!allowed) {
        setError(reason ?? 'Plan limit reached');
        setLoading(false);
        return;
      }

      await addTenant(supabase, user.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || '',
        phone: form.phone,
        whatsapp: whatsappSame ? form.phone : form.whatsapp,
        nin: form.nin || undefined,
        property_id: form.property_id,
        unit: finalUnit,
        rent_amount: Number(form.rent_amount) || 0,
        payment_schedule: 'annual',
        lease_start: null as unknown as string,
        lease_end: null as unknown as string,
        agreement_signed: form.agreement_signed,
        notes: form.notes || undefined,
        payment_status: form.payment_status,
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
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="08012345678" required />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="eyebrow">WhatsApp</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={whatsappSame}
                  onChange={e => setWhatsappSame(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Same as phone</span>
              </label>
            </div>
            {!whatsappSame && (
              <input type="tel" className="field" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="08012345678" />
            )}
            {whatsappSame && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', fontSize: 13.5, color: 'var(--text-3)', border: '1px solid var(--line)' }}>
                {form.phone || 'Will use phone number'}
              </div>
            )}
          </div>

          <Field label="Email (optional)" value={form.email} onChange={v => set('email', v)} placeholder="emeka@gmail.com" type="email" />
          <Field label="NIN (optional)" value={form.nin} onChange={v => set('nin', v)} placeholder="12345678901" />
        </div>

        {/* Property & Unit */}
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
            <label className="eyebrow">Unit type *</label>
            <select
              className="field"
              value={unitType}
              onChange={e => setUnitType(e.target.value)}
              required
              disabled={!selectedProperty}
              style={!selectedProperty ? { opacity: 0.5 } : undefined}
            >
              <option value="">{selectedProperty ? 'Select unit type' : 'Select a property first'}</option>
              {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {unitType === 'Other / Custom' && (
              <input
                className="field"
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                placeholder="Describe the unit e.g. Ground floor shop with mezzanine"
                required
                autoFocus
              />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Annual rent (₦)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
              <input type="number" className="field" value={form.rent_amount} onChange={e => set('rent_amount', e.target.value)} placeholder="1800000" style={{ paddingLeft: 24 }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>You can add lease dates and payment records after.</p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.agreement_signed} onChange={e => set('agreement_signed', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
            <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Tenancy agreement has been signed</span>
          </label>
        </div>

        {/* Payment status */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 3 }}>Payment status</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>What is the current rent situation for this tenant?</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['paid', 'owing', 'uncertain'] as const).map(s => (
              <button key={s} type="button" onClick={() => set('payment_status', s)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12, border: '1.5px solid',
                  borderColor: form.payment_status === s ? (s === 'paid' ? '#1A7F4B' : s === 'owing' ? '#C0392B' : '#B45309') : 'var(--line)',
                  background: form.payment_status === s ? (s === 'paid' ? '#E8F5EE' : s === 'owing' ? '#FEF3F2' : '#FFF8ED') : 'var(--surface-2)',
                  color: form.payment_status === s ? (s === 'paid' ? '#1A7F4B' : s === 'owing' ? '#C0392B' : '#B45309') : 'var(--text-3)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}>
                {s === 'paid' ? 'Paid' : s === 'owing' ? 'Owing' : 'Uncertain'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 3 }}>Notes</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Optional — anything worth remembering about this tenant</p>
          </div>
          <textarea
            className="field"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="e.g. Prefers rent via bank transfer. Has a dog. Extended family lives there. Called about pipe issue Jan 2026."
            rows={4}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {error && (
          error.toLowerCase().includes('limit') || error.toLowerCase().includes('upgrade') || error.toLowerCase().includes('plan')
            ? <div style={{ background: '#1C1B18', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Plan limit reached</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>{error}</p>
                <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#C4992A,#E8C94A)', color: '#1C1B18', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Upgrade to Pro
                </Link>
              </div>
            : <p style={{ fontSize: 13, color: '#C0392B', background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
        )}

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
