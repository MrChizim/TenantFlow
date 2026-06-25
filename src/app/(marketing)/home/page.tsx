'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Building2, Users, Bell, TrendingUp, BarChart3, Smartphone,
  ChevronDown, ArrowRight, Check, LayoutDashboard, Receipt,
  CreditCard, CalendarClock, Menu, X, MoveRight,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Building2,  title: 'Property portfolio',  body: 'Add every property with photos, address, and unit count. Your entire portfolio in one view.' },
  { icon: Users,      title: 'Tenant management',   body: 'Store contacts, track who is paid up, and flag anyone overdue — all in one list.' },
  { icon: CreditCard, title: 'Payment tracking',    body: 'Record every payment — full or part, cash or transfer — with the period it covers.' },
  { icon: Bell,       title: 'Renewal alerts',      body: 'Know who is expiring soon so you can follow up before rent runs out.' },
  { icon: BarChart3,  title: 'Reports & income',    body: 'Monthly income charts, occupancy rate, and top properties — always current.' },
  { icon: Smartphone, title: 'Works on any device', body: 'Phone, tablet, laptop. No app needed. Just open your browser.' },
];

const STEPS = [
  { num: '01', title: 'Add your properties', body: 'Enter each property — address, city, number of units, and an optional purchase price for ROI tracking.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  { num: '02', title: 'Add your tenants',    body: 'Name, phone, WhatsApp, unit, and annual rent. No lease contracts — just the basics.', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80' },
  { num: '03', title: 'Record payments',     body: 'Enter the amount and how many months it covers. TenantFlow calculates the expiry date.', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
  { num: '04', title: 'Track everything',    body: 'Dashboard shows active tenants, who expires soon, income, and overdue payments at a glance.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
];

const GUIDE = [
  { Icon: LayoutDashboard, title: 'Dashboard',      desc: 'Portfolio snapshot — active tenants, upcoming renewals, and total income.' },
  { Icon: Building2,       title: 'Properties',     desc: 'Add, edit, and view all your properties with photos.' },
  { Icon: Users,           title: 'Tenants',        desc: 'Every tenant in one list. Active, expiring, overdue — colour-coded.' },
  { Icon: CreditCard,      title: 'Record Payment', desc: 'Log a payment and the app calculates the new expiry date automatically.' },
  { Icon: CalendarClock,   title: 'Renewals',       desc: 'Tenants sorted by how soon they expire — overdue first.' },
  { Icon: BarChart3,       title: 'Reports',        desc: 'Monthly income chart, top properties, and occupancy rate.' },
  { Icon: Receipt,         title: 'Expenses',       desc: 'Log costs per property. These feed into your ROI calculation.' },
  { Icon: TrendingUp,      title: 'ROI Calculator', desc: 'Enter purchase price and costs to see your annual yield and payback period.' },
];

const FAQS = [
  { q: 'How is this different from using Excel?', a: 'Excel makes you do all the maths — calculating expiry dates, flagging who is overdue, building reports. TenantFlow does it all automatically. You just enter the data.' },
  { q: 'Do I need lease contracts?', a: 'No. TenantFlow is built for the Nigerian rental market. You record the amount paid and the duration it covers — no formal lease required.' },
  { q: 'What happens when rent expires?', a: 'The tenant status turns overdue automatically. You\'ll see it on the dashboard and Renewals page so you know exactly who to chase.' },
  { q: 'Can tenants pay in instalments?', a: 'Yes. Record each payment separately with a note. Every entry is logged in the tenant\'s full payment history.' },
  { q: 'Does it work on my phone?', a: 'Yes. TenantFlow is fully mobile-responsive. No app to download — just open it in any browser.' },
  { q: 'How many properties can I add?', a: 'Free plan covers up to 3 properties and 10 tenants. Pro gives you unlimited access.' },
  { q: 'Is my data private?', a: 'Completely. Each account is isolated — your data is only visible to you.' },
  { q: 'Can I track short-let or Airbnb properties?', a: 'Yes. Short Let / Airbnb is a supported property type. You can track payments and occupancy the same way.' },
];

/* ─── FAQ item ──────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E8E6E1' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#1C1B18', lineHeight: 1.5 }}>{q}</span>
        <ChevronDown size={16} color="#B0ADA6" strokeWidth={2} style={{ flexShrink: 0, marginTop: 3, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <p style={{ fontSize: 14.5, color: '#6B6860', lineHeight: 1.85, paddingBottom: 20, marginTop: -4 }}>{a}</p>}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const NAV_LINKS = [['Features', '#features'], ['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']] as const;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1C1B18', overflowX: 'hidden', background: '#fff' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'all 0.2s',
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #ECEAE5' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/home" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="TenantFlow" width={160} height={60} style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <nav className="tf-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 14, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#1C1B18'; (e.target as HTMLElement).style.background = '#F4F3F0'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#6B6860'; (e.target as HTMLElement).style.background = 'transparent'; }}>
                {l}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="tf-desktop-nav" style={{ fontSize: 14, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '9px 16px', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
              Sign in
            </Link>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 600, background: '#1C1B18', color: '#fff', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Get started
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="tf-hamburger" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#1C1B18' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #ECEAE5', padding: '8px 24px 24px' }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '14px 0', fontSize: 15, fontWeight: 500, color: '#1C1B18', textDecoration: 'none', borderBottom: '1px solid #F4F3F0' }}>
                {l}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', border: '1.5px solid #ECEAE5', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#6B6860', textDecoration: 'none' }}>Sign in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '13px', background: '#1C1B18', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>Get started free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Full-bleed image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/hero1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,9,8,0.82) 0%, rgba(10,9,8,0.55) 55%, rgba(10,9,8,0.2) 100%)' }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '120px 32px 80px', width: '100%' }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(196,153,42,0.15)', border: '1px solid rgba(196,153,42,0.35)', borderRadius: 99, padding: '6px 16px', marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4992A', flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#E8C94A', letterSpacing: '0.02em' }}>Built for Nigerian landlords</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 4.6rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#fff', marginBottom: 24 }}>
              Manage your<br />properties like<br />a professional
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>
              Track tenants, log payments, and know exactly who is paid up — all from your phone. No spreadsheets. No notebooks.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, background: '#C4992A', color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Start for free <ArrowRight size={16} />
              </Link>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.8)', padding: '14px 24px', borderRadius: 12, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}>
                Sign in
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Free to start', 'No credit card', 'Works on mobile'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  <Check size={13} color="#C4992A" strokeWidth={2.5} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </section>

      {/* ── Social proof strip ──────────────────────────────────────────── */}
      <section style={{ background: '#F7F6F3', borderTop: '1px solid #ECEAE5', borderBottom: '1px solid #ECEAE5', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['Free to start', 'No credit card needed'], ['Nigerian-built', 'For the way we actually rent'], ['Mobile-first', 'Works on any device']].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1B18' }}>{title}</p>
              <p style={{ fontSize: 12, color: '#A8A59E', marginTop: 2 }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="tf-features-grid">
            <div style={{ position: 'sticky', top: 100 }} className="tf-features-sticky">
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>Features</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#1C1B18', lineHeight: 1.1, marginBottom: 20 }}>
                Everything in one place
              </h2>
              <p style={{ fontSize: 15.5, color: '#7A7670', lineHeight: 1.8, marginBottom: 36 }}>
                Stop juggling WhatsApp messages, notebooks, and spreadsheets. TenantFlow keeps everything organised — properties, tenants, payments, and reports — in one clean tool.
              </p>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#1C1B18', textDecoration: 'none', borderBottom: '2px solid #C4992A', paddingBottom: 2, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                See it in action <MoveRight size={15} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} style={{ display: 'flex', gap: 18, padding: '24px 0', borderBottom: '1px solid #F0EFEB' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F6F1E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Icon size={18} color="#C4992A" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1B18', marginBottom: 5 }}>{title}</p>
                    <p style={{ fontSize: 13.5, color: '#7A7670', lineHeight: 1.7 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 32px', background: '#F7F6F3' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#1C1B18', lineHeight: 1.1 }}>Up and running in minutes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {STEPS.map(({ num, title, body, img }, i) => (
              <div key={num} className="tf-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                <div style={{ order: i % 2 === 0 ? 0 : 1 }} className="tf-step-text">
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#C4992A', textTransform: 'uppercase' }}>Step {num}</span>
                  <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.2 }}>{title}</h3>
                  <p style={{ fontSize: 15.5, color: '#7A7670', lineHeight: 1.85 }}>{body}</p>
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0, borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }} className="tf-step-img">
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App guide ───────────────────────────────────────────────────── */}
      <section id="guide" style={{ padding: '100px 32px', background: '#1C1B18' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ maxWidth: 540, marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>App guide</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.1 }}>Every section, explained</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginTop: 14, lineHeight: 1.75 }}>A quick map of what's inside TenantFlow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {GUIDE.map(({ Icon, title, desc }) => (
              <div key={title}
                style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,153,42,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(196,153,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} color="#C4992A" strokeWidth={1.8} />
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '100px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }} className="tf-faq-grid">
          <div style={{ position: 'sticky', top: 100 }} className="tf-faq-sticky">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#1C1B18', lineHeight: 1.1, marginBottom: 20 }}>Questions<br />we get a lot</h2>
            <p style={{ fontSize: 15, color: '#7A7670', lineHeight: 1.8 }}>Can't find what you're looking for? <Link href="/signup" style={{ color: '#C4992A', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link> and try it yourself — it's free.</p>
          </div>
          <div style={{ borderTop: '1px solid #E8E6E1' }}>
            {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 32px', background: '#F7F6F3' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#1C1B18', lineHeight: 1.1, marginBottom: 12 }}>Start free, upgrade when ready</h2>
            <p style={{ fontSize: 15.5, color: '#7A7670' }}>No hidden fees. No pressure.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Free */}
            <div style={{ background: '#fff', border: '1.5px solid #E8E6E1', borderRadius: 24, padding: '36px 32px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#A8A59E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>Free</p>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.04em' }}>₦0</span>
              </div>
              <p style={{ fontSize: 13, color: '#A8A59E', marginBottom: 28 }}>Forever free, no card needed</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {['Up to 3 properties', 'Up to 10 tenants', 'Payment tracking', 'Mobile access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Check size={14} color="#C4992A" strokeWidth={2.5} />
                    <span style={{ fontSize: 14, color: '#6B6860' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12, border: '1.5px solid #DEDAD3', color: '#6B6860', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1B18'; (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DEDAD3'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: '#1C1B18', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', borderRadius: 99, padding: '5px 12px', fontSize: 10.5, fontWeight: 800, color: '#1C1B18', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Popular</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#C4992A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>Pro</p>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦5,000</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>Per month, cancel anytime</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {['Unlimited properties', 'Unlimited tenants', 'Payment tracking', 'Renewal reminders', 'Reports & ROI', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Check size={14} color="#C4992A" strokeWidth={2.5} />
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#1C1B18', textDecoration: 'none', fontSize: 14, fontWeight: 700, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 32px', background: '#1C1B18' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <Image src="/logo.png" alt="TenantFlow" width={120} height={120} style={{ height: 80, width: 'auto', objectFit: 'contain', margin: '0 auto 28px', display: 'block', filter: 'brightness(0) invert(1)' }} />
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.1, marginBottom: 18 }}>
            Your properties deserve better than a notebook
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 40, lineHeight: 1.8 }}>
            Join landlords across Nigeria managing tenants professionally.
          </p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, background: '#C4992A', color: '#fff', padding: '16px 34px', borderRadius: 14, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#111110' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '60px 32px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, marginBottom: 52, flexWrap: 'wrap' }} className="tf-footer-top">
            <div style={{ maxWidth: 280 }}>
              <Link href="/home" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
                <Image src="/logo.png" alt="TenantFlow" width={140} height={60} style={{ height: 52, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </Link>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8 }}>
                Simple, professional property management — built for the way Nigerians actually rent.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }} className="tf-footer-links">
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Product</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['Features', '#features'], ['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
                    <a key={l} href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Account</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['Sign in', '/login'], ['Create account', '/signup']].map(([l, h]) => (
                    <Link key={l} href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 TenantFlow. Built for Nigeria.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)' }}>Made with care for Nigerian landlords.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .tf-desktop-nav { display: none !important; }
          .tf-hamburger { display: flex !important; }
          .tf-features-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tf-features-sticky { position: static !important; }
          .tf-step { grid-template-columns: 1fr !important; gap: 28px !important; }
          .tf-step-text { order: 0 !important; }
          .tf-step-img { order: 1 !important; }
          .tf-faq-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tf-faq-sticky { position: static !important; }
          .tf-footer-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
