'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Building2, Users, Bell, TrendingUp, ChevronRight, CheckCircle2, Menu, X, BarChart3, Smartphone, ChevronDown, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: Building2, title: 'Property portfolio', body: 'Add all your properties with photos, addresses, and unit counts. See your entire portfolio in one clean view.' },
  { icon: Users, title: 'Tenant management', body: 'Store tenant contact details, track payments, and know exactly who is paid up and who owes.' },
  { icon: Bell, title: 'Renewal alerts', body: 'Get notified when tenants are approaching the end of their paid period. Never be caught off guard.' },
  { icon: TrendingUp, title: 'Payment tracking', body: 'Record every payment — full or partial, cash or transfer — with date and duration covered.' },
  { icon: BarChart3, title: 'Reports & ROI', body: 'See income, expenses, occupancy rate, and return on investment across your properties.' },
  { icon: Smartphone, title: 'Mobile friendly', body: 'Manage everything from your phone. Works on any screen, anywhere in Nigeria.' },
];

const STEPS = [
  {
    num: '01',
    title: 'Add your properties',
    body: 'Start by adding each property — upload a photo, enter the address, state, city, number of units, and optionally the purchase price for ROI tracking.',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  },
  {
    num: '02',
    title: 'Add your tenants',
    body: 'For each tenant, enter their name, phone number, WhatsApp, which unit they occupy, and their annual rent. No lease dates required — just the basics.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
  },
  {
    num: '03',
    title: 'Record payments',
    body: 'When a tenant pays, hit "Record payment". Enter the amount, how many months it covers (1 year, 6 months, custom), and the payment method. TenantFlow calculates the expiry automatically.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    num: '04',
    title: 'Track from your dashboard',
    body: 'Your dashboard shows all active tenants, who is expiring soon, total income, and any outstanding payments — all in one place.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
];

const FAQS = [
  { q: 'Is it free to use?', a: 'Yes — TenantFlow is free for up to 3 properties and 10 tenants. Upgrade to Pro for unlimited access.' },
  { q: 'Do I need a lease agreement to use this?', a: 'No. TenantFlow is built for the Nigerian rental market where formal leases are rare. You just record when the tenant paid and how long it covers.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. TenantFlow is fully mobile-responsive. No app download needed — just open the website on your phone.' },
  { q: 'What if a tenant pays in installments?', a: 'You can record partial payments and add a note explaining the balance. Every payment is logged in the tenant\'s history.' },
  { q: 'Can I manage multiple properties?', a: 'Yes. You can add as many properties as you like, each with their own tenants, units, and payment records.' },
  { q: 'Is my data safe?', a: 'Yes. TenantFlow is built on Supabase with row-level security — your data is private and only accessible to you.' },
  { q: 'Can I track short-let / Airbnb properties?', a: 'Yes. Short Let / Airbnb is one of the property types. You can track payments and occupancy the same way.' },
  { q: 'How do I track expenses?', a: 'Use the Expenses section to log maintenance, repairs, agent fees, and other costs per property. These feed into your ROI report.' },
];

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', alt: 'Modern Nigerian apartment complex' },
  { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', alt: 'Property exterior' },
  { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', alt: 'Residential building' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Property management' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #ECEAE5' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 15.5, fontWeight: 500, color: '#1C1B18', lineHeight: 1.4 }}>{q}</span>
        <ChevronDown size={18} color="#A8A59E" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <p style={{ fontSize: 14.5, color: '#6B6860', lineHeight: 1.75, paddingBottom: 20 }}>{a}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#fff', color: '#1C1B18', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #ECEAE5' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo.png" alt="TenantFlow" width={36} height={36} style={{ borderRadius: 10 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1B18', letterSpacing: '-0.02em' }}>TenantFlow</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-home">
            {[['Features', '#features'], ['How it works', '#how-it-works'], ['Guide', '#guide'], ['FAQ', '#faq'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 14, color: '#6B6860', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#6B6860'; }}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" className="nav-links-home" style={{ fontSize: 14, color: '#6B6860', textDecoration: 'none', padding: '8px 14px', fontWeight: 500 }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 600, background: '#1C1B18', color: '#fff', padding: '9px 20px', borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Get started free
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', color: '#1C1B18', cursor: 'pointer', padding: 4 }} className="nav-hamburger-home">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #ECEAE5', padding: '16px 24px 24px' }}>
            {[['Features', '#features'], ['How it works', '#how-it-works'], ['Guide', '#guide'], ['FAQ', '#faq'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', fontSize: 15, color: '#6B6860', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #F2F1EE' }}>
                {l}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', fontSize: 14, color: '#6B6860', textDecoration: 'none', padding: '10px', border: '1px solid #ECEAE5', borderRadius: 10 }}>Sign in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, background: '#1C1B18', color: '#fff', padding: '11px', borderRadius: 10, textDecoration: 'none' }}>Get started free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, textAlign: 'center', background: 'linear-gradient(180deg, #FAFAF8 0%, #fff 100%)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FDF8EC', border: '1px solid #F0E0A0', borderRadius: 99, padding: '6px 16px', marginBottom: 32 }}>
            <Image src="/logo.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
            <span style={{ fontSize: 13, color: '#C4992A', fontWeight: 600 }}>Built for Nigerian landlords</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.035em', color: '#1C1B18', marginBottom: 24 }}>
            Stop managing properties<br />with notebooks and WhatsApp
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#6B6860', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 40px' }}>
            TenantFlow gives Nigerian landlords a simple, professional way to track tenants, log payments, and know exactly who is paid up — from any device.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, background: '#1C1B18', color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Create free account <ChevronRight size={16} />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, color: '#6B6860', padding: '14px 24px', borderRadius: 12, textDecoration: 'none', border: '1.5px solid #ECEAE5', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C4992A'; (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
              Sign in
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['Free to start', 'No credit card', 'Works on mobile'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#A8A59E' }}>
                <CheckCircle2 size={13} color="#C4992A" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ padding: '0 0 80px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, padding: '0 24px', maxWidth: 1200, margin: '0 auto', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {IMAGES.map(({ src, alt }) => (
            <div key={src} style={{ flexShrink: 0, width: 320, height: 220, borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
              <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#1C1B18' }}>Everything you need to manage your properties</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #ECEAE5', borderRadius: 18, padding: '28px 24px', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FDF8EC', border: '1px solid #F0E0A0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={19} color="#C4992A" />
                </div>
                <p style={{ fontSize: 15.5, fontWeight: 700, color: '#1C1B18', marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 14, color: '#6B6860', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#1C1B18' }}>Up and running in minutes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {STEPS.map(({ num, title, body, img }, i) => (
              <div key={num} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="how-step">
                <div style={{ order: i % 2 === 0 ? 0 : 1 }} className="how-text">
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#C4992A' }}>STEP {num}</span>
                  <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.02em', margin: '10px 0 16px', lineHeight: 1.2 }}>{title}</h3>
                  <p style={{ fontSize: 15, color: '#6B6860', lineHeight: 1.8 }}>{body}</p>
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0, borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }} className="how-img">
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(196,153,42,0.08) 0%, transparent 60%)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide / Quick reference */}
      <section id="guide" style={{ padding: '80px 24px', background: '#1C1B18' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>Quick guide</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>Everything in one place</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>A quick reference for every section of the app</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {[
              { icon: '🏘️', title: 'Dashboard', desc: 'Overview of all properties, active tenants, upcoming renewals, and total income at a glance.' },
              { icon: '🏠', title: 'Properties', desc: 'Add, edit, and view all your properties. Upload photos and track each property\'s investment cost.' },
              { icon: '👤', title: 'Tenants', desc: 'All your tenants in one list. See who is active, expiring, or overdue. Click any tenant for full details.' },
              { icon: '💰', title: 'Record Payment', desc: 'Log when a tenant pays. Choose the duration it covers and the app calculates their expiry date.' },
              { icon: '🔔', title: 'Renewals', desc: 'Tenants sorted by how soon they expire — overdue, next 90 days, 3–6 months, and beyond.' },
              { icon: '📊', title: 'Reports', desc: 'Monthly income chart, top properties by revenue, and occupancy rate across your portfolio.' },
              { icon: '📉', title: 'Expenses', desc: 'Log maintenance, repairs, and agent fees per property. These reduce your ROI calculation.' },
              { icon: '📈', title: 'ROI Calculator', desc: 'Enter purchase price and costs to see your annual yield, total return, and payback period.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 12 }}>{icon}</span>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#1C1B18' }}>Common questions</h2>
          </div>
          <div>
            {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4992A', marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#1C1B18', marginBottom: 12 }}>Start free, upgrade when ready</h2>
          <p style={{ fontSize: 15, color: '#6B6860', marginBottom: 52 }}>No hidden fees. No pressure.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, textAlign: 'left' }}>
            {/* Free */}
            <div style={{ background: '#fff', border: '1.5px solid #ECEAE5', borderRadius: 20, padding: '32px 28px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#A8A59E', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Free</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: '#1C1B18', letterSpacing: '-0.04em' }}>₦0</span>
                <span style={{ fontSize: 14, color: '#A8A59E', marginLeft: 6 }}>/month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Up to 3 properties', 'Up to 10 tenants', 'Payment tracking', 'Mobile access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} color="#C4992A" />
                    <span style={{ fontSize: 14, color: '#6B6860' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, border: '1.5px solid #ECEAE5', color: '#6B6860', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1B18'; (e.currentTarget as HTMLElement).style.color = '#1C1B18'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEAE5'; (e.currentTarget as HTMLElement).style.color = '#6B6860'; }}>
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: '#1C1B18', border: '1.5px solid #1C1B18', borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#1C1B18', letterSpacing: '0.04em' }}>POPULAR</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#C4992A', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Pro</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦5,000</span>
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
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #C4992A, #E8C94A)', color: '#1C1B18', textDecoration: 'none', fontSize: 14, fontWeight: 700, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Image src="/logo.png" alt="TenantFlow" width={72} height={72} style={{ borderRadius: 20, margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#1C1B18', marginBottom: 16, lineHeight: 1.2 }}>
            Your properties deserve better than a notebook
          </h2>
          <p style={{ fontSize: 15, color: '#6B6860', marginBottom: 36, lineHeight: 1.75 }}>
            Join landlords across Nigeria using TenantFlow to manage tenants professionally — whether you have 2 units or 200.
          </p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, background: '#1C1B18', color: '#fff', padding: '15px 32px', borderRadius: 14, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #ECEAE5', padding: '36px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <Image src="/logo.png" alt="TenantFlow" width={28} height={28} style={{ borderRadius: 7 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1C1B18' }}>TenantFlow</span>
          </Link>
          <p style={{ fontSize: 13, color: '#A8A59E' }}>© 2026 TenantFlow. Built for Nigeria.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/login" style={{ fontSize: 13, color: '#A8A59E', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: 13, color: '#A8A59E', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .nav-links-home { display: none !important; }
          .nav-hamburger-home { display: flex !important; }
          .how-step { grid-template-columns: 1fr !important; gap: 28px !important; }
          .how-text { order: 0 !important; }
          .how-img { order: 1 !important; }
        }
      `}</style>
    </div>
  );
}
