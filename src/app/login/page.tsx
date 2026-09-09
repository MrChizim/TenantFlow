'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <Image src="/logo.png" alt="TenantFlow" width={200} height={120} style={{ objectFit: 'contain', height: 100, width: 'auto' }} />
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Enter the family password to continue.</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="eyebrow">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              className="field"
              style={{ paddingRight: 44 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
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

        <button type="submit" disabled={loading} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}>
          {loading
            ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : 'Sign in'
          }
        </button>
      </form>

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
          <span className="tag" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>Family portfolio</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.01em' }}>
            Your properties.<br />Perfectly managed.
          </h2>
        </div>
      </div>
    </div>
  );
}
