'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Wrench, Hammer, UserCheck, Scale, Zap, Shield, MoreHorizontal } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';

type Category = Expense['category'] | 'all';

const categoryMeta: Record<Expense['category'], { label: string; icon: React.FC<{ size: number; color: string }>; color: string; bg: string; border: string }> = {
  maintenance: { label: 'Maintenance', icon: Wrench,         color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  repair:      { label: 'Repair',      icon: Hammer,         color: '#B45309', bg: '#FFFBF0', border: '#FCD88A' },
  agent_fee:   { label: 'Agent fee',   icon: UserCheck,      color: '#1A7F4B', bg: '#F0FAF5', border: '#C3E9D5' },
  legal:       { label: 'Legal',       icon: Scale,          color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  utilities:   { label: 'Utilities',   icon: Zap,            color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  insurance:   { label: 'Insurance',   icon: Shield,         color: '#C4992A', bg: '#FDF8EC', border: '#F0E0A0' },
  other:       { label: 'Other',       icon: MoreHorizontal, color: '#6B6860', bg: '#F2F1EE', border: '#DDDAD4' },
};

function AddExpenseModal({ onClose, propertyId }: { onClose: () => void; propertyId?: string }) {
  const properties = useStore(s => s.properties);
  const addExpense = useStore(s => s.addExpense);
  const addNotification = useStore(s => s.addNotification);
  const [form, setForm] = useState({
    property_id: propertyId ?? '',
    category: 'maintenance' as Expense['category'],
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await addExpense(supabase, user.id, {
        property_id: form.property_id,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
      });
      addNotification({ title: 'Expense logged', body: `${form.description} — ${formatNaira(Number(form.amount))}` });
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,27,24,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-1)', marginBottom: 22 }}>Log expense</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Property *</label>
            <select className="field" value={form.property_id} onChange={e => set('property_id', e.target.value)} required>
              <option value="">Select property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Category *</label>
            <select className="field" value={form.category} onChange={e => set('category', e.target.value)} required>
              {Object.entries(categoryMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Description *</label>
            <input className="field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Generator servicing" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">Amount (₦) *</label>
              <input type="number" className="field" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="120000" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="eyebrow">Date *</label>
              <input type="date" className="field" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-tint)', border: '1px solid var(--red-line)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="submit" disabled={saving} className="btn btn-dark">
              {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : 'Save expense'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExpensesPage() {
  const properties = useStore(s => s.properties);
  const expenses = useStore(s => s.expenses);
  const deleteExpenseStore = useStore(s => s.deleteExpense);
  const [filter, setFilter] = useState<Category>('all');
  const [propFilter, setPropFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  async function handleDelete(id: string) {
    const supabase = createClient();
    await deleteExpenseStore(supabase, id);
  }

  const filtered = useMemo(() =>
    expenses.filter(e => (filter === 'all' || e.category === filter) && (propFilter === 'all' || e.property_id === propFilter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses, filter, propFilter]
  );

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const byCategory = useMemo(() =>
    Object.entries(categoryMeta).map(([key, meta]) => ({
      key: key as Expense['category'], ...meta,
      total: expenses.filter(e => e.category === key as Expense['category'] && (propFilter === 'all' || e.property_id === propFilter)).reduce((s, e) => s + e.amount, 0),
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total),
    [expenses, propFilter]
  );

  const grandTotal = useMemo(() => expenses.filter(e => propFilter === 'all' || e.property_id === propFilter).reduce((s, e) => s + e.amount, 0), [expenses, propFilter]);

  return (
    <div style={{ maxWidth: 1040 }}>
      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} />}

      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>Expenses</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Track maintenance, repairs, and running costs per property</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-dark page-header-btn" style={{ gap: 7 }}><Plus size={15} /> Log expense</button>
      </div>

      {propFilter !== 'all' && (() => {
        const prop = properties.find(p => p.id === propFilter);
        const totalInvested = (prop?.purchase_price ?? 0) + (prop?.build_cost ?? 0);
        if (!prop || totalInvested === 0) return null;
        return (
          <div style={{ background: 'var(--text-1)', borderRadius: 16, padding: '18px 22px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Total investment — {prop.name}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', color: '#E8C94A', lineHeight: 1 }}>{formatNaira(totalInvested)}</p>
            </div>
            {[prop.purchase_price && { label: 'Land / purchase', value: prop.purchase_price }, prop.build_cost && { label: 'Build / renovation', value: prop.build_cost }].filter(Boolean).map(row => {
              const r = row as { label: string; value: number };
              return <div key={r.label}><p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{r.label}</p><p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatNaira(r.value)}</p></div>;
            })}
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {byCategory.slice(0, 4).map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} onClick={() => setFilter(filter === c.key ? 'all' : c.key)} style={{ background: filter === c.key ? c.bg : '#fff', border: `1px solid ${filter === c.key ? c.border : 'var(--line)'}`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.12s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={c.color} /></div>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.label}</span>
              </div>
              <p style={{ fontSize: '1.2rem', fontFamily: 'Inter, sans-serif', color: c.color, fontWeight: 400 }}>{formatNaira(c.total)}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <select className="field" value={propFilter} onChange={e => setPropFilter(e.target.value)} style={{ width: 'auto', padding: '7px 14px', fontSize: 13 }}>
          <option value="all">All properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 2, padding: '3px', borderRadius: 11, background: '#fff', border: '1px solid var(--line)', width: 'fit-content' }}>
          {(['all', ...Object.keys(categoryMeta)] as Category[]).map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '6px 13px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: filter === cat ? 'var(--text-1)' : 'transparent', color: filter === cat ? '#fff' : 'var(--text-3)', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
              {cat === 'all' ? 'All' : categoryMeta[cat as Expense['category']].label}
            </button>
          ))}
        </div>
      </div>

      <div className="surface" style={{ overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</p>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>
            Total: <span style={{ color: 'var(--red)' }}>{formatNaira(total)}</span>
            {propFilter === 'all' && total !== grandTotal && <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>of {formatNaira(grandTotal)} all properties</span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No expenses recorded yet.</p>
            <button onClick={() => setShowModal(true)} className="btn btn-dark" style={{ marginTop: 16 }}><Plus size={14} /> Log first expense</button>
          </div>
        ) : (
          filtered.map((exp, i) => {
            const meta = categoryMeta[exp.category];
            const prop = properties.find(p => p.id === exp.property_id);
            const Icon = meta.icon;
            return (
              <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 24px', borderTop: i > 0 ? '1px solid var(--line)' : undefined }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} color={meta.color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{prop?.name ?? '—'} · <span style={{ color: meta.color }}>{meta.label}</span></p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>{formatNaira(exp.amount)}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{formatDate(exp.date)}</p>
                </div>
                <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-3)', transition: 'color 0.12s, background 0.12s', flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-tint)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                ><Trash2 size={14} /></button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
