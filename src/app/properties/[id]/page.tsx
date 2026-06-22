'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Pencil, TrendingUp, Trash2 } from 'lucide-react';
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

  const property = properties.find(p => p.id === id) ?? properties[0];
  const tenants = allTenants.filter(t => t.property_id === property?.id);

  if (!property) return (
    <div style={{ maxWidth: 500 }}>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Property not found.</p>
      <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>Back to properties</Link>
    </div>
  );

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
          <Link href="/tenants/new" className="btn btn-dark" style={{ textDecoration: 'none', fontSize: 13 }}><Plus size={14} /> Add tenant</Link>
        </div>
      </div>

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
