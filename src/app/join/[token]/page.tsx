'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import { Check, AlertCircle } from 'lucide-react';

const UNIT_TYPES = [
  'Self Contain', 'Room & Parlour', 'Mini Flat', 'Studio',
  '1 Bedroom Flat', '2 Bedroom Flat', '3 Bedroom Flat', '4 Bedroom Flat', '5 Bedroom Flat',
  '2 Bedroom Bungalow', '3 Bedroom Bungalow', '4 Bedroom Bungalow',
  '3 Bedroom Duplex', '4 Bedroom Duplex', '5 Bedroom Duplex',
  'Terraced House', 'Semi-Detached', 'Fully Detached', 'Penthouse', "Boy's Quarters", 'Shop', 'Other',
];

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', whatsapp: '', email: '',
    unit_type: '', rent_amount: '', lease_start: '', notes: '',
  });
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [customUnit, setCustomUnit] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'owing' | 'uncertain'>('paid');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/invite/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...form,
          unit_type: form.unit_type === 'Other' ? customUnit : form.unit_type,
          whatsapp: whatsappSame ? form.phone : form.whatsapp,
          payment_status: paymentStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong');
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={28} color="#2E7D32" strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.02em', marginBottom: 10 }}>You're all set!</h1>
        <p style={{ fontSize: 14, color: '#7A7670', lineHeight: 1.7 }}>Your details have been submitted. Your landlord will be in touch.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #ECEAE5', background: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src="/logo.png" alt="TenantFlow" width={140} height={60} style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.02em', marginBottom: 6 }}>Tenant registration</h1>
          <p style={{ fontSize: 14, color: '#7A7670', lineHeight: 1.6 }}>Fill in your details below. Your landlord will receive them automatically.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Name */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ECEAE5', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B18', paddingBottom: 10, borderBottom: '1px solid #ECEAE5' }}>Your name</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>First name *</label>
                <input className="field" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="e.g. Chioma" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Last name</label>
                <input className="field" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="e.g. Okafor" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ECEAE5', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B18', paddingBottom: 10, borderBottom: '1px solid #ECEAE5' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Phone number *</label>
              <input className="field" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 08012345678" required />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="wa-same" checked={whatsappSame} onChange={e => setWhatsappSame(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#1C1B18', cursor: 'pointer' }} />
              <label htmlFor="wa-same" style={{ fontSize: 13.5, color: '#5A5750', cursor: 'pointer' }}>WhatsApp is the same number</label>
            </div>
            {!whatsappSame && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>WhatsApp number</label>
                <input className="field" type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="e.g. 08098765432" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Email (optional)</label>
              <input className="field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. chioma@gmail.com" />
            </div>
          </div>

          {/* Tenancy */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ECEAE5', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B18', paddingBottom: 10, borderBottom: '1px solid #ECEAE5' }}>Tenancy details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Unit type *</label>
              <select className="field" value={form.unit_type} onChange={e => set('unit_type', e.target.value)} required>
                <option value="">Select unit type</option>
                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {form.unit_type === 'Other' && (
                <input className="field" value={customUnit} onChange={e => setCustomUnit(e.target.value)} placeholder="Describe your unit type" required autoFocus />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Annual rent (₦) *</label>
              <input className="field" type="number" value={form.rent_amount} onChange={e => set('rent_amount', e.target.value)} placeholder="e.g. 350000" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Move-in date (optional)</label>
              <input className="field" type="date" value={form.lease_start} onChange={e => set('lease_start', e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Additional notes (optional)</label>
              <textarea className="field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything else your landlord should know" rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Rent status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['paid', 'Paid up'], ['owing', 'Owing rent'], ['uncertain', 'Not sure yet']] as const).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setPaymentStatus(val)}
                    style={{
                      flex: 1, padding: '10px 6px', borderRadius: 12, border: '1.5px solid',
                      borderColor: paymentStatus === val ? (val === 'paid' ? '#1A7F4B' : val === 'owing' ? '#C0392B' : '#B45309') : '#ECEAE5',
                      background: paymentStatus === val ? (val === 'paid' ? '#E8F5EE' : val === 'owing' ? '#FEF3F2' : '#FFF8ED') : '#FAFAF8',
                      color: paymentStatus === val ? (val === 'paid' ? '#1A7F4B' : val === 'owing' ? '#C0392B' : '#B45309') : '#A8A59E',
                      fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF3F2', border: '1px solid #F9BDBA', borderRadius: 12, padding: '12px 16px' }}>
              <AlertCircle size={15} color="#C0392B" />
              <span style={{ fontSize: 13, color: '#C0392B' }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ padding: '15px', borderRadius: 14, background: '#1C1B18', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {loading
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Submitting...</>
              : 'Submit my details'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#C8C5BE', marginTop: 24, lineHeight: 1.7 }}>
          Your information is only visible to your landlord and is stored securely.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
