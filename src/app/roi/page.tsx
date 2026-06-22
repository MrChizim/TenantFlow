'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Calculator, Building2, ChevronDown, ChevronUp, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useStore } from '@/lib/store';
import { formatNaira } from '@/lib/utils';

function NumField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="eyebrow">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text-3)', pointerEvents: 'none' }}>₦</span>
        <input
          type="number"
          className="field"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: 26 }}
        />
      </div>
    </div>
  );
}

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Year {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: Number(p.value) >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {p.name}: {formatNaira(Math.abs(p.value))} {Number(p.value) >= 0 ? 'profit' : 'outstanding'}
        </p>
      ))}
    </div>
  );
}

export default function ROIPage() {
  const properties = useStore(s => s.properties);
  const tenants = useStore(s => s.tenants);
  const expenses = useStore(s => s.expenses);

  const [mode, setMode] = useState<'existing' | 'custom'>('existing');
  const [selectedProp, setSelectedProp] = useState<string>(properties[0]?.id ?? '');
  const [showDetails, setShowDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    land_cost: '',
    build_cost: '',
    annual_rent: '',
    annual_expenses: '',
    vacancy_rate: '10',
    rent_growth: '5',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const existingProp = useMemo(() => properties.find(p => p.id === selectedProp), [properties, selectedProp]);

  const derived = useMemo(() => {
    if (mode === 'existing' && existingProp) {
      const propTenants = tenants.filter(t => t.property_id === existingProp.id);
      const propExpenses = expenses.filter(e => e.property_id === existingProp.id);
      const activeTenants = propTenants.filter(t => t.status === 'active');
      const currentAnnualRent = activeTenants.reduce((s, t) => s + t.rent_amount, 0);
      const totalRentEver = propTenants.reduce((sum, t) => {
        const historyTotal = (t.rent_history ?? []).reduce((s, h) => s + h.amount, 0);
        return sum + t.rent_amount + historyTotal;
      }, 0);
      return {
        totalInvestment: (existingProp.purchase_price ?? 0) + (existingProp.build_cost ?? 0),
        annualRent: currentAnnualRent,
        totalRentEver,
        annualExpenses: propExpenses.reduce((s, e) => s + e.amount, 0),
        vacancyRate: Math.round((1 - activeTenants.length / Math.max(existingProp.total_units, 1)) * 100),
        rentGrowth: 5,
        propTenants,
        activeTenantCount: activeTenants.length,
      };
    }
    return {
      totalInvestment: (Number(form.land_cost) || 0) + (Number(form.build_cost) || 0),
      annualRent: Number(form.annual_rent) || 0,
      totalRentEver: 0,
      annualExpenses: Number(form.annual_expenses) || 0,
      vacancyRate: Number(form.vacancy_rate) || 0,
      rentGrowth: Number(form.rent_growth) || 5,
      propTenants: [],
      activeTenantCount: 0,
    };
  }, [mode, existingProp, tenants, expenses, form]);

  const calc = useMemo(() => {
    const { totalInvestment, annualRent, annualExpenses, vacancyRate, rentGrowth } = derived;
    const effectiveRent = annualRent * (1 - vacancyRate / 100);
    const netAnnual = effectiveRent - annualExpenses;
    const grossYield = totalInvestment > 0 ? (annualRent / totalInvestment) * 100 : 0;
    const netYield = totalInvestment > 0 ? (netAnnual / totalInvestment) * 100 : 0;
    const breakEvenYears = netAnnual > 0 ? totalInvestment / netAnnual : null;
    const growthRate = rentGrowth / 100;
    let cumulative = 0;
    const chartData = Array.from({ length: 20 }, (_, i) => {
      const yearRent = effectiveRent * Math.pow(1 + growthRate, i);
      cumulative += yearRent - annualExpenses;
      return { year: i + 1, cumulative: cumulative - totalInvestment };
    });
    return { effectiveRent, netAnnual, grossYield, netYield, breakEvenYears, chartData, totalInvestment, annualRent, annualExpenses };
  }, [derived]);

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 5 }}>
          ROI Calculator
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>See how long it takes to recover your investment through rent</p>
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '3px', borderRadius: 11, background: '#fff', border: '1px solid var(--line)', width: 'fit-content', marginBottom: 18 }}>
        {[{ value: 'existing', label: 'From my properties' }, { value: 'custom', label: 'Custom scenario' }].map(opt => (
          <button key={opt.value} onClick={() => setMode(opt.value as 'existing' | 'custom')} style={{
            padding: '7px 15px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: mode === opt.value ? 'var(--text-1)' : 'transparent',
            color: mode === opt.value ? '#fff' : 'var(--text-3)',
            transition: 'all 0.12s',
          }}>{opt.label}</button>
        ))}
      </div>

      <div className="roi-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>

        {/* Left — Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'existing' ? (
            <div className="surface" style={{ padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', marginBottom: 14 }}>Select property</p>
              {properties.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Add a property first to see ROI calculations here.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {properties.map(p => {
                    const pt = tenants.filter(t => t.property_id === p.id);
                    const totalCost = (p.purchase_price ?? 0) + (p.build_cost ?? 0);
                    const isActive = selectedProp === p.id;
                    return (
                      <button key={p.id} onClick={() => setSelectedProp(p.id)} style={{
                        textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                        border: isActive ? '2px solid var(--gold)' : '1px solid var(--line)',
                        background: isActive ? 'var(--gold-tint)' : 'var(--surface-2)', transition: 'all 0.12s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                          <Building2 size={12} color={isActive ? 'var(--gold)' : 'var(--text-3)'} />
                          <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--gold)' : 'var(--text-1)' }}>{p.name}</p>
                        </div>
                        <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                          {p.city} · {pt.length} tenant{pt.length !== 1 ? 's' : ''}
                          {totalCost > 0 ? ` · ${formatNaira(totalCost)}` : ' · no cost data'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
              {existingProp && (
                <div style={{ marginTop: 14 }}>
                  <button onClick={() => setShowDetails(!showDetails)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-3)', padding: 0 }}>
                    {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {showDetails ? 'Hide' : 'Show'} breakdown
                  </button>
                  {showDetails && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[
                        ['Purchase cost', formatNaira(existingProp.purchase_price ?? 0)],
                        ['Build cost', formatNaira(existingProp.build_cost ?? 0)],
                        ['Active units', `${derived.activeTenantCount} / ${existingProp.total_units}`],
                        ['Current annual rent', formatNaira(derived.annualRent)],
                        ['Total expenses logged', formatNaira(derived.annualExpenses)],
                        ['Total rent ever recorded', formatNaira(derived.totalRentEver)],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-3)', gap: 8 }}>
                          <span>{l}</span><span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="surface" style={{ padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Investment details</p>
              <NumField label="Land / purchase cost" value={form.land_cost} onChange={v => set('land_cost', v)} placeholder="45000000" />
              <NumField label="Build / renovation cost" value={form.build_cost} onChange={v => set('build_cost', v)} placeholder="30000000" />
              <NumField label="Annual rent collected" value={form.annual_rent} onChange={v => set('annual_rent', v)} placeholder="4800000" />
              <NumField label="Annual expenses" value={form.annual_expenses} onChange={v => set('annual_expenses', v)} placeholder="500000" />
              {[
                { key: 'vacancy_rate', label: 'Vacancy rate', value: form.vacancy_rate, min: 0, max: 50, leftLabel: '0% full', rightLabel: '50% empty' },
                { key: 'rent_growth', label: 'Annual rent growth', value: form.rent_growth, min: 0, max: 30, leftLabel: '0% flat', rightLabel: '30% fast' },
              ].map(slider => (
                <div key={slider.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="eyebrow">{slider.label}</label>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{slider.value}%</span>
                  </div>
                  <input type="range" min={slider.min} max={slider.max} value={slider.value} onChange={e => set(slider.key, e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
                    <span>{slider.leftLabel}</span><span>{slider.rightLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Metric cards */}
          <div className="roi-metric-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Breakeven point', value: calc.breakEvenYears ? `${calc.breakEvenYears.toFixed(1)} yrs` : 'N/A', sub: calc.breakEvenYears ? `Recover by ${new Date().getFullYear() + Math.ceil(calc.breakEvenYears)}` : 'Net income must be positive', accent: true },
              { label: 'Net annual income', value: formatNaira(calc.netAnnual), sub: calc.netAnnual >= 0 ? 'After expenses & vacancy' : 'Expenses exceed income', color: calc.netAnnual >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Gross yield', value: `${calc.grossYield.toFixed(2)}%`, sub: 'Annual rent ÷ total investment', color: 'var(--text-1)' },
              { label: 'Net yield', value: `${calc.netYield.toFixed(2)}%`, sub: 'Net income ÷ total investment', color: calc.netYield >= 8 ? 'var(--green)' : calc.netYield >= 4 ? 'var(--amber)' : 'var(--red)' },
            ].map(card => (
              <div key={card.label} style={{
                background: card.accent ? 'var(--text-1)' : '#fff',
                border: `1px solid ${card.accent ? 'transparent' : 'var(--line)'}`,
                borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <p style={{ fontSize: 11, color: card.accent ? 'rgba(255,255,255,0.5)' : 'var(--text-3)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{card.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.3rem', color: card.accent ? '#E8C94A' : (card.color ?? 'var(--text-1)'), lineHeight: 1.1, marginBottom: 5 }}>{card.value}</p>
                <p style={{ fontSize: 11.5, color: card.accent ? 'rgba(255,255,255,0.45)' : 'var(--text-3)' }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Rent history accordion */}
          {mode === 'existing' && existingProp && derived.propTenants.some(t => (t.rent_history ?? []).length > 0) && (
            <div className="surface" style={{ padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', width: '100%', padding: 0 }}>
                <History size={14} color="var(--gold)" />
                Rent increase history
                <span style={{ marginLeft: 'auto' }}>{showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
              </button>
              {showHistory && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {derived.propTenants.flatMap(t =>
                    (t.rent_history ?? []).map((h, i) => (
                      <div key={`${t.id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{t.first_name} {t.last_name}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{h.note ?? h.date}</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', whiteSpace: 'nowrap' }}>{formatNaira(h.amount)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          {calc.totalInvestment > 0 && calc.netAnnual !== 0 && (
            <div className="surface" style={{ padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Cumulative return · 20 years</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Includes rent growth projection</p>
                </div>
                <TrendingUp size={15} color="var(--gold)" />
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={calc.chartData}>
                  <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine y={0} stroke="var(--line-2)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="cumulative" name="Profit / Loss" stroke="var(--gold)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: 'var(--gold)', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary */}
          <div className="surface" style={{ padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', marginBottom: 12 }}>Summary</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {([
                ['Total investment', formatNaira(calc.totalInvestment), 'var(--text-1)'],
                ['Annual gross rent', formatNaira(calc.annualRent), 'var(--text-1)'],
                ['Vacancy deduction', `−${formatNaira(calc.annualRent - calc.effectiveRent)}`, 'var(--amber)'],
                ['Annual expenses', `−${formatNaira(calc.annualExpenses)}`, 'var(--red)'],
                ['Net annual income', formatNaira(calc.netAnnual), calc.netAnnual >= 0 ? 'var(--green)' : 'var(--red)'],
              ] as [string, string, string][]).map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{l}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
              {[['5-year return', calc.netAnnual * 5], ['10-year return', calc.netAnnual * 10]].map(([l, v]) => (
                <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{l}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{formatNaira(Number(v))}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {calc.totalInvestment === 0 && mode === 'custom' && (
        <div style={{ marginTop: 20, textAlign: 'center', padding: '32px', color: 'var(--text-3)', fontSize: 14 }}>
          <Calculator size={32} color="var(--line-2)" style={{ margin: '0 auto 12px' }} />
          <p>Enter your investment and rent figures above to see your ROI projection.</p>
        </div>
      )}
    </div>
  );
}
