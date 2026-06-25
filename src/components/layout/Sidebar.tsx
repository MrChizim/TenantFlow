'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, CalendarClock,
  Bell, BarChart3, LogOut, PanelLeftClose, PanelLeftOpen,
  Receipt, TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/tenants',    label: 'Tenants',    icon: Users },
  { href: '/renewals',   label: 'Renewals',   icon: CalendarClock },
  { href: '/reminders',  label: 'Reminders',  icon: Bell },
  { href: '/expenses',   label: 'Expenses',   icon: Receipt },
  { href: '/roi',        label: 'ROI',        icon: TrendingUp },
  { href: '/reports',    label: 'Reports',    icon: BarChart3 },
];

interface Props { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const W = collapsed ? 68 : 228;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="sidebar" style={{
      position: 'fixed', left: 0, top: 0, height: '100vh',
      width: W,
      background: '#FAFAF8',
      borderRight: '1px solid #ECEAE5',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 40,
      overflow: 'hidden',
    }}>

      {/* Logo row */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 0' : '0 16px 0 20px',
        borderBottom: '1px solid #ECEAE5',
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="TenantFlow" width={120} height={120} style={{ objectFit: 'contain', height: 44, width: 'auto' }} />
          </Link>
        )}
        {collapsed && (
          <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/logo.png" alt="TenantFlow" width={120} height={120} style={{ objectFit: 'contain', width: 36, height: 36 }} />
          </Link>
        )}
        {!collapsed && (
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', color: '#C8C5BE', transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#C8C5BE'; }}
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button onClick={onToggle} style={{ margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', color: '#C8C5BE', transition: 'color 0.12s, background 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#C8C5BE'; }}
        >
          <PanelLeftOpen size={15} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '16px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', overflowX: 'hidden' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 11,
                padding: collapsed ? '11px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'background 0.12s, color 0.12s',
                background: active ? '#1C1B18' : 'transparent',
                color: active ? '#fff' : '#7A7670',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = active ? '#fff' : '#1C1B18'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = active ? '#fff' : '#7A7670'; }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} color={active ? '#fff' : '#A8A59E'} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop: '1px solid #ECEAE5', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href="/home" title={collapsed ? 'Homepage' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8, padding: collapsed ? '10px 0' : '8px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, textDecoration: 'none', fontSize: 13, color: '#C8C5BE', transition: 'background 0.12s, color 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0EFEB'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C8C5BE'; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {!collapsed && <span>Homepage</span>}
        </Link>
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8,
            padding: collapsed ? '10px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#C8C5BE',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0EFEB'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C8C5BE'; }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
