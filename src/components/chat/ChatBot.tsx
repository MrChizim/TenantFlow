'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

// ─── Knowledge base ───────────────────────────────────────────────────────────
const KB: { patterns: RegExp[]; answer: string }[] = [
  // Greeting
  {
    patterns: [/^hi$/i, /^hello$/i, /^hey$/i, /^sup$/i, /^good (morning|afternoon|evening)/i, /^hii/i],
    answer: "Hi! I'm TenantFlow Assistant. I can help you navigate the app or answer questions about your properties and tenants. What do you need?",
  },

  // Add property
  {
    patterns: [/add.*(property|building|house)/i, /new property/i, /create.*property/i, /how.*property/i],
    answer: "To add a property:\n1. Click **Properties** in the sidebar\n2. Click the **+ Add property** button (top right)\n3. Fill in the name, address, city, state, and type\n4. Optionally add purchase price and build cost for ROI tracking\n5. Hit **Save**\n\nFree plan allows 1 property. Upgrade to Pro for unlimited.",
  },

  // Add tenant
  {
    patterns: [/add.*(tenant|renter)/i, /new tenant/i, /create.*tenant/i, /how.*tenant/i, /register.*tenant/i],
    answer: "To add a tenant:\n1. Go to **Tenants** → **+ Add tenant**\n2. Enter their name, phone number, and WhatsApp\n3. Select the property and unit type\n4. Set their annual rent and payment status\n5. Hit **Add tenant**\n\nYou can also share a **tenant link** from the property page so tenants fill in their own details.",
  },

  // Tenant invite link
  {
    patterns: [/tenant link/i, /invite.*tenant/i, /tenant.*invite/i, /share.*link/i, /self.*(register|signup|onboard)/i],
    answer: "The **tenant link** lets your tenant fill in their own details:\n1. Go to **Properties** → click a property\n2. Click the **Tenant link** button\n3. Copy the link and send it to your tenant (WhatsApp, SMS, etc.)\n4. They fill in the form — it goes straight into your account\n\nLinks expire after 30 days.",
  },

  // Payment status
  {
    patterns: [/payment status/i, /mark.*paid/i, /owing/i, /who.*ow(es|ing)/i, /unpaid/i, /rent.*status/i],
    answer: "Every tenant has a **payment status**: Paid, Owing, or Uncertain.\n\n- See all statuses on the **Tenants** page (Payment column)\n- Change it on a tenant's detail page — tap the Paid / Owing / Uncertain buttons\n- The **Dashboard** shows a 'Need Attention' count for owing/uncertain tenants\n- **Reminders** page shows all owing/uncertain tenants with a WhatsApp button",
  },

  // Record payment / rent
  {
    patterns: [/record.*payment/i, /log.*payment/i, /payment.*record/i, /tenant.*paid/i, /received.*rent/i, /rent.*paid/i],
    answer: "To record a rent payment:\n1. Go to **Tenants** → click the tenant\n2. Scroll to the **Rent** section\n3. Click **Record payment**\n4. Enter the amount and select the duration (1 year, 6 months, etc.)\n5. This updates their lease end date and rent history automatically",
  },

  // Lease renewal
  {
    patterns: [/renew.*lease/i, /lease.*renew/i, /extend.*lease/i, /renewal/i],
    answer: "To renew a lease:\n1. Go to **Renewals** in the sidebar — it shows all tenants expiring within the year\n2. Click a tenant → **Renew lease** button on their detail page\n3. Select the duration and confirm\n\nOr send a WhatsApp reminder from the **Reminders** page — it pre-writes the message for you.",
  },

  // Reminders / WhatsApp
  {
    patterns: [/reminder/i, /whatsapp.*remind/i, /send.*message/i, /notify.*tenant/i, /contact.*tenant/i],
    answer: "The **Reminders** page shows:\n- Tenants with payment issues (owing/uncertain) — tap WhatsApp to message them\n- Tenants whose lease expires within the year — sorted by urgency\n\nEach tenant has a **WhatsApp button** that opens a pre-written message on your phone. You just tap send.",
  },

  // Expenses
  {
    patterns: [/expense/i, /log.*cost/i, /add.*cost/i, /maintenance/i, /repair/i, /spending/i],
    answer: "To log an expense:\n1. Go to **Expenses** in the sidebar\n2. Click **+ Add expense**\n3. Select the property, category (maintenance, repair, utilities, etc.), amount, and date\n\nExpenses are used in **Reports** to calculate net income and in **ROI** to calculate real returns.",
  },

  // Reports
  {
    patterns: [/report/i, /analytics/i, /income/i, /revenue/i, /net.*income/i, /performance/i],
    answer: "The **Reports** page shows:\n- Revenue by property (gross vs net after expenses)\n- Tenant status breakdown\n- Occupancy rate per property\n- Expense categories breakdown\n- Date range filter: 3 months, 6 months, 1 year, or all time",
  },

  // ROI
  {
    patterns: [/roi/i, /return.*invest/i, /yield/i, /profit/i, /investment.*return/i, /breakeven/i],
    answer: "The **ROI** calculator shows:\n- Gross and net yield for each property\n- Breakeven point (when rent covers your total investment)\n- 20-year projection chart\n- Rent growth modeling\n\nIt uses your actual tenant rent amounts and logged expenses automatically. You can also run a **custom scenario** with hypothetical numbers.",
  },

  // Plans / Pro / Upgrade
  {
    patterns: [/pro.*plan/i, /upgrade/i, /free.*plan/i, /plan.*limit/i, /subscription/i, /how much/i, /pricing/i, /pay.*tenantflow/i],
    answer: "**Free plan**: 1 property, 3 tenants — great for trying the app.\n\n**Pro plan**: ₦10,000/year\n- Unlimited properties and tenants\n- All features unlocked\n- 7-day free trial included\n\nTo upgrade: tap the **gear icon** (top right) → Settings → Billing → **Start free trial**.",
  },

  // Settings / billing
  {
    patterns: [/settings/i, /billing/i, /account/i, /cancel.*subscription/i, /delete.*account/i],
    answer: "**Settings** is accessible via the ⚙️ gear icon in the top right corner.\n\nFrom Settings you can:\n- See your current plan and usage\n- Upgrade to Pro\n- Cancel your subscription\n- Delete your account\n- Sign out",
  },

  // Dashboard
  {
    patterns: [/dashboard/i, /overview/i, /home.*page/i, /main.*page/i],
    answer: "The **Dashboard** shows:\n- Total properties and tenants\n- Need Attention count (owing/uncertain tenants + expiring leases)\n- Payment issues list\n- Upcoming renewals\n- Quick links to add properties and tenants",
  },

  // Delete tenant/property
  {
    patterns: [/delete.*tenant/i, /remove.*tenant/i, /delete.*property/i, /remove.*property/i],
    answer: "To delete a tenant: go to **Tenants** → click the tenant → scroll to the bottom → **Delete tenant**.\n\nTo delete a property: go to **Properties** → click the property → **Delete property** button.\n\n⚠️ Deleting a property also removes all its tenants.",
  },

  // NIN
  {
    patterns: [/nin/i, /national.*id/i, /identity/i],
    answer: "The **NIN** (National Identification Number) field on tenant profiles is optional. It's just for your records — useful for verification or legal documentation. You don't have to fill it in.",
  },

  // Unit type
  {
    patterns: [/unit type/i, /apartment type/i, /type of unit/i],
    answer: "Unit type describes the kind of apartment your tenant occupies — e.g. Self Contain, Mini Flat, 2 Bedroom Flat, etc.\n\nYou can select from the list or choose **Other / Custom** to type your own description.",
  },

  // Mobile / app
  {
    patterns: [/mobile/i, /phone.*app/i, /install/i, /pwa/i, /add to home/i],
    answer: "TenantFlow works on mobile browsers. You can **install it** as an app:\n- **iPhone**: tap Share → 'Add to Home Screen'\n- **Android**: tap the browser menu → 'Add to Home Screen' or 'Install app'\n\nIt works like a native app — no app store needed.",
  },

  // Google sign in error
  {
    patterns: [/google.*error/i, /sign.*google/i, /google.*sign/i, /redirect.*uri/i, /oauth/i, /login.*error/i, /cant.*login/i, /can't.*login/i],
    answer: "If Google sign-in shows **'redirect_uri_mismatch'**, the developer needs to add your Supabase callback URL to Google Cloud Console.\n\nMeanwhile, use **email and password** to sign in — it works perfectly. You can sign up at the login page.",
  },

  // Fallback
  {
    patterns: [/.*/],
    answer: "I'm not sure about that one. Here are things I can help with:\n- Adding properties or tenants\n- Recording payments\n- Understanding the tenant invite link\n- Renewals and reminders\n- Expenses and reports\n- ROI calculator\n- Plan and billing\n\nTry asking something like *\"how do I add a tenant?\"* or *\"what is the Pro plan?\"*",
  },
];

function getAnswer(input: string): string {
  const trimmed = input.trim();
  for (const entry of KB) {
    if (entry.patterns.some(p => p.test(trimmed))) {
      return entry.answer;
    }
  }
  return KB[KB.length - 1].answer;
}

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} style={{ marginBottom: i < text.split('\n').length - 1 ? 4 : 0, lineHeight: 1.6 }}>
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ fontWeight: 600, color: 'var(--text-1)' }}>{part}</strong>
            : part
        )}
      </p>
    );
  });
}

const SUGGESTIONS = [
  'How do I add a tenant?',
  'What is the Pro plan?',
  'How do reminders work?',
  'How do I share a tenant link?',
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm TenantFlow Assistant 👋\n\nAsk me anything about the app — adding tenants, recording payments, reminders, billing, and more." },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const answer = getAnswer(q);
    setMessages(m => [...m, { role: 'user', text: q }, { role: 'bot', text: answer }]);
    setInput('');
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 80, right: 20,
          width: 48, height: 48, borderRadius: '50%',
          background: '#1C1B18', border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        title="Help & Assistant"
      >
        {open
          ? <ChevronDown size={18} color="#fff" />
          : <MessageCircle size={20} color="#fff" />
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 138, right: 20,
          width: 340, maxHeight: 520,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          zIndex: 199, overflow: 'hidden',
          animation: 'chatIn 0.18s ease',
        }}>

          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#1C1B18', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={15} color="#C4992A" />
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>TenantFlow Assistant</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}>
              <X size={16} color="rgba(255,255,255,0.5)" />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#1C1B18' : '#F2F1EE',
                  color: m.role === 'user' ? '#fff' : 'var(--text-2)',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  padding: '10px 13px',
                  fontSize: 13,
                }}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only shown when just the welcome message is there) */}
          {messages.length === 1 && (
            <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  fontSize: 12, padding: '6px 10px', borderRadius: 99,
                  background: 'var(--surface-2)', border: '1px solid var(--line)',
                  color: 'var(--text-2)', cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--line)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask anything…"
              style={{
                flex: 1, border: '1px solid var(--line)', borderRadius: 12,
                padding: '9px 13px', fontSize: 13, outline: 'none',
                background: 'var(--surface-2)', color: 'var(--text-1)',
                fontFamily: 'inherit',
              }}
            />
            <button onClick={() => send(input)} disabled={!input.trim()} style={{
              width: 34, height: 34, borderRadius: 10,
              background: input.trim() ? '#1C1B18' : 'var(--surface-2)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', flexShrink: 0,
            }}>
              <Send size={14} color={input.trim() ? '#fff' : 'var(--text-3)'} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
