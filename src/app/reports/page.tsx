'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, TrendingUp, Building2, Users, Banknote, TrendingDown } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useStore } from '@/lib/store';
import StatCard from '@/components/ui/StatCard';

const GOLD = '#C4992A'; const GOLD2 = '#E8C94A'; const GOLD3 = '#8B6914';
const GREEN = '#1A7F4B'; const AMBER = '#B45309'; const RED = '#C0392B';

type Range = '3m' | '6m' | '1y' | 'all';

const ranges: { label: string; value: Range }[] = [
  { label: '3 months', value: '3m' },
  { label: '6 months', value: '6m' },
  { label: '1 year',   value: '1y' },
  { label: 'All time', value: 'all' },
];

function rangeStart(r: Range): Date {
  const d = new Date();
  if (r === '3m')  { d.setMonth(d.getMonth() - 3); return d; }
  if (r === '6m')  { d.setMonth(d.getMonth() - 6); return d; }
  if (r === '1y')  { d.setFullYear(d.getFullYear() - 1); return d; }
  return new Date('2000-01-01');
}

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color ?? GOLD }}>
          {p.name}: {typeof p.value === 'number' && Math.abs(p.value) > 1000 ? formatNaira(Math.abs(p.value)) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const tenants = useStore(s => s.tenants);
  const properties = useStore(s => s.properties);
  const expenses = useStore(s => s.expenses);
  const [range, setRange] = useState<Range>('all');

  const start = rangeStart(range);

  const filteredTenants = useMemo(() =>
    tenants.filter(t => (t.lease_start && new Date(t.lease_start) >= start) || (t.lease_end && new Date(t.lease_end) >= start)),
    [tenants, range] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date) >= start),
    [expenses, range] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const grossRevenue = useMemo(() => filteredTenants.reduce((s, t) => s + t.rent_amount, 0), [filteredTenants]);
  const totalExpenses = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses]);
  const netRevenue = grossRevenue - totalExpenses;

  const vacancyLost = useMemo(() =>
    properties.reduce((sum, p) => {
      const occupied = filteredTenants.filter(t => t.property_id === p.id).length;
      const vacant = p.total_units - occupied;
      const avgRent = filteredTenants.filter(t => t.property_id === p.id).reduce((s, t) => s + t.rent_amount, 0) / (occupied || 1);
      return sum + vacant * avgRent;
    }, 0),
    [properties, filteredTenants]
  );

  const revenueByProp = useMemo(() =>
    properties.map(p => {
      const ts = filteredTenants.filter(t => t.property_id === p.id);
      const exps = filteredExpenses.filter(e => e.property_id === p.id);
      return {
        name: p.name.split(' ')[0],
        gross: ts.reduce((s, t) => s + t.rent_amount, 0),
        expenses: exps.reduce((s, e) => s + e.amount, 0),
        net: ts.reduce((s, t) => s + t.rent_amount, 0) - exps.reduce((s, e) => s + e.amount, 0),
      };
    }),
    [properties, filteredTenants, filteredExpenses]
  );

  const statusData = useMemo(() => [
    { name: 'Active',   value: filteredTenants.filter(t => t.status === 'active').length,   color: GREEN },
    { name: 'Expiring', value: filteredTenants.filter(t => t.status === 'expiring').length, color: AMBER },
    { name: 'Expired',  value: filteredTenants.filter(t => t.status === 'expired').length,  color: RED },
  ], [filteredTenants]);

  const occupancy = useMemo(() =>
    properties.map(p => {
      const occ = filteredTenants.filter(t => t.property_id === p.id).length;
      return { name: p.name.split(' ')[0], occupied: occ, vacant: p.total_units - occ };
    }),
    [properties, filteredTenants]
  );

  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredExpenses.forEach(e => { cats[e.category] = (cats[e.category] ?? 0) + e.amount; });
    const labels: Record<string, string> = { maintenance: 'Maintenance', repair: 'Repair', agent_fee: 'Agent fee', legal: 'Legal', utilities: 'Utilities', insurance: 'Insurance', other: 'Other' };
    const colors = [GOLD, GOLD2, GOLD3, GREEN, AMBER, RED, '#7C3AED'];
    return Object.entries(cats).map(([k, v], i) => ({ name: labels[k] ?? k, value: v, color: colors[i % colors.length] }));
  }, [filteredExpenses]);


  return (
    <div style={{ maxWidth: 1040 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
            Reports
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Portfolio performance and financial overview</p>
        </div>
        <button className="btn btn-outline page-header-btn"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
        >
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Date range filter */}
      <div style={{ display: 'flex', gap: 2, padding: '3px', borderRadius: 11, background: '#fff', border: '1px solid var(--line)', width: 'fit-content', marginBottom: 20 }}>
        {ranges.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: range === r.value ? 'var(--text-1)' : 'transparent',
            color: range === r.value ? '#fff' : 'var(--text-3)',
            transition: 'all 0.12s',
          }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Gross Revenue" value={formatNaira(grossRevenue)} sub="Annual combined" icon={TrendingUp} accent />
        <StatCard label="Net Revenue" value={formatNaira(netRevenue)} sub="After expenses" icon={Banknote} />
        <StatCard label="Total Expenses" value={formatNaira(totalExpenses)} sub={`${filteredExpenses.length} logged items`} icon={TrendingDown} />
        <StatCard label="Properties" value={properties.length} sub="Across portfolio" icon={Building2} />
        <StatCard label="Tenants" value={filteredTenants.length} sub={`${filteredTenants.filter(t => t.status === 'active').length} active`} icon={Users} />
        <StatCard label="Vacancy loss" value={formatNaira(vacancyLost)} sub="Estimated uncollected rent" icon={TrendingDown} />
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Revenue by property (gross vs net) */}
        <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Revenue by property</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>Gross vs. net (after expenses)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByProp} barSize={28} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(196,153,42,0.05)' }} />
              <Bar dataKey="gross" name="Gross rent" radius={[6,6,0,0]} fill={GOLD} />
              <Bar dataKey="net" name="Net income" radius={[6,6,0,0]} fill={GREEN} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenant status */}
        <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Tenant status</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={85} paddingAngle={3} dataKey="value">
                {statusData.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
              </Pie>
              <Legend formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 12 }}>{v}</span>} />
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy */}
        <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Occupancy</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={occupancy} barSize={44}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(196,153,42,0.05)' }} />
              <Bar dataKey="occupied" name="Occupied" stackId="a" fill={GOLD} />
              <Bar dataKey="vacant" name="Vacant" stackId="a" fill="var(--surface-3)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        {expenseByCategory.length > 0 ? (
          <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Expenses by category</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {expenseByCategory.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
                <Legend formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{v}</span>} />
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No expenses logged for this period.</p>
          </div>
        )}

        {/* Breakdown table */}
        <div className="surface" style={{ padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gridColumn: '1 / -1' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Property breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {properties.map(p => {
              const ts = filteredTenants.filter(t => t.property_id === p.id);
              const exps = filteredExpenses.filter(e => e.property_id === p.id);
              const gross = ts.reduce((s, t) => s + t.rent_amount, 0);
              const expTotal = exps.reduce((s, e) => s + e.amount, 0);
              const net = gross - expTotal;
              const occ = Math.round((ts.length / p.total_units) * 100);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
                    {p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{ts.length}/{p.total_units} units · {occ}%</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 160 }}>
                    <p style={{ fontSize: 13.5, color: 'var(--text-1)', fontFamily: 'Inter, sans-serif' }}>{formatNaira(gross)}</p>
                    {expTotal > 0 && <p style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 2 }}>−{formatNaira(expTotal)} expenses</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 120 }}>
                    <p style={{ fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: net >= 0 ? GREEN : RED }}>{formatNaira(net)}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>net</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-dim), transparent)', margin: '20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>Total annual</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Gross: {formatNaira(grossRevenue)} · Expenses: −{formatNaira(totalExpenses)}</p>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', color: netRevenue >= 0 ? 'var(--gold)' : 'var(--red)' }}>{formatNaira(netRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
