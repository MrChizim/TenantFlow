'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, ImageIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { ALL_STATES, getCities } from '@/lib/nigeria';
import { canAddProperty } from '@/lib/plan';
import type { PropertyType } from '@/types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'self_contain',     label: 'Self Contain / Room & Parlour' },
  { value: 'mini_flat',        label: 'Mini Flat / Studio' },
  { value: '1_bedroom_flat',   label: 'Flat (1–5 bedroom)' },
  { value: '3_bedroom_bungalow', label: 'Bungalow' },
  { value: '3_bedroom_duplex', label: 'Duplex / Storey Building' },
  { value: 'fully_detached',   label: 'Detached / Semi-Detached House' },
  { value: 'shop',             label: 'Shop / Office / Commercial' },
  { value: 'land_residential', label: 'Land' },
  { value: 'short_let',        label: 'Short Let / Airbnb' },
  { value: 'other',            label: 'Other — describe below' },
];

function Field({ label, value, onChange, placeholder, required, type = 'text', prefix, sub }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; prefix?: string; sub?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="eyebrow">{label}{required ? ' *' : ''}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none', zIndex: 1 }}>{prefix}</span>}
        <input type={type} className="field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={prefix ? { paddingLeft: 24 } : undefined} />
      </div>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</p>}
    </div>
  );
}

export default function NewPropertyPage() {
  const router = useRouter();
  const addProperty = useStore(s => s.addProperty);
  const addNotification = useStore(s => s.addNotification);
  const properties = useStore(s => s.properties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [customCity, setCustomCity] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', state: '', city: '', type: 'self_contain' as PropertyType,
    description: '', total_units: '1',
    purchase_price: '', build_cost: '', purchase_date: '', owner_name: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cities = getCities(form.state);
  const totalInvestment = (Number(form.purchase_price) || 0) + (Number(form.build_cost) || 0);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function uploadImage(supabase: ReturnType<typeof createClient>, userId: string): Promise<string | undefined> {
    if (!imageFile) return undefined;
    setUploadProgress(true);
    const ext = imageFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('property-images').upload(path, imageFile);
    setUploadProgress(false);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { allowed, reason } = await canAddProperty(supabase, user.id, properties.length);
      if (!allowed) {
        setError(reason ?? 'Plan limit reached');
        setLoading(false);
        return;
      }

      const image_url = await uploadImage(supabase, user.id);
      await addProperty(supabase, user.id, {
        name: form.name, address: form.address, city: form.city, state: form.state,
        type: form.type,
        description: form.description || undefined,
        total_units: Number(form.total_units),
        image_url,
        purchase_price: Number(form.purchase_price) || undefined,
        build_cost: Number(form.build_cost) || undefined,
        purchase_date: form.purchase_date || undefined,
        owner_name: form.owner_name || undefined,
      });
      addNotification({ title: 'Property added', body: `${form.name} has been added to your portfolio.` });
      router.push('/properties');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href="/properties" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>Add property</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Enter the property details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Image upload */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Property photo</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 200, border: '1px solid var(--line)' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={removeImage} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} style={{ border: '1.5px dashed var(--line-2)', borderRadius: 14, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--surface-2)', transition: 'background 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-tint)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line-2)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={18} color="var(--text-3)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 3 }}>Click to upload photo</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>JPG, PNG up to 5MB</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, background: 'var(--text-1)', color: '#fff', fontSize: 13 }}>
                <Upload size={13} /> Choose file
              </div>
            </button>
          )}
        </div>

        {/* Property details */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Property details</p>
          <Field label="Property name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Adeola Court" required />
          <Field label="Street address" value={form.address} onChange={v => set('address', v)} placeholder="e.g. 14 Adeola Odeku Street" required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">State *</label>
              <select className="field" value={form.state} onChange={e => { set('state', e.target.value); set('city', ''); }} required>
                <option value="">Select state</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">City *</label>
              {cities.length > 0 && !customCity ? (
                <select
                  className="field"
                  value={form.city}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomCity(true);
                      set('city', '');
                    } else {
                      set('city', e.target.value);
                    }
                  }}
                  required
                  disabled={!form.state}
                >
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">Other — type manually ✏️</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="field"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="Enter city name"
                    required
                    autoFocus={customCity}
                    style={{ flex: 1 }}
                  />
                  {customCity && cities.length > 0 && (
                    <button type="button" onClick={() => { setCustomCity(false); set('city', ''); }}
                      style={{ padding: '0 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Back to list
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">Property type *</label>
              <select className="field" value={form.type} onChange={e => set('type', e.target.value)} required>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Field label="Total units" type="number" value={form.total_units} onChange={v => set('total_units', v)} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Description (optional)</label>
            <textarea className="field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. 6-unit block with 2 self contains, 3 two-bedroom flats, and 1 duplex" rows={3} style={{ resize: 'vertical' }} />
          </div>

          <Field label="Owner / landlord name" value={form.owner_name} onChange={v => set('owner_name', v)} placeholder="e.g. Chukwuemeka Adeola" />
        </div>

        {/* Investment cost */}
        <div className="surface" style={{ padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 3 }}>Investment cost</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>Used for ROI calculations — optional</p>
          </div>
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
          <button type="submit" disabled={loading || uploadProgress} className="btn btn-dark">
            {loading || uploadProgress
              ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : 'Save property'}
          </button>
          <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
