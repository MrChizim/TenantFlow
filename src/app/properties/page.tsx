'use client';

import Link from 'next/link';
import { Plus, MapPin, ArrowUpRight } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useStore } from '@/lib/store';

const typeLabel: Record<string, string> = {
  self_contain: 'Self Contain', mini_flat: 'Mini Flat', studio: 'Studio',
  '1_bedroom_flat': '1 Bed', '2_bedroom_flat': '2 Bed', '3_bedroom_flat': '3 Bed',
  '4_bedroom_flat': '4 Bed', '5_bedroom_flat': '5 Bed',
  '2_bedroom_bungalow': 'Bungalow', '3_bedroom_bungalow': 'Bungalow', '4_bedroom_bungalow': 'Bungalow',
  '3_bedroom_duplex': 'Duplex', '4_bedroom_duplex': 'Duplex', '5_bedroom_duplex': 'Duplex',
  terraced_house: 'Terraced', semi_detached: 'Semi-Detached', fully_detached: 'Detached',
  penthouse: 'Penthouse', boys_quarters: "BQ", shop: 'Shop', office_space: 'Office',
  warehouse: 'Warehouse', plaza: 'Plaza', showroom: 'Showroom',
  land_residential: 'Land', land_commercial: 'Land', farm_land: 'Farm Land',
  short_let: 'Short Let', other: 'Other',
  room_and_parlour: 'Room & Parlour',
};

export default function PropertiesPage() {
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);

  return (
    <div style={{ maxWidth: 1040 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: '#1C1B18', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
            Properties
          </h1>
          <p style={{ color: '#A8A59E', fontSize: 14 }}>{properties.length} properties in your portfolio</p>
        </div>
        <Link href="/properties/new" className="page-header-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#1C1B18', color: '#fff',
          padding: '9px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          <Plus size={14} strokeWidth={2.5} /> Add property
        </Link>
      </div>

      <div className="prop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        {properties.map(p => {
          const propTenants = tenants.filter(t => t.property_id === p.id);
          const rent = propTenants.reduce((s, t) => s + t.rent_amount, 0);
          const pct = Math.round((propTenants.length / p.total_units) * 100);
          const expiring = propTenants.filter(t => t.status !== 'active').length;

          return (
            <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid #ECEAE5', borderRadius: 20,
                overflow: 'hidden', cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.15s, border-color 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; }}
              >
                {/* Photo */}
                <div style={{ height: 240, background: '#F0EFEB', position: 'relative', overflow: 'hidden' }}>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                    color: '#6B6860', padding: '4px 10px', borderRadius: 99,
                  }}>
                    {typeLabel[p.type]}
                  </span>
                  {expiring > 0 && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      fontSize: 11, fontWeight: 600,
                      background: 'rgba(255,248,237,0.92)', backdropFilter: 'blur(4px)',
                      color: '#B45309', padding: '4px 10px', borderRadius: 99,
                      border: '1px solid rgba(180,83,9,0.2)',
                    }}>
                      {expiring} expiring
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '24px 26px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 17, color: '#1C1B18' }}>{p.name}</p>
                    <ArrowUpRight size={16} color="#C4992A" style={{ flexShrink: 0, marginTop: 2 }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#A8A59E', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
                    <MapPin size={12} strokeWidth={2} /> {p.address}, {p.city}, {p.state}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #F0EFEB', paddingTop: 20, gap: 0 }}>
                    {[
                      { label: 'Tenants', value: String(propTenants.length), serif: true },
                      { label: 'Occupied', value: `${pct}%`, serif: true, gold: true },
                      { label: 'Annual rent', value: formatNaira(rent), serif: true },
                    ].map(({ label, value, serif, gold }, i) => (
                      <div key={label} style={{ textAlign: 'center', borderLeft: i > 0 ? '1px solid #F0EFEB' : undefined, padding: '0 8px' }}>
                        <p style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '1.5rem',
                          fontWeight: 400,
                          color: gold ? '#C4992A' : '#1C1B18',
                          lineHeight: 1.1, marginBottom: 6,
                          letterSpacing: '-0.01em',
                        }}>
                          {value}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#A8A59E' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Occupancy bar */}
                  <div style={{ height: 4, borderRadius: 99, background: '#F0EFEB', marginTop: 20, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, #C4992A, #E8C94A)' }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Add card */}
        <Link href="/properties/new" style={{ textDecoration: 'none' }}>
          <div style={{
            border: '1.5px dashed #DDDAD4', borderRadius: 20, minHeight: 420,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C4992A'; (e.currentTarget as HTMLElement).style.background = '#FDF8EC'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F4F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="#A8A59E" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#6B6860' }}>Add property</p>
              <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 3 }}>Expand your portfolio</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
