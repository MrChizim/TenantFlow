'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Bell, Crown } from 'lucide-react';

const nav = [
  { href: '/dashboard',         label: 'Home',       icon: LayoutDashboard },
  { href: '/properties',        label: 'Properties', icon: Building2 },
  { href: '/tenants',           label: 'Tenants',    icon: Users },
  { href: '/reminders',         label: 'Reminders',  icon: Bell },
  { href: '/dashboard/billing', label: 'Billing',    icon: Crown },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 68,
      background: '#fff',
      borderTop: '1px solid #ECEAE5',
      zIndex: 50,
      padding: '0 4px',
      alignItems: 'stretch',
      justifyContent: 'space-around',
    }}>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, flex: 1, textDecoration: 'none',
            color: active ? '#1C1B18' : '#B8B5AE',
            transition: 'color 0.12s',
          }}>
            <div style={{
              width: 36, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? '#1C1B18' : 'transparent',
              transition: 'background 0.12s',
            }}>
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} color={active ? '#fff' : '#B8B5AE'} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, letterSpacing: '0.01em' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
