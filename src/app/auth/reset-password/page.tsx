'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page)', padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>T</span>
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>Set new password</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">New password</label>
            <div style={{ position: 'relative' }}>
              <input type={show ? 'text' : 'password'} className="field" style={{ paddingRight: 44 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required autoFocus />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Confirm new password</label>
            <input type={show ? 'text' : 'password'} className="field" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-tint)', border: '1px solid var(--red-line)', borderRadius: 10, padding: '10px 14px' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
            {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Update password'}
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>Back to sign in</Link>
          </p>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
