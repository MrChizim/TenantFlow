'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <Image src="/logo-icon.png" alt="TenantFlow" width={44} height={44} style={{ objectFit: 'contain', width: 44, height: 44 }} />
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
          Sign in to<br />TenantFlow
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Manage your properties with clarity.</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '11px 0', borderRadius: 10, border: '1px solid var(--line)',
          background: '#fff', fontSize: 14, fontWeight: 500, color: 'var(--text-1)',
          cursor: 'pointer', marginBottom: 16, transition: 'background 0.12s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
      >
        {googleLoading
          ? <span style={{ width: 16, height: 16, border: '2px solid var(--line)', borderTopColor: 'var(--text-1)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          : <GoogleIcon />
        }
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="eyebrow">Email</label>
          <input type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="eyebrow">Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>Forgot?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              className="field"
              style={{ paddingRight: 44 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-tint)', border: '1px solid var(--red-line)', borderRadius: 10, padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || googleLoading} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}>
          {loading
            ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : 'Sign in'
          }
        </button>
      </form>

      <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 20, textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
      </p>

      <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 10, textAlign: 'center' }}>
        <Link href="/home" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>← Back to homepage</Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--page)' }}>
      <div className="flex flex-1 items-center justify-center p-10">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <div className="hidden lg:flex flex-col justify-between w-5/12 relative overflow-hidden" style={{ padding: '52px' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1400&q=85)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '24px', margin: '16px' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)', borderRadius: '24px', margin: '16px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="tag" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>Built for Nigerian landlords</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.01em' }}>
            Your properties.<br />Perfectly managed.
          </h2>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['3', 'Properties'], ['10+', 'Tenants'], ['₦21.5M', 'Portfolio']].map(([v, l]) => (
              <div key={l}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', color: '#fff', lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
