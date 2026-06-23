'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Building2, Users, Bell, TrendingUp, ChevronRight, CheckCircle2, Menu, X, BarChart3, Shield, Smartphone } from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    title: 'Property portfolio',
    body: 'Add all your properties with photos, descriptions, and investment cost tracking. See everything in one place.',
  },
  {
    icon: Users,
    title: 'Tenant management',
    body: 'Record tenant details, track who has paid, how long their payment covers, and who needs to renew.',
  },
  {
    icon: Bell,
    title: 'Renewal reminders',
    body: 'Know exactly which tenants are expiring this month. Never chase someone blindly again.',
  },
  {
    icon: TrendingUp,
    title: 'Rent tracking',
    body: 'Log every payment — full or partial, cash or transfer. Full payment history per tenant.',
  },
  {
    icon: BarChart3,
    title: 'Reports & ROI',
    body: 'See total income, expenses, occupancy rate, and return on investment for each property.',
  },
  {
    icon: Smartphone,
    title: 'Works on mobile',
    body: 'Manage your portfolio from your phone. Designed to work seamlessly on any screen size.',
  },
];

const STEPS = [
  { num: '01', title: 'Add your properties', body: 'Upload a photo, enter the address, number of units, and what you paid for it.' },
  { num: '02', title: 'Add your tenants', body: 'Name, phone, WhatsApp, which unit they occupy, and their annual rent.' },
  { num: '03', title: 'Record payments', body: 'When they pay, log the amount and how many months it covers. TenantFlow handles the rest.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#0E0D0B', color: '#fff', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(14,13,11,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={18} color="#0E0D0B" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#fff' }}>TenantFlow</span>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 14px', borderRadius: 10, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
              Sign in
            </Link>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#0E0D0B', padding: '8px 18px', borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Get started free
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }} className="nav-hamburger">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#1A1914', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px 24px' }}>
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {l}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>Sign in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#0E0D0B', padding: '11px', borderRadius: 10, textDecoration: 'none' }}>Get started free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(196,153,42,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(196,153,42,0.12)', border: '1px solid rgba(196,153,42,0.25)', borderRadius: 99, padding: '6px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4992A' }} />
          <span style={{ fontSize: 12.5, color: '#C4992A', fontWeight: 500 }}>Built for Nigerian landlords</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: 720, marginBottom: 24 }}>
          Property management,{' '}
          <span style={{ background: 'linear-gradient(135deg, #C4992A, #E8C94A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            finally simple
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          Track tenants, log payments, and know exactly who owes you — without spreadsheets or WhatsApp chaos. Built for the way Nigerians actually rent.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#0E0D0B', padding: '13px 28px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 4px 24px rgba(196,153,42,0.3)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(196,153,42,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(196,153,42,0.3)'; }}>
            Start for free <ChevronRight size={16} />
          </Link>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'rgba(255,255,255,0.7)', padding: '13px 24px', borderRadius: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
            Sign in
          </Link>
        </div>

        {/* Trust line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['No credit card required', 'Free to start', 'Works on mobile'].map((t, i) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              <CheckCircle2 size={13} color="#C4992A" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '96px 24px', background: '#0E0D0B' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 14 }}>Everything you need</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Your entire portfolio,<br />in your pocket</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ padding: '32px 28px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,153,42,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(196,153,42,0.12)', border: '1px solid rgba(196,153,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={18} color="#C4992A" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#fff' }}>{title}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: '#111009' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 14 }}>Simple setup</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Up and running<br />in minutes</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map(({ num, title, body }, i) => (
              <div key={num} style={{ display: 'flex', gap: 32, padding: '40px 0', borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: '50%', background: 'rgba(196,153,42,0.1)', border: '1px solid rgba(196,153,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#C4992A' }}>{num}</span>
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#fff' }}>{title}</p>
                  <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 500 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '96px 24px', background: '#0E0D0B' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16, lineHeight: 1.15 }}>Start free, upgrade when ready</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 56 }}>No hidden fees. No pressure.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, textAlign: 'left' }}>
            {/* Free */}
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px', background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Free</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>₦0</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>/month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Up to 3 properties', 'Up to 10 tenants', 'Payment tracking', 'Mobile app access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} color="#C4992A" />
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div style={{ border: '1px solid rgba(196,153,42,0.4)', borderRadius: 20, padding: '32px 28px', background: 'rgba(196,153,42,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#0E0D0B', letterSpacing: '0.04em' }}>POPULAR</div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 180, height: 180, background: 'radial-gradient(circle at top right, rgba(196,153,42,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#C4992A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Pro</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>₦5,000</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>/month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Unlimited properties', 'Unlimited tenants', 'Payment tracking', 'Renewal reminders', 'Reports & ROI', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} color="#C4992A" />
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#0E0D0B', textDecoration: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(196,153,42,0.25)', transition: 'opacity 0.15s, transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', background: '#111009' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Building2 size={26} color="#0E0D0B" strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16, lineHeight: 1.2 }}>
            Stop managing properties<br />with WhatsApp and notebooks
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.7 }}>
            TenantFlow gives every Nigerian landlord a professional system — whether you have 2 units or 200.
          </p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#0E0D0B', padding: '14px 32px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 4px 24px rgba(196,153,42,0.3)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(196,153,42,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(196,153,42,0.3)'; }}>
            Create free account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 24px', background: '#0E0D0B' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={14} color="#0E0D0B" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>TenantFlow</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 TenantFlow. Built for Nigeria.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
