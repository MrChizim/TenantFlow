'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const titles: Record<string, { title: string; sub: string }> = {
  '/dashboard':  { title: 'Dashboard',   sub: 'Overview of your portfolio' },
  '/properties': { title: 'Properties',  sub: 'Your buildings and units' },
  '/tenants':    { title: 'Tenants',     sub: 'All tenants across properties' },
  '/renewals':   { title: 'Renewals',    sub: 'Track upcoming lease expirations' },
  '/reminders':  { title: 'Reminders',   sub: 'Automated tenant notifications' },
  '/expenses':   { title: 'Expenses',    sub: 'Maintenance, repairs and running costs' },
  '/roi':        { title: 'ROI',         sub: 'Investment return calculator' },
  '/reports':    { title: 'Reports',     sub: 'Portfolio performance overview' },
  '/settings':   { title: 'Settings',    sub: 'Account and preferences' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TopBar() {
  const pathname = usePathname();
  const base = '/' + pathname.split('/')[1];
  const info = titles[base] ?? { title: 'TenantFlow', sub: '' };

  const notifications = useStore(s => s.notifications);
  const markAllRead = useStore(s => s.markAllRead);
  const unread = notifications.filter(n => !n.read).length;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topbar-padding" style={{
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px',
      background: 'rgba(250,250,248,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #ECEAE5',
      flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.title}
        </p>
        {info.sub && (
          <p style={{ fontSize: 11.5, color: '#C8C5BE', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.01em' }}>
            {info.sub}
          </p>
        )}
      </div>

      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: open ? '#F2F1EE' : 'transparent',
            border: '1px solid #ECEAE5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative', transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F2F1EE'; (e.currentTarget as HTMLElement).style.borderColor = '#DDDAD4'; }}
          onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; } }}
        >
          <Bell size={14} color="#6B6860" strokeWidth={1.8} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#C4992A', border: '1.5px solid #FAFAF8' }} />
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 42, right: 0,
            width: 320, background: '#fff',
            border: '1px solid #ECEAE5', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 50, overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F2F1EE' }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1B18' }}>
                Notifications
                {unread > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#C4992A', background: '#FDF8EC', border: '1px solid #F0E0A0', padding: '1px 7px', borderRadius: 99, marginLeft: 6 }}>{unread}</span>}
              </p>
              <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#A8A59E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                <CheckCheck size={12} /> Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#A8A59E', fontSize: 13 }}>No notifications</div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.map((n, i) => (
                  <div key={n.id} style={{
                    display: 'flex', gap: 10, padding: '12px 16px',
                    borderTop: i > 0 ? '1px solid #F2F1EE' : undefined,
                    background: n.read ? 'transparent' : '#FDFCF9',
                    transition: 'background 0.1s', cursor: 'default',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : '#FDFCF9'; }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? '#E8E7E3' : '#C4992A', marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18', marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: '#A8A59E', lineHeight: 1.4 }}>{n.body}</p>
                      <p style={{ fontSize: 11, color: '#C8C5BE', marginTop: 4 }}>{timeAgo(n.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
