'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Building2, Users, Bell, TrendingUp, BarChart3, Smartphone,
  ChevronDown, ArrowRight, Check, LayoutDashboard, Receipt,
  CreditCard, CalendarClock, Menu, X,
} from 'lucide-react';

/* ── Data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Building2,   title: 'Property portfolio',  body: 'Add every property with photos, address, and unit count. See your entire portfolio at a glance.' },
  { icon: Users,       title: 'Tenant management',   body: 'Store contact details, track who is paid up, and flag anyone overdue — all in one list.' },
  { icon: CreditCard,  title: 'Payment tracking',    body: 'Record every payment — full or part, cash or transfer — with the period it covers.' },
  { icon: Bell,        title: 'Renewal alerts',      body: 'See who is expiring soon so you can follow up before rent runs out.' },
  { icon: BarChart3,   title: 'Reports & income',    body: 'Monthly income charts, occupancy rate, and top-earning properties — always up to date.' },
  { icon: Smartphone,  title: 'Works on any device', body: 'Open it on your phone, tablet, or laptop. No app download. No setup.' },
];

const STEPS = [
  {
    num: '01', title: 'Add your properties',
    body: 'Start by adding each property — address, state, city, number of units, and an optional purchase price for ROI tracking.',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80',
  },
  {
    num: '02', title: 'Add your tenants',
    body: 'Enter the tenant\'s name, phone, WhatsApp, which unit they occupy, and their annual rent. No lease contracts required.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80',
  },
  {
    num: '03', title: 'Record when they pay',
    body: 'Hit "Record payment", enter the amount and how many months it covers. TenantFlow works out the expiry date automatically.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80',
  },
  {
    num: '04', title: 'Check your dashboard',
    body: 'Your dashboard shows active tenants, who is expiring soon, total income, and overdue payments — no spreadsheet needed.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
  },
];

const GUIDE = [
  { Icon: LayoutDashboard, title: 'Dashboard',      desc: 'Snapshot of your entire portfolio — active tenants, upcoming renewals, and total income.' },
  { Icon: Building2,       title: 'Properties',     desc: 'Add, edit, and view all your properties. Upload a photo and set the unit count.' },
  { Icon: Users,           title: 'Tenants',        desc: 'Every tenant in one list. Active, expiring, and overdue — colour-coded at a glance.' },
  { Icon: CreditCard,      title: 'Record Payment', desc: 'Log a payment, choose the duration it covers, and the app calculates the expiry date.' },
  { Icon: CalendarClock,   title: 'Renewals',       desc: 'Tenants sorted by how soon they expire — overdue, next 90 days, 3–6 months, and further out.' },
  { Icon: BarChart3,       title: 'Reports',        desc: 'Monthly income chart, top properties by revenue, and occupancy rate across your portfolio.' },
  { Icon: Receipt,         title: 'Expenses',       desc: 'Log maintenance, repairs, and agent fees per property. These feed into your ROI report.' },
  { Icon: TrendingUp,      title: 'ROI Calculator', desc: 'Enter purchase price and costs to see annual yield, total return, and payback period.' },
];

const FAQS = [
  {
    q: 'How is this different from just using Excel?',
    a: 'Excel needs you to do all the maths yourself — calculating expiry dates, flagging who is overdue, generating reports. TenantFlow does all of that automatically. You just enter the data.',
  },
  {
    q: 'Do I need to sign any lease contracts?',
    a: 'No. TenantFlow is built for the Nigerian rental market where landlords collect upfront rent without formal leases. You record the amount paid and the duration it covers — the app handles the rest.',
  },
  {
    q: 'What happens when a tenant\'s rent expires?',
    a: 'Their status automatically turns overdue. You\'ll see it on the dashboard and in the Renewals section so you know who to follow up with.',
  },
  {
    q: 'Can a tenant pay in instalments?',
    a: 'Yes. Record each payment separately with a note. Every payment is logged in the tenant\'s history so you have a full trail.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes. TenantFlow is fully mobile-responsive — no app download needed. Just open it in your browser on any device.',
  },
  {
    q: 'How many properties and tenants can I add?',
    a: 'The free plan covers up to 3 properties and 10 tenants. Upgrade to Pro for unlimited access.',
  },
  {
    q: 'Is my data private?',
    a: 'Completely. Each account only sees its own data — no one else can access your tenants or properties.',
  },
  {
    q: 'Can I track short-let or Airbnb properties?',
    a: 'Yes. Short Let / Airbnb is a property type you can select. You can track payments and occupancy the same way as a regular property.',
  },
];

const HERO_IMGS = [
  '/hero1.png',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=85',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85',
];

/* ── Subcomponents ──────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #ECEAE5' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 15.5, fontWeight: 500, color: '#1C1B18', lineHeight: 1.45 }}>{q}</span>
        <ChevronDown size={17} color="#A8A59E" style={{ flexShrink: 0, marginTop: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <p style={{ fontSize: 14.5, color: '#6B6860', lineHeight: 1.8, paddingBottom: 22, marginTop: -6 }}>{a}</p>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#fff', color: '#1C1B18', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #ECEAE5' : '1px solid transparent',
        transition: 'background 0.25s, border-color 0.25s, backdrop-filter 0.25s',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Wordmark */}
          <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image src="/logo.png" alt="TenantFlow" width={200} height={200} style={{ objectFit: 'contain', height: 64, width: 'auto' }} />
          </Link>

          {/* Centre links */}
          <nav className="tf-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[['Features', '#features'], ['How it works', '#how-it-works'], ['Guide', '#guide'], ['FAQ', '#faq'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h}
                style={{ fontSize: 13.5, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '7px 13px', borderRadius: 8, transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F2F1EE'; (e.target as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#6B6860'; }}
              >{l}</a>
            ))}
          </nav>

          {/* Right CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="tf-nav-links" style={{ fontSize: 13.5, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
              Sign in
            </Link>
            <Link href="/signup"
              style={{ fontSize: 13.5, fontWeight: 600, background: '#1C1B18', color: '#fff', padding: '9px 18px', borderRadius: 9, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.82'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Get started
            </Link>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} className="tf-hamburger"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#1C1B18', padding: 4, borderRadius: 8 }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #ECEAE5', padding: '12px 24px 24px' }}>
            {[['Features', '#features'], ['How it works', '#how-it-works'], ['Guide', '#guide'], ['FAQ', '#faq'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '13px 0', borderBottom: '1px solid #F4F3F0' }}>
                {l}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#6B6860', textDecoration: 'none', padding: '11px', border: '1px solid #ECEAE5', borderRadius: 10 }}>
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, background: '#1C1B18', color: '#fff', padding: '12px', borderRadius: 10, textDecoration: 'none' }}>
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 0, background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>

          {/* Text block */}
          <div style={{ maxWidth: 660, paddingTop: 48, paddingBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FDF8EC', border: '1px solid #EDD98A', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4992A', flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#B8880E', letterSpacing: '0.01em' }}>Built for Nigerian landlords</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#1C1B18', marginBottom: 22 }}>
              Stop tracking rent<br />in notebooks
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: '#6B6860', lineHeight: 1.8, maxWidth: 500, marginBottom: 36 }}>
              TenantFlow is the simplest way for Nigerian landlords to manage tenants, log payments, and know exactly who is paid up — from any device.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 44 }}>
              <Link href="/signup"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 700, background: '#1C1B18', color: '#fff', padding: '13px 26px', borderRadius: 12, textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Create free account <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14.5, fontWeight: 500, color: '#6B6860', padding: '13px 22px', borderRadius: 12, textDecoration: 'none', border: '1.5px solid #DEDAD3', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1B18'; (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DEDAD3'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
                Sign in
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Free to start', 'No credit card', 'Works on mobile'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#A8A59E', fontWeight: 500 }}>
                  <Check size={12} color="#C4992A" strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Image grid — right side hero image */}
          <div style={{ width: '100%', height: 420, display: 'grid', gridTemplateColumns: '1fr 0.55fr', gridTemplateRows: '1fr 1fr', gap: 8 }} className="tf-hero-grid">
            <div style={{ gridRow: '1 / 3', borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
              <img src={HERO_IMGS[0]} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ borderRadius: '0 16px 0 0', overflow: 'hidden' }}>
              <img src={HERO_IMGS[1]} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <img src={HERO_IMGS[2]} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ maxWidth: 520, marginBottom: 56 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 10 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1B18', lineHeight: 1.15 }}>Everything you need, nothing you don't</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title}
                style={{ borderRadius: 16, border: '1px solid #ECEAE5', padding: '26px 22px', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D4C99A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F6F1E3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} color="#C4992A" strokeWidth={1.8} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1B18', marginBottom: 7 }}>{title}</p>
                <p style={{ fontSize: 13.5, color: '#7A7670', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 28px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 10 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1B18' }}>Up and running in minutes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 88 }}>
            {STEPS.map(({ num, title, body, img }, i) => (
              <div key={num} className="tf-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                <div className={i % 2 === 0 ? 'tf-step-text' : 'tf-step-img'} style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  {i % 2 === 0 ? (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#C4992A', textTransform: 'uppercase' }}>Step {num}</span>
                      <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.025em', margin: '10px 0 16px', lineHeight: 1.2 }}>{title}</h3>
                      <p style={{ fontSize: 15, color: '#7A7670', lineHeight: 1.85 }}>{body}</p>
                    </>
                  ) : (
                    <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                </div>
                <div className={i % 2 === 0 ? 'tf-step-img' : 'tf-step-text'} style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  {i % 2 === 0 ? (
                    <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#C4992A', textTransform: 'uppercase' }}>Step {num}</span>
                      <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.025em', margin: '10px 0 16px', lineHeight: 1.2 }}>{title}</h3>
                      <p style={{ fontSize: 15, color: '#7A7670', lineHeight: 1.85 }}>{body}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide ───────────────────────────────────────────────────────── */}
      <section id="guide" style={{ padding: '96px 28px', background: '#1C1B18' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ maxWidth: 560, margin: '0 auto 60px', textAlign: 'center' }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 10 }}>App guide</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15 }}>Every section, explained</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginTop: 12, lineHeight: 1.7 }}>A quick reference for what you'll find inside TenantFlow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
            {GUIDE.map(({ Icon, title, desc }) => (
              <div key={title}
                style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(196,153,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={17} color="#C4992A" strokeWidth={1.8} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 7 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '96px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 10 }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1B18' }}>Questions we get a lot</h2>
          </div>
          <div style={{ borderTop: '1px solid #ECEAE5' }}>
            {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 28px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 10 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1B18', marginBottom: 8 }}>Start free, upgrade when you're ready</h2>
            <p style={{ fontSize: 15, color: '#7A7670' }}>No hidden fees. No pressure.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {/* Free */}
            <div style={{ background: '#fff', border: '1.5px solid #ECEAE5', borderRadius: 20, padding: '32px 28px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#A8A59E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Free plan</p>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.04em' }}>₦0</span>
                <span style={{ fontSize: 14, color: '#A8A59E', marginLeft: 6 }}>/month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
                {['Up to 3 properties', 'Up to 10 tenants', 'Payment tracking', 'Mobile access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#F6F1E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="#C4992A" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: '#6B6860' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12, border: '1.5px solid #ECEAE5', color: '#6B6860', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1B18'; (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: '#1C1B18', borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', borderRadius: 99, padding: '4px 11px', fontSize: 10.5, fontWeight: 800, color: '#1C1B18', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Popular</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#C4992A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Pro plan</p>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦5,000</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginLeft: 6 }}>/month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
                {['Unlimited properties', 'Unlimited tenants', 'Payment tracking', 'Renewal reminders', 'Reports & ROI', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(196,153,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="#C4992A" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#1C1B18', textDecoration: 'none', fontSize: 14, fontWeight: 700, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Image src="/logo.png" alt="TenantFlow" width={120} height={120} style={{ objectFit: 'contain', margin: '0 auto', display: 'block' }} />
          <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1B18', margin: '24px 0 14px', lineHeight: 1.15 }}>
            Your properties deserve better than a notebook
          </h2>
          <p style={{ fontSize: 15, color: '#7A7670', marginBottom: 36, lineHeight: 1.8 }}>
            Join landlords across Nigeria using TenantFlow to manage tenants professionally.
          </p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, background: '#1C1B18', color: '#fff', padding: '14px 30px', borderRadius: 13, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Create free account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#111110', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '52px 28px 40px' }}>

          {/* Top row */}
          <div className="tf-footer-top" style={{ display: 'flex', justifyContent: 'space-between', gap: 40, marginBottom: 48, flexWrap: 'wrap' }}>
            {/* Brand */}
            <div style={{ maxWidth: 260 }}>
              <Link href="/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: 14 }}>
                <Image src="/logo.png" alt="TenantFlow" width={200} height={200} style={{ objectFit: 'contain', height: 64, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </Link>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginTop: 8 }}>
                Property management for Nigerian landlords. Simple, professional, built for the way Nigerians actually rent.
              </p>
            </div>

            {/* Links */}
            <div className="tf-footer-links" style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Product</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[['Features', '#features'], ['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
                    <a key={l} href={h} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Account</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[['Sign in', '/login'], ['Create account', '/signup']].map(([l, h]) => (
                    <Link key={l} href={h} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.22)' }}>© 2026 TenantFlow. Built for Nigeria.</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.18)' }}>Made with care for Nigerian landlords.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .tf-nav-links { display: none !important; }
          .tf-hamburger { display: flex !important; }
          .tf-hero-grid { display: none !important; }
          .tf-step { grid-template-columns: 1fr !important; gap: 24px !important; }
          .tf-step-text { order: 0 !important; }
          .tf-step-img { order: 1 !important; }
          .tf-footer-links { display: none !important; }
        }
        @media (min-width: 701px) and (max-width: 900px) {
          .tf-hero-grid { height: 300px !important; }
        }
      `}</style>
    </div>
  );
}
