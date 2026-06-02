import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import Seo from '../components/Seo'
import { colors, fonts, rules, elevation } from '../constants/theme'
import { brand } from '../constants/brand'
import { SealStar, SealRing, Diamond } from '../components/Glyphs'
import { formatCurrency } from '../lib/pensionCalc'
import { monthlyGuaranteedIncome } from '../data/guaranteedIncomeCalc'
import { projectDrawdown } from '../lib/tspProjection'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans
const FONT_MONO = fonts.mono

const NAVY = brand.colors.primary
const NAVY_DARK = brand.colors.primaryDark
const MAROON = brand.colors.accent
const BRASS = colors.brass
const { paper: PAPER, surface: SURFACE, surfaceRaised: WHITE, ink: INK, inkSoft: INK_SOFT, inkFaint: INK_FAINT, brassDeepInk: BRASS_INK } = colors
const tnum = { fontVariantNumeric: 'tabular-nums' }

// --- Interim access gate -----------------------------------------------------
// First iteration only: an email-domain + access-code gate so the internal
// builder isn't public. Swap for real Supabase per-user auth once the project
// keys exist. No client data is ever stored, so this just controls access.
const FMA_DOMAIN = '@federalmarketassociates.com'
const ACCESS_CODE = import.meta.env.VITE_FMA_ACCESS_CODE || 'fma-advisor-2026'
const SESSION_KEY = 'fma_advisor_session'

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[(m || 1) - 1]} ${d}, ${y}`
}
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdvisorSummary() {
  const [authed, setAuthed] = useState(() => (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) ? true : false)
  const [advisorEmail, setAdvisorEmail] = useState(() => (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) || '')

  const onAuth = (email) => {
    sessionStorage.setItem(SESSION_KEY, email)
    setAdvisorEmail(email)
    setAuthed(true)
  }
  const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: PAPER, fontFamily: FONT_SANS, color: INK }}>
      <Seo title="Advisor — Retirement Summary Builder" description="Internal tool." path="/advisor" noindex />
      {authed ? <Builder advisorEmail={advisorEmail} onSignOut={signOut} /> : <LoginGate onAuth={onAuth} />}
    </main>
  )
}

/* ============================ login gate ============================ */
function LoginGate({ onAuth }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const em = email.trim().toLowerCase()
    if (!em.endsWith(FMA_DOMAIN)) {
      setErr(`Use your ${FMA_DOMAIN} email.`)
      return
    }
    if (code !== ACCESS_CODE) {
      setErr('Incorrect access code.')
      return
    }
    setErr('')
    onAuth(em)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, background: WHITE, border: `1px solid ${rules.inkStrong}`, borderRadius: 12, padding: 36, boxShadow: elevation.artifact }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${MAROON}, ${BRASS})`, borderRadius: 2, marginBottom: 22 }} />
        <img src={brand.logo.src} alt={brand.logo.alt} style={{ height: 46, width: 'auto', display: 'block', mixBlendMode: 'multiply', marginBottom: 18 }} />
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: '1.5rem', fontWeight: 600, color: NAVY, margin: '0 0 4px', letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
          Advisor sign-in
        </h1>
        <p style={{ fontSize: '0.86rem', color: INK_SOFT, margin: '0 0 22px' }}>Internal — Retirement Summary builder.</p>

        <label style={labelText}>FMA email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`you${FMA_DOMAIN}`} autoComplete="username" style={inputBox} />
        </label>
        <label style={{ ...labelText, marginTop: 14 }}>Access code
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="current-password" style={inputBox} />
        </label>

        {err && <div style={{ color: MAROON, fontSize: '0.82rem', marginTop: 12, fontWeight: 600 }}>{err}</div>}

        <button type="submit" style={{ marginTop: 20, width: '100%', padding: '13px 20px', background: MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.98rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS, letterSpacing: '0.01em' }}>
          Sign in
        </button>
        <p style={{ fontSize: '0.72rem', color: INK_FAINT, marginTop: 16, lineHeight: 1.5, fontFamily: FONT_MONO }}>
          Interim access gate (restricted to {FMA_DOMAIN}). Per-user Supabase login is the next step.
        </p>
      </form>
    </div>
  )
}

/* ============================ builder ============================ */
function Builder({ advisorEmail, onSignOut }) {
  const [client, setClient] = useState({
    name: 'Jordan A. Carter',
    agency: 'Department of Veterans Affairs',
    position: 'GS-13, Step 5',
    preparedBy: '',
    date: todayISO(),
  })
  const [fig, setFig] = useState({
    currentNetMonthly: 11000,
    pensionMonthly: 3400,
    supplementMonthly: 1150,
    ssClaimAge: 62,
    ssMonthly: 2100,
    tspBalance: 500000,
    tspAge: 60,
    tspIncomeStartAge: 60,
    tspGrowthPct: 4.5,
    tspMonthlyOverride: '',
    fehbMonthly: 450,
    fegliPreMonthly: 45,
    fegliPostMonthly: 210,
  })
  const [sections, setSections] = useState({ income: true, pension: true, ss: true, tsp: true, fegli: true, actionPlan: true })

  const setF = (k, v) => setFig((p) => ({ ...p, [k]: v }))
  const setC = (k, v) => setClient((p) => ({ ...p, [k]: v }))
  const toggle = (k) => setSections((p) => ({ ...p, [k]: !p[k] }))

  const data = useMemo(() => deriveSummary(fig), [fig])

  return (
    <>
      {/* toolbar — never printed */}
      <div data-no-print style={{ position: 'sticky', top: 0, zIndex: 20, background: NAVY, color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: '1.05rem' }}>Retirement Summary <span style={{ color: colors.brassLight, fontWeight: 400 }}>· builder</span></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{advisorEmail}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={() => window.print()} style={toolbarBtn(MAROON)}>Print / Save as PDF</button>
          <button onClick={onSignOut} style={toolbarBtn('transparent', true)}>Sign out</button>
        </div>
      </div>

      <div data-builder-grid style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', alignItems: 'start', gap: 0 }}>
        {/* FORM — never printed */}
        <div data-no-print style={{ padding: '24px 20px 80px', borderRight: `1px solid ${rules.ink}`, position: 'sticky', top: 52, maxHeight: 'calc(100vh - 52px)', overflowY: 'auto' }}>
          <FormGroup title="Client & advisor">
            <Field label="Client name" type="text" value={client.name} onChange={(v) => setC('name', v)} />
            <Field label="Agency / department" type="text" value={client.agency} onChange={(v) => setC('agency', v)} />
            <Field label="Position" type="text" value={client.position} onChange={(v) => setC('position', v)} />
            <Field label="Prepared by" type="text" value={client.preparedBy} onChange={(v) => setC('preparedBy', v)} placeholder="Advisor name" />
            <Field label="Date" type="date" value={client.date} onChange={(v) => setC('date', v)} />
          </FormGroup>

          <FormGroup title="Income" on={sections.income} onToggle={() => toggle('income')}>
            <Field label="Current net take-home / mo" value={fig.currentNetMonthly} onChange={(v) => setF('currentNetMonthly', v)} prefix="$" />
            <Field label="FEHB premium / mo (retired)" value={fig.fehbMonthly} onChange={(v) => setF('fehbMonthly', v)} prefix="$" />
          </FormGroup>

          <FormGroup title="Pension" on={sections.pension} onToggle={() => toggle('pension')}>
            <Field label="Monthly pension (unreduced)" value={fig.pensionMonthly} onChange={(v) => setF('pensionMonthly', v)} prefix="$" />
            <Field label="FERS Supplement / mo (to 62)" value={fig.supplementMonthly} onChange={(v) => setF('supplementMonthly', v)} prefix="$" />
          </FormGroup>

          <FormGroup title="Social Security" on={sections.ss} onToggle={() => toggle('ss')}>
            <Field label="Claim age" value={fig.ssClaimAge} onChange={(v) => setF('ssClaimAge', v)} />
            <Field label="Monthly benefit at that age" value={fig.ssMonthly} onChange={(v) => setF('ssMonthly', v)} prefix="$" />
          </FormGroup>

          <FormGroup title="TSP" on={sections.tsp} onToggle={() => toggle('tsp')}>
            <Field label="Balance at retirement" value={fig.tspBalance} onChange={(v) => setF('tspBalance', v)} prefix="$" />
            <Field label="Age now" value={fig.tspAge} onChange={(v) => setF('tspAge', v)} />
            <Field label="Age income starts" value={fig.tspIncomeStartAge} onChange={(v) => setF('tspIncomeStartAge', v)} />
            <Field label="Growth rate %" value={fig.tspGrowthPct} onChange={(v) => setF('tspGrowthPct', v)} />
            <Field label="Monthly income (blank = guaranteed)" value={fig.tspMonthlyOverride} onChange={(v) => setF('tspMonthlyOverride', v)} prefix="$" placeholder={String(Math.round(data.guaranteedMonthly))} />
          </FormGroup>

          <FormGroup title="FEGLI" on={sections.fegli} onToggle={() => toggle('fegli')}>
            <Field label="Premium / mo before retirement" value={fig.fegliPreMonthly} onChange={(v) => setF('fegliPreMonthly', v)} prefix="$" />
            <Field label="Premium / mo after retirement" value={fig.fegliPostMonthly} onChange={(v) => setF('fegliPostMonthly', v)} prefix="$" />
          </FormGroup>

          <FormGroup title="Action plan" on={sections.actionPlan} onToggle={() => toggle('actionPlan')} />
        </div>

        {/* PREVIEW / the deliverable */}
        <div style={{ padding: '32px 24px 80px', display: 'flex', justifyContent: 'center', background: PAPER }}>
          <SummaryDoc client={client} fig={fig} data={data} sections={sections} />
        </div>
      </div>

      <style>{`
        @media print {
          nav, footer, [data-no-print] { display: none !important; }
          [data-builder-grid] { display: block !important; }
          [data-print-doc] { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: none !important; width: 100% !important; }
          .summary-section { break-inside: avoid; }
          body { background: #fff !important; }
          @page { margin: 14mm; }
        }
      `}</style>
    </>
  )
}

// Derive all the figures the document shows from the raw form inputs.
function deriveSummary(fig) {
  const n = (x) => Number(x) || 0
  const g = monthlyGuaranteedIncome(n(fig.tspBalance), n(fig.tspAge), n(fig.tspIncomeStartAge) || n(fig.tspAge))
  const guaranteedMonthly = g.monthly
  const tspMonthly = fig.tspMonthlyOverride !== '' && fig.tspMonthlyOverride != null ? n(fig.tspMonthlyOverride) : Math.round(guaranteedMonthly)

  const pension = n(fig.pensionMonthly)
  const ss = n(fig.ssMonthly)
  const fehb = n(fig.fehbMonthly)
  // Steady-state retirement income (pension + SS + TSP) net of FEHB. The FERS
  // Supplement is shown separately as a pre-62 bridge, not stacked here.
  const retireGross = pension + ss + tspMonthly
  const retireNet = retireGross - fehb
  const currentNet = n(fig.currentNetMonthly)
  const replacement = currentNet > 0 ? retireNet / currentNet : 0

  // Survivor election scenarios (standard FERS reductions).
  const survivor = {
    none: { you: pension, survivor: 0 },
    partial: { you: pension * 0.95, survivor: pension * 0.25 },
    full: { you: pension * 0.9, survivor: pension * 0.5 },
  }

  // TSP self-managed drawdown drawing the same monthly amount.
  const proj = projectDrawdown({
    balance: n(fig.tspBalance),
    startAge: n(fig.tspAge),
    incomeStartAge: n(fig.tspIncomeStartAge) || n(fig.tspAge),
    annualWithdrawal: tspMonthly * 12,
    growth: n(fig.tspGrowthPct) / 100,
    endAge: 95,
  })

  return { guaranteedMonthly, tspMonthly, pension, ss, fehb, retireGross, retireNet, currentNet, replacement, survivor, proj }
}

/* ============================ the deliverable document ============================ */
function SummaryDoc({ client, fig, data, sections }) {
  const pct = Math.round(data.replacement * 100)
  return (
    <div data-print-doc style={{ width: '100%', maxWidth: 760, background: WHITE, border: `1px solid ${rules.ink}`, boxShadow: elevation.artifact, padding: '44px 48px 40px' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <img src={brand.logo.src} alt={brand.logo.alt} style={{ height: 48, width: 'auto', display: 'block', mixBlendMode: 'multiply' }} />
        <div style={{ textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.68rem', letterSpacing: '0.08em', color: INK_FAINT, textTransform: 'uppercase' }}>
          Prepared {fmtDate(client.date)}<br />
          {client.preparedBy ? `by ${client.preparedBy}` : 'Federal Market Associates'}
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: BRASS }}><SealStar size={15} /></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BRASS_INK }}>Retirement Summary</span>
      </div>
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: '2.1rem', fontWeight: 600, color: NAVY, margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
        {client.name || 'Client name'}
      </h1>
      <div style={{ fontSize: '0.95rem', color: INK_SOFT }}>
        {[client.agency, client.position].filter(Boolean).join(' · ')}
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${MAROON}, ${BRASS} 60%, transparent)`, marginTop: 18 }} />

      {/* income before/after */}
      {sections.income && (
        <Section title="Your income, before & after">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Plate label="Working today" sub="net take-home / mo">
              <BigFig value={formatCurrency(data.currentNet)} />
            </Plate>
            <Plate label="In retirement" sub="estimated / mo" accent>
              <BigFig value={formatCurrency(data.retireNet)} accent />
              <div style={{ marginTop: 12, borderTop: `1px solid ${rules.ink}`, paddingTop: 10 }}>
                <MiniRow k="Pension" v={data.pension} />
                <MiniRow k={`Social Security (age ${fig.ssClaimAge})`} v={data.ss} />
                <MiniRow k="TSP income" v={data.tspMonthly} />
                <MiniRow k="FEHB premium" v={-data.fehb} />
              </div>
            </Plate>
          </div>
          <p style={{ fontSize: '0.95rem', color: INK, margin: '16px 0 0', lineHeight: 1.55 }}>
            Your estimated retirement income replaces about <strong style={{ color: NAVY }}>{pct}%</strong> of your current take-home.
            {Number(fig.supplementMonthly) > 0 && (
              <span style={{ color: INK_SOFT }}> Before age 62 you'd also receive a <strong style={{ color: BRASS_INK }}>FERS Supplement of {formatCurrency(Number(fig.supplementMonthly))}/mo</strong> as a bridge to Social Security.</span>
            )}
          </p>
        </Section>
      )}

      {/* pension + survivor */}
      {sections.pension && (
        <Section title="Your pension & survivor options">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: '1.8rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.pension)}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: INK_SOFT }}>/ mo · unreduced</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: INK_FAINT, fontFamily: FONT_MONO, fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <th style={thCell}>Survivor election</th>
                <th style={{ ...thCell, textAlign: 'right' }}>Your monthly</th>
                <th style={{ ...thCell, textAlign: 'right' }}>Survivor receives</th>
              </tr>
            </thead>
            <tbody>
              <SurvivorRow label="No survivor — full pension" r={data.survivor.none} />
              <SurvivorRow label="Partial (25% survivor)" r={data.survivor.partial} />
              <SurvivorRow label="Full (50% survivor)" r={data.survivor.full} />
            </tbody>
          </table>
        </Section>
      )}

      {/* social security */}
      {sections.ss && (
        <Section title="Social Security">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: '1.8rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.ss)}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: INK_SOFT }}>/ mo · claiming at age {fig.ssClaimAge}</span>
          </div>
        </Section>
      )}

      {/* TSP */}
      {sections.tsp && (
        <Section title="Your TSP — guaranteed vs. self-managed">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 14 }}>
            <div>
              <div style={metaLabel}>Balance</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.3rem', fontWeight: 600, color: INK, ...tnum }}>{formatCurrency(Number(fig.tspBalance))}</div>
            </div>
            <div>
              <div style={metaLabel}>Guaranteed income — for life</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.3rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.tspMonthly)}<span style={{ fontSize: '0.8rem', fontFamily: FONT_MONO, color: INK_SOFT, fontWeight: 400 }}>/mo</span></div>
            </div>
            <div>
              <div style={metaLabel}>Self-managed at {fig.tspGrowthPct}%</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.3rem', fontWeight: 600, color: data.proj.runOutAge ? MAROON : NAVY }}>
                {data.proj.runOutAge ? `runs out · age ${data.proj.runOutAge}` : 'never runs out'}
              </div>
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <AreaChart width={648} height={200} data={data.proj.data} margin={{ top: 6, right: 12, bottom: 4, left: 6 }}>
              <defs>
                <linearGradient id="balFillDoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NAVY} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(27,36,53,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: INK_SOFT, fontFamily: FONT_SANS }} />
              <YAxis tick={{ fontSize: 11, fill: INK_SOFT, fontFamily: FONT_SANS }} tickFormatter={(v) => (v >= 1000000 ? `$${(v / 1000000).toFixed(1)}m` : `$${Math.round(v / 1000)}k`)} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Balance']} labelFormatter={(l) => `Age ${l}`} contentStyle={{ fontFamily: FONT_SANS, fontSize: '0.82rem', border: `1px solid ${BRASS}`, borderRadius: 8 }} />
              <Area type="monotone" dataKey="balance" stroke={NAVY} strokeWidth={2.5} fill="url(#balFillDoc)" dot={false} />
              {data.proj.runOutAge != null && <ReferenceLine x={data.proj.runOutAge} stroke={MAROON} strokeDasharray="4 4" label={{ value: `runs out · ${data.proj.runOutAge}`, fontSize: 10, fill: MAROON, position: 'top' }} />}
            </AreaChart>
          </div>
          <p style={{ fontSize: '0.86rem', color: INK_SOFT, margin: '8px 0 0', lineHeight: 1.5 }}>
            Drawing {formatCurrency(data.tspMonthly)}/mo yourself, the balance {data.proj.runOutAge ? `is exhausted around age ${data.proj.runOutAge}` : 'is not exhausted by age 95'}. A guaranteed lifetime income pays the same amount for life.
          </p>
        </Section>
      )}

      {/* FEGLI */}
      {sections.fegli && (
        <Section title="FEGLI — cost in retirement">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Plate label="Before retirement" sub="premium / mo"><BigFig value={formatCurrency(Number(fig.fegliPreMonthly))} small /></Plate>
            <Plate label="After retirement" sub="premium / mo" accent><BigFig value={formatCurrency(Number(fig.fegliPostMonthly))} small accent /></Plate>
          </div>
          <p style={{ fontSize: '0.86rem', color: INK_SOFT, margin: '14px 0 0', lineHeight: 1.5 }}>
            FEGLI premiums rise sharply after retirement — most federal employees are surprised by the jump at 65. Worth reviewing whether the coverage still fits.
          </p>
        </Section>
      )}

      {/* action plan */}
      {sections.actionPlan && (
        <Section title="Next steps">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {['Verify access to your TSP.gov and SSA.gov accounts', 'Request an official retirement estimate from your HR Specialist', 'Decide your survivor election (it is hard to change later)', 'Confirm FEHB will carry into retirement (5-year rule)', 'Review FEGLI options before the post-65 cost increases', 'Book a follow-up to lock in your retirement date'].map((t) => (
              <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: `1px solid ${rules.ink}`, fontSize: '0.9rem', color: INK }}>
                <span style={{ color: BRASS, flexShrink: 0, marginTop: 4, display: 'flex' }}><Diamond size={8} /></span>
                {t}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* footer / disclaimer */}
      <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${rules.ink}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: BRASS }}><SealRing size={28} w={1.3} /></span>
          <div style={{ fontFamily: FONT_SERIF, fontSize: '0.92rem', fontWeight: 600, color: NAVY }}>Federal Market Associates</div>
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: '0.6rem', lineHeight: 1.5, color: INK_FAINT, margin: 0, maxWidth: 420, textAlign: 'right' }}>
          Estimates only — based on the figures provided and current federal rules. Not personalized financial, tax, or legal advice. {brand.name} is independent and not affiliated with OPM or any federal agency.
        </p>
      </div>
    </div>
  )
}

/* ============================ small pieces ============================ */
function Section({ title, children }) {
  return (
    <section className="summary-section" style={{ marginTop: 28 }}>
      <h2 style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: BRASS_INK, margin: '0 0 14px' }}>{title}</h2>
      {children}
    </section>
  )
}
function Plate({ label, sub, accent, children }) {
  return (
    <div style={{ background: accent ? colors.accentPale : SURFACE, border: `1px solid ${accent ? rules.brass : rules.ink}`, borderRadius: 8, padding: '16px 18px' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_FAINT }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: '0.64rem', color: INK_FAINT, marginBottom: 6 }}>{sub}</div>
      {children}
    </div>
  )
}
function BigFig({ value, accent, small }) {
  return <div style={{ fontFamily: FONT_SERIF, fontSize: small ? '1.7rem' : '2.1rem', fontWeight: 600, color: accent ? NAVY : INK, letterSpacing: '-0.02em', ...tnum }}>{value}</div>
}
function MiniRow({ k, v }) {
  const neg = v < 0
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0', fontSize: '0.82rem' }}>
      <span style={{ color: INK_SOFT }}>{k}</span>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 600, color: neg ? MAROON : INK, ...tnum }}>{neg ? '–' : ''}{formatCurrency(Math.abs(v))}</span>
    </div>
  )
}
function SurvivorRow({ label, r }) {
  return (
    <tr style={{ borderTop: `1px solid ${rules.ink}` }}>
      <td style={{ ...tdCell, color: INK }}>{label}</td>
      <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, ...tnum }}>{formatCurrency(Math.round(r.you))}</td>
      <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, color: r.survivor ? INK : INK_FAINT, ...tnum }}>{r.survivor ? formatCurrency(Math.round(r.survivor)) : '—'}</td>
    </tr>
  )
}

function FormGroup({ title, on, onToggle, children }) {
  const hasToggle = typeof on === 'boolean'
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: hasToggle && !on ? INK_FAINT : NAVY }}>{title}</span>
        {hasToggle && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: INK_SOFT, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={on} onChange={onToggle} /> include
          </label>
        )}
      </div>
      {(!hasToggle || on) && children && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>}
    </div>
  )
}
function Field({ label, value, onChange, type = 'number', prefix, placeholder }) {
  return (
    <label style={labelText}>{label}
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: INK_FAINT, fontSize: '0.9rem', fontFamily: FONT_MONO }}>{prefix}</span>}
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...inputBox, paddingLeft: prefix ? 26 : 14, marginTop: 4 }} />
      </div>
    </label>
  )
}

const inputBox = { display: 'block', width: '100%', padding: '9px 12px', fontSize: '0.9rem', border: `1px solid ${rules.inkStrong}`, borderRadius: 8, fontFamily: FONT_SANS, color: INK, background: WHITE, boxSizing: 'border-box' }
const labelText = { fontSize: '0.78rem', fontWeight: 600, color: INK_SOFT, display: 'block' }
const metaLabel = { fontFamily: FONT_MONO, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 2 }
const thCell = { padding: '0 0 8px', fontWeight: 600 }
const tdCell = { padding: '9px 0', fontSize: '0.88rem' }
function toolbarBtn(bg, ghost) {
  return { padding: '9px 16px', background: bg, color: '#fff', border: ghost ? '1px solid rgba(255,255,255,0.4)' : 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS }
}
