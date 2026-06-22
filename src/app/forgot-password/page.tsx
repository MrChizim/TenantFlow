'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page)', padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>T</span>
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>Reset your password</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>We&apos;ll send you a link to reset it.</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-tint)', border: '1px solid var(--green-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.4rem' }}>✓</div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Check <strong>{email}</strong> for a reset link. It expires in 1 hour.
            </p>
            <Link href="/login" style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">Email address</label>
              <input type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-tint)', border: '1px solid var(--red-line)', borderRadius: 10, padding: '10px 14px' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
              {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Send reset link'}
            </button>

            <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
              <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
