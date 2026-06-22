import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, icon: Icon, accent }: Props) {
  return (
    <div style={{
      borderRadius: 16,
      padding: '20px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      ...(accent ? {
        background: 'linear-gradient(135deg, #1C1B18 0%, #2E2C26 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      } : {
        background: '#fff',
        border: '1px solid #ECEAE5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }),
    }}>
      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          ...(accent
            ? { background: 'rgba(196,153,42,0.15)', border: '1px solid rgba(196,153,42,0.25)' }
            : { background: '#FDF8EC', border: '1px solid #F0E0A0' }
          ),
        }}>
          <Icon size={16} color="#C4992A" strokeWidth={1.75} />
        </div>
        <p style={{
          fontSize: 12.5, fontWeight: 500,
          color: accent ? 'rgba(255,255,255,0.5)' : '#A8A59E',
        }}>
          {label}
        </p>
      </div>

      {/* Value */}
      <div>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '2rem',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: accent ? '#fff' : '#1C1B18',
        }}>
          {value}
        </p>
        {sub && (
          <p style={{
            fontSize: 12,
            marginTop: 4,
            color: accent ? 'rgba(255,255,255,0.3)' : '#B8B5AE',
          }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
