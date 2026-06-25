'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Pencil, TrendingUp, Trash2, Link2, Copy, Check } from 'lucide-react';
import { formatNaira, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const properties = useStore(s => s.properties);
  const allTenants = useStore(s => s.tenants);
  const deleteProperty = useStore(s => s.deleteProperty);
  const addNotification = useStore(s => s.addNotification);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const property = properties.find(p => p.id === id) ?? properties[0];
  const tenants = allTenants.filter(t => t.property_id === property?.id);

  if (!property) return (
    <div style={{ maxWidth: 500 }}>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Property not found.</p>
      <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>Back to properties</Link>
    </div>
  );

  async function handleGenerateLink() {
    setInviteLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: id }),
      });
      const json = await res.json();
      if (json.url) setInviteUrl(json.url);
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      await deleteProperty(supabase, id);
      addNotification({ title: 'Property removed', body: `${property.name} has been removed from your portfolio.` });
      router.push('/properties');
    } catch { setDeleting(false); setShowDeleteModal(false); }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Link href="/properties" className="btn btn-outline" style={{ padding: '8px 10px', textDecoration: 'none' }}><ArrowLeft size={15} /></Link>
        <div style={{ flex: 1 }}>
          <h1 className="serif" style={{ fontSize: '1.6rem', color: 'var(--text-1)', letterSpacing: '-0.015em' }}>{property.name}</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><MapPin size={11} /> {property.address}, {property.city}, {property.state}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-outline" style={{ fontSize: 13, color: 'var(--red)', borderColor: 'var(--red-line)' }}><Trash2 size={13} /></button>
          <Link href={`/properties/${id}/edit`} className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 13 }}><Pencil size={13} /> Edit</Link>
          <button onClick={handleGenerateLink} disabled={inviteLoading} className="btn btn-outline" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link2 size={13} />{inviteLoading ? 'Generating...' : 'Tenant link'}
          </button>
          <Link href="/tenants/new" className="btn btn-dark" style={{ textDecoration: 'none', fontSize: 13 }}><Plus size={14} /> Add tenant</Link>
        </div>
      </div>

      {inviteUrl && (
        <div style={{ background: '#F0FAF4', border: '1px solid #A8E0B8', borderRadius: 16, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link2 size={15} color="#2E7D32" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', marginBottom: 2 }}>Tenant registration link — valid for 30 days</p>
            <p style={{ fontSize: 12.5, color: '#5A5750', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteUrl}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 10, background: copied ? '#2E7D32' : '#1C1B18', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Hi, please fill this form to register as a tenant: ${inviteUrl}`)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 10, background: '#25D366', color: '#fff', textDecoration: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      )}

      {property.image_url && (
        <div style={{ height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--line)' }}>
          <img src={property.image_url} alt={property.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {((property.purchase_price ?? 0) + (property.build_cost ?? 0)) > 0 && (
        <div className="surface" style={{ padding: '18px 24px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 7 }}><TrendingUp size={14} color="var(--gold)" /> Investment cost</p>
            <Link href="/roi" style={{ fontSize: 12.5, color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>View ROI →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            {[
              { label: 'Land / purchase', value: property.purchase_price },
              { label: 'Build / renovation', value: property.build_cost },
              { label: 'Total invested', value: (property.purchase_price ?? 0) + (property.build_cost ?? 0), bold: true },
            ].filter(r => (r.value ?? 0) > 0).map(row => (
              <div key={row.label}>
                <p className="eyebrow" style={{ marginBottom: 5 }}>{row.label}</p>
                <p style={{ fontSize: row.bold ? 15 : 13.5, fontWeight: row.bold ? 700 : 600, color: row.bold ? 'var(--gold)' : 'var(--text-1)' }}>{formatNaira(row.value ?? 0)}</p>
              </div>
            ))}
            {property.purchase_date && (
              <div>
                <p className="eyebrow" style={{ marginBottom: 5 }}>Acquired</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{formatDate(property.purchase_date)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="surface" style={{ overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>
            Tenants <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>{tenants.length} of {property.total_units} units occupied</span>
          </p>
        </div>
        {tenants.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 16 }}>No tenants in this property yet.</p>
            <Link href="/tenants/new" className="btn btn-dark" style={{ textDecoration: 'none' }}><Plus size={14} /> Add tenant</Link>
          </div>
        ) : (
          tenants.map((t, i) => (
            <Link key={t.id} href={`/tenants/${t.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderTop: i > 0 ? '1px solid var(--line)' : undefined, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gold-tint)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--gold)', flexShrink: 0 }}>{t.first_name[0]}{t.last_name[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{t.first_name} {t.last_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{t.unit} · {t.phone}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{formatNaira(t.rent_amount)}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Expires {formatDate(t.lease_end)}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Delete property?</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.6 }}>
              This will permanently delete <strong style={{ color: 'var(--text-1)' }}>{property.name}</strong> along with all {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} and expenses linked to it. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-dark" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }}>
                {deleting ? '...' : 'Yes, delete'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
