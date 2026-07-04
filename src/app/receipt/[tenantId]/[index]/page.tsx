'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, MessageCircle } from 'lucide-react';
import { formatNaira, formatDate } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/plan';

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  online: 'Online / POS',
};

export default function ReceiptPage({ params }: { params: Promise<{ tenantId: string; index: string }> }) {
  const { tenantId, index } = use(params);
  const tenants = useStore(s => s.tenants);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setBusinessName((data as UserProfile)?.business_name ?? null);
    }
    load();
  }, []);

  const tenant = tenants.find(t => t.id === tenantId);
  const entry = tenant?.rent_history?.[Number(index)];

  if (!tenant || !entry) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 80, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#7A7670' }}>Receipt not found.</p>
        <Link href="/tenants" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, color: '#C4992A', textDecoration: 'none', fontWeight: 600 }}>Back to tenants</Link>
      </div>
    );
  }

  const receiptNo = `${tenant.id.slice(0, 8).toUpperCase()}-${index}`;
  const waNum = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '').replace(/^0/, '234');
  const waMessage = `Hello ${tenant.first_name}, here's your rent receipt for ${formatNaira(entry.amount)} (covers ${formatDate(entry.period_start)} to ${formatDate(entry.period_end)}). Thank you.`;
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMessage)}` : null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>
      <div className="receipt-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Link href={`/tenants/${tenant.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#6B6860', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to tenant
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
              <MessageCircle size={15} /> Share via WhatsApp
            </a>
          )}
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: '#1C1B18', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}>
            <Printer size={15} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="receipt-sheet" style={{ background: '#fff', borderRadius: 20, padding: '44px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #ECEAE5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, paddingBottom: 24, borderBottom: '2px solid #1C1B18' }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.02em' }}>
              {businessName || 'Rent receipt'}
            </p>
            <p style={{ fontSize: 12.5, color: '#A8A59E', marginTop: 4 }}>Payment receipt</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E' }}>Receipt No.</p>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18', marginTop: 2 }}>{receiptNo}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E', marginBottom: 6 }}>Received from</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1B18' }}>{tenant.first_name} {tenant.last_name}</p>
            <p style={{ fontSize: 13, color: '#7A7670', marginTop: 2 }}>{tenant.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E', marginBottom: 6 }}>Property</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1B18' }}>{tenant.property?.name ?? '—'}</p>
            <p style={{ fontSize: 13, color: '#7A7670', marginTop: 2 }}>Unit {tenant.unit}</p>
          </div>
        </div>

        <div style={{ background: '#FAFAF8', borderRadius: 14, padding: '24px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <span style={{ fontSize: 13.5, color: '#6B6860' }}>Amount paid</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.02em' }}>{formatNaira(entry.amount)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Date received', formatDate(entry.date)],
              ['Rent period covered', `${formatDate(entry.period_start)} – ${formatDate(entry.period_end)}`],
              ['Payment method', entry.method ? (METHOD_LABELS[entry.method] ?? entry.method) : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#A8A59E' }}>{label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: '#1C1B18' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {entry.note && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A59E', marginBottom: 6 }}>Note</p>
            <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.7 }}>{entry.note}</p>
          </div>
        )}

        <p style={{ fontSize: 11.5, color: '#C7C4BC', textAlign: 'center', marginTop: 32 }}>Generated by TenantFlow</p>
      </div>

      <style>{`
        @media print {
          .receipt-actions { display: none !important; }
          .receipt-sheet { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}
