import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import Seo from '../components/Seo'
import { colors, fonts, rules, elevation } from '../constants/theme'
import { brand } from '../constants/brand'
import { SealStar, SealRing, Diamond } from '../components/Glyphs'
import { formatCurrency, computeAge, mraForBirthYear, formatYearsMonths } from '../lib/pensionCalc'
import { monthlyGuaranteedIncome } from '../data/guaranteedIncomeCalc'
import { projectDrawdown } from '../lib/tspProjection'
import { monthlyPremium, applyReductionFactors, basicCoverageForSalary, FEGLI_RATES } from '../data/fegliRates'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans
const FONT_MONO = fonts.mono

const NAVY = brand.colors.primary
const NAVY_DARK = brand.colors.primaryDark
const MAROON = brand.colors.accent
const { paper: PAPER, surface: SURFACE, surfaceRaised: WHITE, ink: INK, inkSoft: INK_SOFT, inkFaint: INK_FAINT } = colors
const STEEL = colors.brassLight        // light steel — the on-navy accent
const OXBLOOD_INK = colors.brassDeepInk // oxblood — label / badge ink
const tnum = { fontVariantNumeric: 'tabular-nums' }

// Survivor elections (FERS): the standard reductions to the annuitant's pension
// and the share the survivor receives, keyed off the *unreduced* pension.
const SURVIVOR = {
  none:    { label: 'None',          reduction: 0,    survivorPct: 0,    note: 'No survivor annuity — full pension to you.' },
  reduced: { label: 'Reduced (25%)', reduction: 0.05, survivorPct: 0.25, note: '25% survivor annuity — about a 5% reduction to your pension.' },
  full:    { label: 'Full (50%)',    reduction: 0.10, survivorPct: 0.50, note: '50% survivor annuity — about a 10% reduction to your pension.' },
}

// Retirement systems. The pension formula and FERS-Supplement eligibility differ
// by system (CSRS never gets the Supplement).
const SYSTEMS = {
  fers: { label: 'FERS', short: 'FERS' },
  csrs: { label: 'CSRS', short: 'CSRS' },
  special: { label: 'FERS Special Provisions', short: 'Special Provisions' },
}

// Survivor election labels differ by system: FERS/SP survivor = 25%/50% of the
// pension; CSRS survivor = 55% of an elected base (full base or a partial base).
function survivorOptionLabel(system, key) {
  if (key === 'none') return 'None'
  if (system === 'csrs') return key === 'full' ? 'Full (55%)' : 'Partial'
  return key === 'full' ? 'Full (50%)' : 'Reduced (25%)'
}

// --- Interim access gate -----------------------------------------------------
// Real per-user Supabase auth when configured, else an interim email-domain +
// access-code gate so the internal builder isn't public. No client data stored.
const FMA_DOMAIN = '@federalmarketassociates.com'
const FRC_EMAILS = []
const ACCESS_CODE = import.meta.env.VITE_FMA_ACCESS_CODE || 'fma-advisor-2026'
const SESSION_KEY = 'fma_advisor_session'

// Dev-only preview: `/advisor?preview=1` skips the gate in `npm run dev` so the
// builder can be worked on without a login. Compiled OUT of production builds
// (import.meta.env.DEV is false there), so it can never bypass the live gate.
const DEV_PREVIEW = import.meta.env.DEV &&
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'

function isAllowedEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  if (FRC_EMAILS.length) return FRC_EMAILS.includes(e)
  return e.endsWith(FMA_DOMAIN)
}

function fmtMonthYear(ym) {
  if (!ym) return '—'
  const [y, m] = ym.split('-').map(Number)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[(m || 1) - 1]} ${y}`
}
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
function todayYm() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AdvisorSummary() {
  const [authed, setAuthed] = useState(DEV_PREVIEW)
  const [advisorEmail, setAdvisorEmail] = useState(DEV_PREVIEW ? 'preview@dev' : '')
  const [checking, setChecking] = useState(isSupabaseConfigured && !DEV_PREVIEW)

  useEffect(() => {
    if (DEV_PREVIEW) return
    if (!isSupabaseConfigured) {
      const s = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null
      if (s) { setAuthed(true); setAdvisorEmail(s) }
      return
    }
    const applyUser = (u) => {
      if (u && isAllowedEmail(u.email)) { setAuthed(true); setAdvisorEmail(u.email) }
      else { setAuthed(false); setAdvisorEmail('') }
    }
    supabase.auth.getSession().then(({ data }) => { applyUser(data?.session?.user); setChecking(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => applyUser(session?.user))
    return () => listener?.subscription?.unsubscribe()
  }, [])

  const onInterimAuth = (email) => { sessionStorage.setItem(SESSION_KEY, email); setAdvisorEmail(email); setAuthed(true) }
  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    else sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false); setAdvisorEmail('')
  }

  return (
    <main style={{ minHeight: '100vh', background: PAPER, fontFamily: FONT_SANS, color: INK }}>
      <Seo title="FRC Portal — Retirement Summary Builder" description="Internal tool." path="/advisor" noindex />
      {checking
        ? <GateShell><p style={{ fontSize: '0.86rem', color: INK_SOFT, fontFamily: FONT_MONO, textAlign: 'center', margin: 0 }}>Checking your session…</p></GateShell>
        : authed
          ? <Builder advisorEmail={advisorEmail} onSignOut={signOut} />
          : <LoginGate onInterimAuth={onInterimAuth} />}
    </main>
  )
}

/* ============================ sign-in gate ============================ */
function GateShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: WHITE, border: `1px solid ${rules.inkStrong}`, borderRadius: 12, padding: 36, boxShadow: elevation.artifact }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${MAROON}, ${NAVY})`, borderRadius: 2, marginBottom: 22 }} />
        <img src="/fma-logo-mark.png" alt={brand.name} style={{ height: 40, width: 'auto', display: 'block', marginBottom: 18 }} />
        {children}
      </div>
    </div>
  )
}

function LoginGate({ onInterimAuth }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const realAuth = isSupabaseConfigured
  const signup = realAuth && mode === 'signup'

  const submit = async (e) => {
    e.preventDefault()
    const em = email.trim().toLowerCase()
    if (!isAllowedEmail(em)) {
      setErr(FRC_EMAILS.length ? 'That email is not authorized for the FRC portal.' : `Use your ${FMA_DOMAIN} email.`)
      return
    }
    if (realAuth) {
      if (signup && secret.length < 8) { setErr('Choose a password of at least 8 characters.'); return }
      setBusy(true); setErr('')
      const { error } = signup
        ? await supabase.auth.signUp({ email: em, password: secret })
        : await supabase.auth.signInWithPassword({ email: em, password: secret })
      setBusy(false)
      if (error) { setErr(error.message || 'Something went wrong. Try again.'); return }
    } else {
      if (secret !== ACCESS_CODE) { setErr('Incorrect access code.'); return }
      setErr(''); onInterimAuth(em)
    }
  }

  return (
    <GateShell>
      <form onSubmit={submit}>
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: '1.5rem', fontWeight: 600, color: NAVY, margin: '0 0 4px', letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
          {signup ? 'Create your FRC account' : 'FRC sign-in'}
        </h1>
        <p style={{ fontSize: '0.86rem', color: INK_SOFT, margin: '0 0 22px' }}>Federal Market Associates — Retirement Summary builder.</p>
        <label style={labelText}>FMA email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`you${FMA_DOMAIN}`} autoComplete="username" style={inputBox} />
        </label>
        <label style={{ ...labelText, marginTop: 14 }}>{realAuth ? (signup ? 'Choose a password' : 'Password') : 'Access code'}
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} style={inputBox} />
        </label>
        {err && <div style={{ color: MAROON, fontSize: '0.82rem', marginTop: 12, fontWeight: 600 }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, width: '100%', padding: '13px 20px', background: MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.98rem', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', fontFamily: FONT_SANS, letterSpacing: '0.01em', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Working…' : signup ? 'Create account' : 'Sign in'}
        </button>
        {realAuth && (
          <button type="button" onClick={() => { setMode(signup ? 'signin' : 'signup'); setErr('') }} style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', color: NAVY, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS, textDecoration: 'underline' }}>
            {signup ? 'Already have an account? Sign in' : 'First time? Create your account'}
          </button>
        )}
        <p style={{ fontSize: '0.72rem', color: INK_FAINT, marginTop: 16, lineHeight: 1.5, fontFamily: FONT_MONO }}>
          {realAuth ? `Restricted to authorized FRCs (${FMA_DOMAIN}).` : `Interim access gate (restricted to ${FMA_DOMAIN}).`}
        </p>
      </form>
    </GateShell>
  )
}

/* ============================ builder ============================ */
function Builder({ advisorEmail, onSignOut }) {
  const [client, setClient] = useState({
    name: 'Jordan A. Carter',
    state: 'Virginia',
    agency: 'Department of Veterans Affairs',
    system: 'fers',
    scd: '2004-06',
    birthdate: '1965-04',
    yearsOfService: '22',
    retireDate: '2026-06',
    salary: 95000,
    high3: '',
    sickLeaveHours: '1044',
    annualLeaveHours: '440',
    netTakeHome: '',
    preparedBy: '',
    date: todayISO(),
  })
  const [pension, setPension] = useState({ survivor: 'none' })
  const [ss, setSs] = useState([{ age: 62, monthly: 2100 }])
  const [tsp, setTsp] = useState({ balance: 500000, growthPct: 3.5 })
  const [compare, setCompare] = useState({ mode: 'today', goalMonthly: 7000 })
  const [fegli, setFegli] = useState({
    keepInRetirement: true,
    basic: true, basicReduction: '75',
    optionA: false,
    optionBMult: 2, optionBReduction: 'full',
    optionCMult: 0, optionCReduction: 'full',
  })

  const setC = (k, v) => setClient((p) => ({ ...p, [k]: v }))
  const setP = (k, v) => setPension((p) => ({ ...p, [k]: v }))
  const setT = (k, v) => setTsp((p) => ({ ...p, [k]: v }))
  const setCmp = (k, v) => setCompare((p) => ({ ...p, [k]: v }))
  const setFg = (k, v) => setFegli((p) => ({ ...p, [k]: v }))
  const setSsRow = (i, k, v) => setSs((rows) => rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const addSsRow = () => setSs((rows) => [...rows, { age: '', monthly: '' }])
  const removeSsRow = (i) => setSs((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : rows))

  const data = useMemo(() => deriveSummary({ client, pension, ss, tsp, compare, fegli }), [client, pension, ss, tsp, compare, fegli])

  // Direct PDF export — capture each document "page" card exactly as rendered
  // (full color), one card per PDF page, and download. No browser print dialog.
  const [pdfBusy, setPdfBusy] = useState(false)
  async function downloadPdf() {
    if (pdfBusy) return
    setPdfBusy(true)
    try {
      const [h2c, jspdf] = await Promise.all([import('html2canvas'), import('jspdf')])
      const html2canvas = h2c.default || h2c
      const JsPDF = jspdf.jsPDF || jspdf.default
      const pages = [...document.querySelectorAll('[data-print-doc]')]
      let pdf
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
        const w = canvas.width / 2
        const h = canvas.height / 2
        const orientation = w >= h ? 'landscape' : 'portrait'
        if (!pdf) pdf = new JsPDF({ unit: 'px', format: [w, h], orientation, compress: true })
        else pdf.addPage([w, h], orientation)
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, w, h, undefined, 'FAST')
      }
      const safe = (client.name || 'Client').replace(/[^\w .-]/g, '').trim() || 'Client'
      pdf.save(`Retirement Summary - ${safe}.pdf`)
    } catch (e) {
      console.error('PDF export failed', e)
      alert('Sorry — the PDF export hit an error. Please try again.')
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <>
      <div data-no-print style={{ position: 'sticky', top: 0, zIndex: 20, background: NAVY, color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: '1.05rem' }}>Retirement Summary <span style={{ color: STEEL, fontWeight: 400 }}>· builder</span></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{advisorEmail}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={downloadPdf} disabled={pdfBusy} style={{ ...toolbarBtn(MAROON), opacity: pdfBusy ? 0.7 : 1, cursor: pdfBusy ? 'wait' : 'pointer' }}>{pdfBusy ? 'Generating PDF…' : 'Download PDF'}</button>
          <button onClick={onSignOut} style={toolbarBtn('transparent', true)}>Sign out</button>
        </div>
      </div>

      <div data-builder-grid style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', alignItems: 'start', gap: 0 }}>
        {/* FORM */}
        <div data-no-print style={{ padding: '24px 20px 80px', borderRight: `1px solid ${rules.ink}`, position: 'sticky', top: 52, maxHeight: 'calc(100vh - 52px)', overflowY: 'auto' }}>
          <FormGroup title="Client">
            <Field label="Name" type="text" value={client.name} onChange={(v) => setC('name', v)} />
            <Field label="State" type="text" value={client.state} onChange={(v) => setC('state', v)} />
            <Field label="Agency" type="text" value={client.agency} onChange={(v) => setC('agency', v)} />
            <Field label="Service computation date (hired)" type="month" value={client.scd} onChange={(v) => setC('scd', v)} />
            <Field label="Date of birth" type="month" value={client.birthdate} onChange={(v) => setC('birthdate', v)} />
            <Field label="Years of service" value={client.yearsOfService} onChange={(v) => setC('yearsOfService', v)} />
            <Field label="Planned retirement date" type="month" value={client.retireDate} onChange={(v) => setC('retireDate', v)} />
            <Field label="Current annual salary" value={client.salary} onChange={(v) => setC('salary', v)} prefix="$" />
            <Field label="High-3 average (optional)" value={client.high3} onChange={(v) => setC('high3', v)} prefix="$" placeholder={`uses salary (${formatCurrency(Number(client.salary))})`} />
            <Field label="Unused sick leave (hours)" value={client.sickLeaveHours} onChange={(v) => setC('sickLeaveHours', v)} placeholder="0" />
            <Field label="Unused annual leave (hours)" value={client.annualLeaveHours} onChange={(v) => setC('annualLeaveHours', v)} placeholder="0" />
            <Field label="Prepared by" type="text" value={client.preparedBy} onChange={(v) => setC('preparedBy', v)} placeholder="Advisor name" />
          </FormGroup>

          <FormGroup title="Retirement system">
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(SYSTEMS).map(([key, s]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setC('system', key)}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 7, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '0.74rem', fontWeight: 600, lineHeight: 1.15,
                    border: `1px solid ${client.system === key ? MAROON : rules.inkStrong}`,
                    background: client.system === key ? colors.accentPale : WHITE,
                    color: client.system === key ? OXBLOOD_INK : INK_SOFT,
                  }}
                >
                  {s.short}
                </button>
              ))}
            </div>
            <p style={hintText}>Sets the pension formula and whether the FERS Supplement can apply.</p>
          </FormGroup>

          <FormGroup title="Pension (calculated)">
            <div style={readout}>
              <span style={{ color: INK_SOFT }}>Monthly pension</span>
              <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: NAVY, ...tnum }}>{formatCurrency(data.pensionUnreduced)}<span style={{ color: INK_FAINT, fontWeight: 400, fontSize: '0.78rem' }}> /mo</span></span>
            </div>
            <p style={hintText}>{(SYSTEMS[data.system] || SYSTEMS.fers).short} · High-3 {formatCurrency(data.high3)} · {data.yos || 0} yrs{data.system === 'fers' ? ` × ${(data.multiplier * 100).toFixed(1)}%` : ''}{data.enhanced ? ' (62 + 20 kicker)' : ''}.</p>
            <div>
              <div style={{ ...labelText, marginBottom: 6 }}>Survivor benefit elected</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['none', 'reduced', 'full'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setP('survivor', key)}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: 7, cursor: 'pointer', fontFamily: FONT_SANS,
                      fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.15,
                      border: `1px solid ${pension.survivor === key ? MAROON : rules.inkStrong}`,
                      background: pension.survivor === key ? colors.accentPale : WHITE,
                      color: pension.survivor === key ? OXBLOOD_INK : INK_SOFT,
                    }}
                  >
                    {survivorOptionLabel(client.system, key)}
                  </button>
                ))}
              </div>
            </div>
            <p style={hintText}>{data.supplementEligible
              ? `FERS Supplement applies — ${formatCurrency(data.supplement)}/mo until age 62 (calculated).`
              : 'FERS Supplement: not applicable (only when retiring before 62 with an immediate annuity).'}</p>
          </FormGroup>

          <FormGroup title="Social Security">
            {ss.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto', gap: 8, alignItems: 'end' }}>
                <Field label={i === 0 ? 'Claim age' : ''} value={r.age} onChange={(v) => setSsRow(i, 'age', v)} />
                <Field label={i === 0 ? 'Monthly benefit' : ''} value={r.monthly} onChange={(v) => setSsRow(i, 'monthly', v)} prefix="$" />
                <button type="button" onClick={() => removeSsRow(i)} disabled={ss.length === 1} title="Remove" style={{ height: 38, width: 34, borderRadius: 7, border: `1px solid ${rules.inkStrong}`, background: WHITE, color: ss.length === 1 ? INK_FAINT : MAROON, cursor: ss.length === 1 ? 'default' : 'pointer', fontSize: '1rem' }}>–</button>
              </div>
            ))}
            <button type="button" onClick={addSsRow} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: NAVY, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>+ Add a claiming age</button>
            <p style={{ fontSize: '0.72rem', color: INK_FAINT, margin: 0, lineHeight: 1.4 }}>The first age is used in the income comparison; any others show as alternatives.</p>
          </FormGroup>

          <FormGroup title="Income comparison">
            <div>
              <div style={{ ...labelText, marginBottom: 6 }}>Compare retirement income to</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['today', "Today's income"], ['goal', 'An income goal']].map(([key, lbl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCmp('mode', key)}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: 7, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '0.8rem', fontWeight: 600,
                      border: `1px solid ${compare.mode === key ? MAROON : rules.inkStrong}`,
                      background: compare.mode === key ? colors.accentPale : WHITE,
                      color: compare.mode === key ? OXBLOOD_INK : INK_SOFT,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            {compare.mode === 'goal'
              ? <Field label="Desired monthly income in retirement" value={compare.goalMonthly} onChange={(v) => setCmp('goalMonthly', v)} prefix="$" />
              : <>
                  <Field label="Net take-home / mo (optional)" value={client.netTakeHome} onChange={(v) => setC('netTakeHome', v)} prefix="$" placeholder={`gross ${formatCurrency(data.grossMonthly)}`} />
                  <p style={hintText}>{data.usingNet ? 'Comparing against your take-home pay.' : `Comparing against gross pay (${formatCurrency(data.grossMonthly)}/mo) — enter take-home for a net comparison.`}</p>
                </>}
          </FormGroup>

          <FormGroup title="TSP">
            <Field label="TSP balance at retirement" value={tsp.balance} onChange={(v) => setT('balance', v)} prefix="$" />
            <Field label="Self-managed growth rate %" value={tsp.growthPct} onChange={(v) => setT('growthPct', v)} />
          </FormGroup>

          <FormGroup title="FEGLI (page 2)">
            <Check label="Carry FEGLI into retirement" checked={fegli.keepInRetirement} onChange={() => setFg('keepInRetirement', !fegli.keepInRetirement)} />
            {fegli.keepInRetirement && (
              <>
                <Check label="Basic" checked={fegli.basic} onChange={() => setFg('basic', !fegli.basic)} />
                {fegli.basic && <Seg label="Basic reduction" value={fegli.basicReduction} onChange={(v) => setFg('basicReduction', v)} options={[['75', '75%'], ['50', '50%'], ['none', 'None']]} />}
                <Check label="Option A ($10,000)" checked={fegli.optionA} onChange={() => setFg('optionA', !fegli.optionA)} />
                <Field label="Option B multiples (0–5)" value={fegli.optionBMult} onChange={(v) => setFg('optionBMult', v)} />
                {Number(fegli.optionBMult) > 0 && <Seg label="Option B reduction" value={fegli.optionBReduction} onChange={(v) => setFg('optionBReduction', v)} options={[['full', 'Full'], ['none', 'None']]} />}
                <Field label="Option C multiples (0–5)" value={fegli.optionCMult} onChange={(v) => setFg('optionCMult', v)} />
                {Number(fegli.optionCMult) > 0 && <Seg label="Option C reduction" value={fegli.optionCReduction} onChange={(v) => setFg('optionCReduction', v)} options={[['full', 'Full'], ['none', 'None']]} />}
              </>
            )}
          </FormGroup>
        </div>

        {/* PREVIEW / the deliverable (page 1 + FEGLI page 2) */}
        <div style={{ padding: '32px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: PAPER }}>
          <SummaryDoc client={client} pension={pension} ss={ss} tsp={tsp} data={data} />
          <FegliPage client={client} data={data} />
          <ClosingCard client={client} data={data} />
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

// Derive every figure the document shows from the raw inputs.
function deriveSummary({ client, pension, ss, tsp, compare, fegli }) {
  const n = (x) => Number(x) || 0

  const ageNow = computeAge({ birthDate: client.birthdate, asOfDate: todayYm() })
  const ageAtRet = computeAge({ birthDate: client.birthdate, asOfDate: client.retireDate })
  const yos = n(client.yearsOfService)
  // Unused sick leave is added to service for the ANNUITY COMPUTATION only — it
  // does not count toward eligibility or the FERS 1.1% threshold. 2,087 hrs = 1 yr.
  const sickYears = n(client.sickLeaveHours) / 2087
  const pensionYos = yos + sickYears
  const sickLabel = sickYears <= 0 ? '' : sickYears >= 1 ? formatYearsMonths(sickYears) : `${Math.round(sickYears * 12)} mo`
  const system = client.system || 'fers'
  const salary = n(client.salary)
  // High-3 basis: explicit entry (for clients within ~2 years of retiring) else salary.
  const high3 = n(client.high3) > 0 ? n(client.high3) : salary

  // Pension by system, on the computation service (entered + sick-leave credit) + High-3.
  let pensionUnreduced = 0
  let multiplier = 0.010
  let enhanced = false
  let csrsCapped = false
  if (high3 > 0 && pensionYos > 0) {
    if (system === 'csrs') {
      // 1.5% first 5 yrs + 1.75% next 5 + 2.0% beyond, capped at 80% of High-3.
      const t1 = Math.min(pensionYos, 5), t2 = Math.min(Math.max(pensionYos - 5, 0), 5), t3 = Math.max(pensionYos - 10, 0)
      const cap = high3 * 0.80
      let annual = high3 * (0.015 * t1 + 0.0175 * t2 + 0.020 * t3)
      csrsCapped = annual > cap
      annual = Math.min(annual, cap)
      pensionUnreduced = annual / 12
    } else if (system === 'special') {
      // 1.7% × first 20 yrs + 1.0% × additional.
      const sp1 = Math.min(pensionYos, 20), sp2 = Math.max(pensionYos - 20, 0)
      pensionUnreduced = (high3 * (0.017 * sp1 + 0.010 * sp2)) / 12
    } else {
      // FERS — 1.1% only at age 62+ with 20+ YOS (sick leave does NOT count toward the 20).
      enhanced = ageAtRet != null && ageAtRet >= 62 && yos >= 20
      multiplier = enhanced ? 0.011 : 0.010
      pensionUnreduced = (high3 * pensionYos * multiplier) / 12
    }
  }

  // Survivor election — FERS/SP use flat reductions; CSRS elects a survivor base
  // (survivor gets 55% of it; reduction = 2.5% of the first $3,600 + 10% above).
  const survKey = pension.survivor || 'none'
  const surv = SURVIVOR[survKey] || SURVIVOR.none
  const survLabel = survivorOptionLabel(system, survKey)
  const annualUnreduced = pensionUnreduced * 12
  let reductionFrac = 0
  let survivorReceives = 0
  let survNote = ''
  if (system === 'csrs') {
    const baseFrac = survKey === 'full' ? 1 : survKey === 'reduced' ? 0.5 : 0
    const base = annualUnreduced * baseFrac
    const reductionAnnual = 0.025 * Math.min(base, 3600) + 0.10 * Math.max(base - 3600, 0)
    reductionFrac = annualUnreduced > 0 ? reductionAnnual / annualUnreduced : 0
    survivorReceives = (0.55 * base) / 12
    survNote = survKey === 'none'
      ? 'No survivor annuity — full pension to you.'
      : `CSRS survivor base of ${Math.round(baseFrac * 100)}% of your annuity; your survivor receives 55% of that base. The reduction is 2.5% of the first $3,600 of the base plus 10% above.`
  } else {
    reductionFrac = surv.reduction
    survivorReceives = pensionUnreduced * surv.survivorPct
    survNote = surv.note
  }
  const electedPension = pensionUnreduced * (1 - reductionFrac)

  // Social Security — first row = the planned claim used in the comparison.
  const ssRows = (ss || []).map((r) => ({ age: n(r.age), monthly: n(r.monthly) })).filter((r) => r.monthly > 0 || r.age > 0)
  const primarySs = ssRows[0] ? ssRows[0].monthly : 0
  const ssClaimAge = ssRows[0] ? ssRows[0].age : null
  const row62 = ssRows.find((r) => r.age === 62)
  const ssAt62 = row62 ? row62.monthly : primarySs

  // FERS Supplement — paid until 62, only for FERS / Special Provisions retiring
  // before 62 with an immediate annuity. CSRS never receives it.
  const birthYear = client.birthdate ? parseInt(client.birthdate.split('-')[0], 10) : 0
  const mra = mraForBirthYear(birthYear)
  let supplementEligible = false
  if (ageAtRet != null && ageAtRet < 62 && yos > 0) {
    if (system === 'fers') supplementEligible = (yos >= 30 && ageAtRet >= mra) || (yos >= 20 && ageAtRet >= 60)
    else if (system === 'special') supplementEligible = yos >= 25 || (yos >= 20 && ageAtRet >= 50)
    // csrs: never
  }
  const supplement = supplementEligible ? ssAt62 * (Math.min(40, Math.floor(yos)) / 40) : 0

  // Income stages in retirement (only when the Supplement applies; SS may begin later than 62).
  const retAge = ageAtRet != null ? Math.floor(ageAtRet) : null
  const stages = []
  if (supplementEligible && retAge != null) {
    stages.push({ label: `Age ${retAge}–62`, sub: 'pension + FERS Supplement', monthly: electedPension + supplement })
    if (ssClaimAge != null && ssClaimAge > 62) {
      stages.push({ label: `Age 62–${ssClaimAge}`, sub: 'pension only · Supplement ends', monthly: electedPension })
      stages.push({ label: `Age ${ssClaimAge}+`, sub: 'pension + Social Security', monthly: electedPension + primarySs })
    } else {
      stages.push({ label: 'Age 62+', sub: 'pension + Social Security', monthly: electedPension + primarySs })
    }
  }

  // Steady-state retirement income (pension + SS) drives the gap & TSP fill.
  const retirementMonthly = electedPension + primarySs
  const grossMonthly = salary / 12
  const netTakeHome = n(client.netTakeHome)
  const usingGoal = compare && compare.mode === 'goal'
  const usingNet = !usingGoal && netTakeHome > 0
  const currentMonthly = usingNet ? netTakeHome : grossMonthly
  const goalMonthly = n(compare && compare.goalMonthly)
  const target = usingGoal ? goalMonthly : currentMonthly
  const gapMonthly = Math.max(0, target - retirementMonthly)
  const replacement = target > 0 ? retirementMonthly / target : 0

  // Annual-leave lump sum — a one-time, taxable payout on the final check (hours × hourly rate).
  const annualLeavePayout = n(client.annualLeaveHours) * (salary / 2087)

  // TSP → guaranteed income (NIA). Linear in balance, so invert to size the fill.
  const balance = n(tsp.balance)
  const niaFull = monthlyGuaranteedIncome(balance, ageNow, ageAtRet) // { monthly, annual, rate }
  const niaFullMonthly = niaFull.monthly

  let amountUsed = 0, incomeProvided = 0, enough = false, leftover = 0, remainingGap = 0
  if (gapMonthly > 0 && niaFullMonthly > 0) {
    if (niaFullMonthly >= gapMonthly) {
      enough = true
      incomeProvided = gapMonthly
      amountUsed = balance * (gapMonthly / niaFullMonthly)
      leftover = balance - amountUsed
    } else {
      enough = false
      incomeProvided = niaFullMonthly
      amountUsed = balance
      remainingGap = gapMonthly - niaFullMonthly
    }
  }

  // Self-managed longevity of the amount used, drawing the same annual income.
  const growth = n(tsp.growthPct) / 100
  const proj = amountUsed > 0
    ? projectDrawdown({ balance: amountUsed, startAge: Math.round(ageNow), incomeStartAge: Math.round(ageAtRet), annualWithdrawal: incomeProvided * 12, growth, endAge: 95 })
    : { data: [], runOutAge: null }
  const lastsYears = proj.runOutAge != null && ageAtRet != null ? Math.max(0, proj.runOutAge - Math.round(ageAtRet)) : null

  // FEGLI — coverage now vs. in retirement + a monthly-cost table by 5-year age
  // bracket starting at the client's current-age bracket. Costs reflect their
  // exact elections (reductions take effect at 65 for retirees).
  const fegliKeep = !!(fegli && fegli.keepInRetirement)
  const fegliInputs = { salary, basic: !!(fegli && fegli.basic), optionA: !!(fegli && fegli.optionA), optionBMult: n(fegli && fegli.optionBMult), optionCMult: n(fegli && fegli.optionCMult), postal: false }
  const fegliElections = { basicReduction: (fegli && fegli.basicReduction) || '75', optionBReduction: (fegli && fegli.optionBReduction) || 'full', optionCReduction: (fegli && fegli.optionCReduction) || 'full' }
  const fegliRetAge = Math.max(40, Math.round(ageAtRet != null ? ageAtRet : 60))
  const fegliAgeNow = Math.max(0, Math.round(ageNow != null ? ageNow : Math.max(40, fegliRetAge - 1)))
  const bia = basicCoverageForSalary(salary)
  const optBFace = Math.ceil(salary / 1000) * 1000 * fegliInputs.optionBMult
  const optCFace = 5000 * fegliInputs.optionCMult // spouse face; children covered separately
  const basicRetFactor = fegliElections.basicReduction === 'none' ? 1 : fegliElections.basicReduction === '50' ? 0.5 : 0.25
  const fegliCoverageRows = []
  const fegliTable = []
  let fegliTotal = 0
  if (fegliKeep) {
    if (fegliInputs.basic) fegliCoverageRows.push({ name: 'Basic', now: bia, ret: bia * basicRetFactor })
    if (fegliInputs.optionA) fegliCoverageRows.push({ name: 'Option A', now: 10000, ret: 2500 })
    if (fegliInputs.optionBMult > 0) fegliCoverageRows.push({ name: `Option B ×${fegliInputs.optionBMult}`, now: optBFace, ret: fegliElections.optionBReduction === 'none' ? optBFace : 0 })
    if (fegliInputs.optionCMult > 0) fegliCoverageRows.push({ name: `Option C ×${fegliInputs.optionCMult}`, now: optCFace, ret: fegliElections.optionCReduction === 'none' ? optCFace : 0 })

    const startIdx = Math.max(0, FEGLI_RATES.findIndex((b) => fegliAgeNow >= b.min && fegliAgeNow <= b.max))
    for (const b of FEGLI_RATES.slice(startIdx, startIdx + 5)) {
      const repAge = Math.max(b.min, fegliAgeNow)
      const adj = applyReductionFactors(monthlyPremium({ age: repAge, ...fegliInputs }), fegliElections, repAge, repAge >= fegliRetAge)
      fegliTable.push({ interval: b.label, basic: adj.basic, optionA: adj.optionA, optionB: adj.optionB, optionC: adj.optionC, total: adj.total })
    }
    for (let age = fegliRetAge; age <= 90; age++) {
      fegliTotal += applyReductionFactors(monthlyPremium({ age, ...fegliInputs }), fegliElections, age, true).total * 12
    }
  }

  return {
    ageNow, ageAtRet, yos, pensionYos, sickYears, sickLabel, system, salary, high3, enhanced, multiplier, csrsCapped, pensionUnreduced, surv, survLabel, reductionFrac, survNote, electedPension, survivorReceives,
    ssRows, primarySs, ssClaimAge, supplementEligible, supplement, stages,
    currentMonthly, grossMonthly, netTakeHome, usingNet, goalMonthly, usingGoal, target, retirementMonthly, gapMonthly, replacement, annualLeavePayout,
    balance, niaFull, niaFullMonthly, amountUsed, incomeProvided, enough, leftover, remainingGap,
    proj, growthPct: n(tsp.growthPct), lastsYears,
    fegliKeep, fegliTable, fegliCoverageRows, fegliTotal, fegliInput: fegli,
  }
}

/* ============================ the deliverable document ============================ */
function SummaryDoc({ client, pension, data }) {
  const pct = Math.round(data.replacement * 100)
  const covered = data.gapMonthly <= 0
  return (
    <div data-print-doc style={{ width: '100%', maxWidth: 760, background: WHITE, border: `1px solid ${rules.ink}`, boxShadow: elevation.artifact, padding: '44px 48px 40px' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <img src="/fma-logo-mark.png" alt={brand.name} style={{ height: 44, width: 'auto', display: 'block' }} />
        <div style={{ textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.68rem', letterSpacing: '0.08em', color: INK_FAINT, textTransform: 'uppercase' }}>
          Prepared {fmtDate(client.date)}<br />
          {client.preparedBy ? `by ${client.preparedBy}` : 'Federal Market Associates'}
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: MAROON }}><SealStar size={15} /></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: OXBLOOD_INK }}>Retirement Summary</span>
      </div>
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: '2.1rem', fontWeight: 600, color: NAVY, margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
        {client.name || 'Client name'}
      </h1>
      <div style={{ fontSize: '0.95rem', color: INK_SOFT }}>
        {[client.agency, client.state].filter(Boolean).join(' · ')}
      </div>
      <div style={{ marginTop: 7, fontFamily: FONT_MONO, fontSize: '0.72rem', color: INK_FAINT, letterSpacing: '0.02em', lineHeight: 1.5 }}>
        {[(SYSTEMS[data.system] || SYSTEMS.fers).label, data.ageAtRet != null ? `age ${Math.floor(data.ageAtRet)} at retirement` : null, `${client.yearsOfService || 0} yrs of service`, `retiring ${fmtMonthYear(client.retireDate)}`, `High-3 ${formatCurrency(data.high3)}`].filter(Boolean).join('  ·  ')}
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${MAROON}, ${NAVY} 60%, transparent)`, marginTop: 16 }} />

      {/* personal bottom line */}
      <div className="summary-section" style={{ marginTop: 22, padding: '22px 24px', borderRadius: 12, background: `linear-gradient(150deg, ${NAVY_DARK}, ${NAVY})`, color: '#fff' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '1.25rem', fontWeight: 600, marginBottom: 12, letterSpacing: '-0.01em' }}>
          {firstName(client.name)}, here's your retirement picture.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 30px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: STEEL }}>Income in retirement</div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '2.3rem', fontWeight: 600, lineHeight: 1, ...tnum }}>{formatCurrency(data.retirementMonthly)}<span style={{ fontFamily: FONT_MONO, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}> /mo</span></div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.78)', marginTop: 3 }}>≈ {pct}% of your {data.usingGoal ? 'goal' : data.usingNet ? 'take-home' : 'current pay'} · pension + Social Security</div>
          </div>
          <div style={{ flex: 1, minWidth: 240, fontSize: '0.92rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)' }}>
            You're set to retire <strong>{fmtMonthYear(client.retireDate)}</strong> at age <strong>{data.ageAtRet != null ? Math.floor(data.ageAtRet) : '—'}</strong>.{' '}
            {covered
              ? <>Your pension and Social Security already cover your income — your TSP is a bonus.</>
              : <>Your TSP can close the remaining <strong>{formatCurrency(data.gapMonthly)}/mo</strong> gap with a guaranteed-income option for life.</>}{' '}
            And your <strong>FEHB health coverage can continue for life</strong> (5-year rule).
          </div>
        </div>
      </div>

      {/* pension + survivor */}
      <Section title="Your pension">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: FONT_SERIF, fontSize: '2rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.electedPension)}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: INK_SOFT }}>/ mo</span>
          {data.reductionFrac > 0 && (
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', color: INK_FAINT }}>· after survivor election (unreduced {formatCurrency(data.pensionUnreduced)})</span>
          )}
        </div>
        <p style={{ fontSize: '0.82rem', color: INK_SOFT, margin: '0 0 12px', lineHeight: 1.5 }}>
          {data.system === 'csrs'
            ? <>CSRS formula (1.5% / 1.75% / 2.0% tiers) on a High-3 of <strong>{formatCurrency(data.high3)}</strong> over <strong>{formatYearsMonths(data.pensionYos)}</strong>{data.csrsCapped ? ', capped at 80% of High-3' : ''}{data.sickYears > 0 ? ` (incl. ${data.sickLabel} sick leave)` : ''}.</>
            : data.system === 'special'
              ? <>Special Provisions: <strong>1.7%</strong> × first 20 yrs + <strong>1.0%</strong> × additional, on a High-3 of <strong>{formatCurrency(data.high3)}</strong> over <strong>{formatYearsMonths(data.pensionYos)}</strong>{data.sickYears > 0 ? ` (incl. ${data.sickLabel} sick leave)` : ''}.</>
              : <>Calculated as your High-3 of <strong>{formatCurrency(data.high3)}</strong> × <strong>{formatYearsMonths(data.pensionYos)}</strong> × <strong>{(data.multiplier * 100).toFixed(1)}%</strong>{data.enhanced ? ' (the age 62 + 20 kicker)' : ''}{data.sickYears > 0 ? `, incl. ${data.sickLabel} sick leave` : ''}.</>}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginTop: 4 }}>
          <tbody>
            <DocRow k="Survivor benefit elected" v={data.survLabel} />
            <DocRow k="Your monthly pension" v={`${formatCurrency(data.electedPension)} / mo`} />
            <DocRow k="Your survivor would receive" v={data.survivorReceives > 0 ? `${formatCurrency(data.survivorReceives)} / mo` : '—'} last />
          </tbody>
        </table>
        <p style={{ fontSize: '0.84rem', color: INK_SOFT, margin: '10px 0 0', lineHeight: 1.5 }}>{data.survNote}
          {data.supplementEligible && <> Because you retire before 62, you also receive a <strong style={{ color: OXBLOOD_INK }}>FERS Supplement of {formatCurrency(data.supplement)}/mo</strong> until age 62 — a bridge to Social Security.</>}
          {pension.survivor !== 'none' && <> A survivor election is also what lets your spouse keep <strong>FEHB</strong> coverage for life after you're gone.</>}
        </p>
      </Section>

      {/* social security */}
      <Section title="Social Security">
        {data.ssRows.length <= 1 ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: '1.8rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.primarySs)}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: INK_SOFT }}>/ mo · claiming at age {data.ssRows[0]?.age || '—'}</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: INK_FAINT, fontFamily: FONT_MONO, fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <th style={thCell}>Claiming age</th>
                <th style={{ ...thCell, textAlign: 'right' }}>Monthly benefit</th>
                <th style={{ ...thCell, textAlign: 'right' }}>Annual</th>
              </tr>
            </thead>
            <tbody>
              {data.ssRows.map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${rules.ink}` }}>
                  <td style={{ ...tdCell, color: INK }}>Age {r.age}{i === 0 ? ' · planned' : ''}</td>
                  <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, ...tnum }}>{formatCurrency(r.monthly)}</td>
                  <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, color: INK_SOFT, ...tnum }}>{formatCurrency(r.monthly * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ fontSize: '0.78rem', color: INK_FAINT, margin: '10px 0 0', lineHeight: 1.45 }}>
          Figures are your SSA estimate — confirm at <strong>ssa.gov</strong>. Claiming earlier gives a smaller lifelong benefit; waiting raises it.
        </p>
      </Section>

      {/* income before & after + the gap */}
      <Section title={data.usingGoal ? 'Your retirement income vs. your goal' : 'Your income — today vs. retirement'}>
        {data.stages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={metaLabel}>Your retirement income, stage by stage</div>
            {data.stages.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderTop: `1px solid ${rules.ink}` }}>
                <span><strong style={{ color: NAVY }}>{s.label}</strong> <span style={{ color: INK_SOFT, fontSize: '0.85rem' }}>· {s.sub}</span></span>
                <span style={{ fontFamily: FONT_MONO, fontWeight: 600, color: INK, ...tnum }}>{formatCurrency(s.monthly)}/mo</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Plate label={data.usingGoal ? 'Your income goal' : data.usingNet ? 'Take-home today' : 'Working today'} sub={data.usingGoal ? 'target / mo' : data.usingNet ? 'net / mo' : 'salary / mo'}><BigFig value={formatCurrency(data.target)} /></Plate>
          <Plate label="In retirement" sub="pension + Social Security" accent>
            <BigFig value={formatCurrency(data.retirementMonthly)} accent />
            <div style={{ marginTop: 12, borderTop: `1px solid ${rules.ink}`, paddingTop: 10 }}>
              <MiniRow k="Pension" v={data.electedPension} />
              <MiniRow k={`Social Security (age ${data.ssClaimAge || '—'})`} v={data.primarySs} />
            </div>
          </Plate>
        </div>
        {/* the gap */}
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 8, border: `1px solid ${covered ? rules.ink : rules.brass}`, background: covered ? SURFACE : colors.accentPale, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_FAINT }}>Monthly income gap</div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '1.6rem', fontWeight: 600, color: covered ? NAVY : MAROON, ...tnum }}>
              {covered ? 'None — fully covered' : `${formatCurrency(data.gapMonthly)} / mo`}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.84rem', color: INK_SOFT, maxWidth: 330 }}>
            {covered
              ? <>Pension + Social Security replace <strong style={{ color: NAVY }}>{pct}%</strong> of your {data.usingGoal ? 'goal' : data.usingNet ? 'take-home' : 'salary'} — your TSP is entirely a bonus.</>
              : <>Pension + Social Security replace <strong style={{ color: NAVY }}>{pct}%</strong> of your {data.usingGoal ? 'goal' : data.usingNet ? 'take-home' : 'salary'}. The gap is what your TSP can fill.</>}
          </div>
        </div>
        {data.usingNet && (
          <p style={{ fontSize: '0.78rem', color: INK_FAINT, margin: '10px 0 0', lineHeight: 1.45 }}>
            Compared to your take-home pay. Retirement income is shown before taxes — federal retirees often owe less (no FICA, no TSP contributions).
          </p>
        )}
        {data.stages.length > 0 && !covered && (
          <p style={{ fontSize: '0.78rem', color: INK_FAINT, margin: '10px 0 0', lineHeight: 1.45 }}>
            Gap shown against your long-term pension + Social Security; the FERS Supplement covers the early years shown above.
          </p>
        )}
        <p style={{ fontSize: '0.74rem', color: INK_FAINT, margin: '8px 0 0', lineHeight: 1.45 }}>
          {data.system === 'fers' ? 'Your FERS pension receives cost-of-living adjustments (COLAs) starting at age 62.' : 'Your pension receives a cost-of-living adjustment (COLA) each year.'} Your pension, part of your Social Security, and traditional TSP withdrawals are taxable income — we are not tax advisors, so confirm specifics with one.
        </p>
      </Section>

      {/* TSP — closing the gap */}
      <Section title="Your TSP — closing the gap">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 14 }}>
          <Stat label="TSP balance" value={formatCurrency(data.balance)} />
          <Stat label="Guaranteed income — for life" value={data.niaFullMonthly > 0 ? `${formatCurrency(data.niaFullMonthly)}/mo` : '—'} sub={`max from full balance${data.niaFull.rate ? ` · ${data.niaFull.rate}% rate` : ''}`} />
        </div>

        {covered ? (
          <p style={{ fontSize: '0.92rem', color: INK, margin: 0, lineHeight: 1.6 }}>
            You don't need your TSP to cover income — your guaranteed sources already do. Left invested, or converted to a guaranteed income of up to <strong style={{ color: NAVY }}>{formatCurrency(data.niaFullMonthly)}/mo for life</strong>, it's entirely additional.
          </p>
        ) : data.enough ? (
          <p style={{ fontSize: '0.92rem', color: INK, margin: 0, lineHeight: 1.6 }}>
            To fill your <strong>{formatCurrency(data.gapMonthly)}/mo</strong> gap with income guaranteed <strong>for life</strong>, about{' '}
            <strong style={{ color: NAVY }}>{formatCurrency(data.amountUsed)}</strong> of your {formatCurrency(data.balance)} TSP would be moved to a guaranteed income —
            leaving <strong>{formatCurrency(data.leftover)}</strong> invested.
          </p>
        ) : (
          <p style={{ fontSize: '0.92rem', color: INK, margin: 0, lineHeight: 1.6 }}>
            Your full TSP guarantees up to <strong style={{ color: NAVY }}>{formatCurrency(data.niaFullMonthly)}/mo for life</strong> — the most available. That covers{' '}
            {formatCurrency(data.niaFullMonthly)} of your {formatCurrency(data.gapMonthly)} gap, leaving <strong style={{ color: MAROON }}>{formatCurrency(data.remainingGap)}/mo</strong> to plan for another way.
          </p>
        )}

        {/* self-managed longevity comparison */}
        {data.amountUsed > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 8 }}>
              If you self-managed that {formatCurrency(data.amountUsed)} instead — {data.growthPct}% growth, same {formatCurrency(data.incomeProvided * 12)}/yr withdrawal
            </div>
            <div style={{ overflow: 'hidden' }}>
              <AreaChart width={648} height={180} data={data.proj.data} margin={{ top: 6, right: 12, bottom: 4, left: 6 }}>
                <defs>
                  <linearGradient id="balFillDoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(27,36,53,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: INK_SOFT, fontFamily: FONT_SANS }} />
                <YAxis tick={{ fontSize: 11, fill: INK_SOFT, fontFamily: FONT_SANS }} tickFormatter={(v) => (v >= 1000000 ? `$${(v / 1000000).toFixed(1)}m` : `$${Math.round(v / 1000)}k`)} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Balance']} labelFormatter={(l) => `Age ${l}`} contentStyle={{ fontFamily: FONT_SANS, fontSize: '0.82rem', border: `1px solid ${MAROON}`, borderRadius: 8 }} />
                <Area type="monotone" dataKey="balance" stroke={NAVY} strokeWidth={2.5} fill="url(#balFillDoc)" dot={false} />
                {data.proj.runOutAge != null && <ReferenceLine x={data.proj.runOutAge} stroke={MAROON} strokeDasharray="4 4" label={{ value: `runs out · ${data.proj.runOutAge}`, fontSize: 10, fill: MAROON, position: 'top' }} />}
              </AreaChart>
            </div>
            <p style={{ fontSize: '0.86rem', color: INK_SOFT, margin: '8px 0 0', lineHeight: 1.5 }}>
              Drawing it yourself, the money {data.proj.runOutAge ? <>runs out around <strong style={{ color: MAROON }}>age {data.proj.runOutAge}</strong>{data.lastsYears != null ? <> (~{data.lastsYears} years)</> : null}</> : <>is not exhausted by age 95</>}. The guaranteed option pays the same amount <strong style={{ color: NAVY }}>for life</strong>, however long that is.
            </p>
          </div>
        )}
      </Section>

      {/* health coverage — FEHB + Medicare */}
      <Section title="Your health coverage in retirement">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: SURFACE, border: `1px solid ${rules.ink}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '1rem', fontWeight: 600, color: NAVY, marginBottom: 4 }}>FEHB — kept for life</div>
            <p style={{ fontSize: '0.85rem', color: INK_SOFT, margin: 0, lineHeight: 1.5 }}>Enrolled the <strong>5 years</strong> before you retire? Your federal health plan continues for life at the <strong>same premium</strong> active employees pay — one of the most valuable benefits you carry into retirement.</p>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${rules.ink}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '1rem', fontWeight: 600, color: NAVY, marginBottom: 4 }}>Medicare at 65</div>
            <p style={{ fontSize: '0.85rem', color: INK_SOFT, margin: 0, lineHeight: 1.5 }}>Take <strong>Part A</strong> (free) at 65. <strong>Part B</strong> is optional and coordinates with FEHB — weigh its premium (and any IRMAA surcharge at higher incomes) against the added coverage.</p>
          </div>
        </div>
      </Section>

      {/* next steps */}
      <Section title="Your next steps">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            'Confirm online access to your TSP.gov and SSA.gov accounts',
            'Request an official annuity estimate and your latest SF-50 from HR',
            'Lock in your survivor election — it is difficult to change later',
            'Confirm FEHB will carry into retirement (the 5-year rule)',
            'Review FEGLI before the post-65 premium changes',
            `File ${data.system === 'csrs' ? 'SF-2801' : 'SF-3107'} (retirement application) and update your beneficiary forms ahead of ${fmtMonthYear(client.retireDate)}`,
          ].map((t) => (
            <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: `1px solid ${rules.ink}`, fontSize: '0.88rem', color: INK }}>
              <span style={{ color: MAROON, flexShrink: 0, marginTop: 5, display: 'flex' }}><Diamond size={7} /></span>
              {t}
            </li>
          ))}
        </ul>
        <p style={{ fontSize: '0.72rem', color: INK_FAINT, margin: '10px 0 0', fontFamily: FONT_MONO, letterSpacing: '0.04em' }}>
          Official resources · tsp.gov · ssa.gov · opm.gov · medicare.gov
        </p>
      </Section>

      {/* footer / disclaimer */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${rules.ink}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: MAROON }}><SealRing size={26} w={1.3} /></span>
          <div style={{ fontFamily: FONT_SERIF, fontSize: '0.92rem', fontWeight: 600, color: NAVY }}>Federal Market Associates</div>
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: '0.6rem', lineHeight: 1.5, color: INK_FAINT, margin: 0, maxWidth: 440, textAlign: 'right' }}>
          Estimates only — based on the figures provided and current federal rules. Not personalized financial, tax, or legal advice. Guaranteed-income figures are illustrative and depend on product availability at time of purchase. {brand.name} is independent and not affiliated with OPM or any federal agency.
        </p>
      </div>
    </div>
  )
}

/* ============================ FEGLI — page 2 ============================ */
function FegliPage({ client, data }) {
  const f = data.fegliInput || {}
  const cardStyle = { width: '100%', maxWidth: 760, background: WHITE, border: `1px solid ${rules.ink}`, boxShadow: elevation.artifact, padding: '44px 48px 40px', breakBefore: 'page' }
  const header = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <img src="/fma-logo-mark.png" alt={brand.name} style={{ height: 44, width: 'auto', display: 'block' }} />
        <div style={{ textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.68rem', letterSpacing: '0.08em', color: INK_FAINT, textTransform: 'uppercase' }}>
          Retirement Summary · page 2<br />{client.name || 'Client'}
        </div>
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: MAROON }}><SealStar size={15} /></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: OXBLOOD_INK }}>FEGLI life insurance</span>
      </div>
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: '1.8rem', fontWeight: 600, color: NAVY, margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
        Your FEGLI in retirement
      </h1>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${MAROON}, ${NAVY} 60%, transparent)`, marginTop: 16 }} />
    </>
  )

  if (!data.fegliKeep) {
    return (
      <div data-print-doc style={cardStyle}>
        {header}
        <Section title="How it works">
          <p style={{ fontSize: '0.95rem', color: INK, lineHeight: 1.6, margin: 0 }}>
            You've elected <strong>not to carry FEGLI into retirement</strong>, so there is no FEGLI premium in retirement and coverage ends at separation. To keep any FEGLI in retirement you must have been enrolled in it for the 5 years immediately before you retire.
          </p>
        </Section>
      </div>
    )
  }

  const opts = []
  if (f.basic) opts.push(`Basic ${{ '75': '· 75% reduction', '50': '· 50% reduction', none: '· No Reduction' }[f.basicReduction] || ''}`)
  if (f.optionA) opts.push('Option A ($10,000)')
  if (Number(f.optionBMult) > 0) opts.push(`Option B ×${f.optionBMult} ${f.optionBReduction === 'none' ? '· No Reduction' : '· Full Reduction'}`)
  if (Number(f.optionCMult) > 0) opts.push(`Option C ×${f.optionCMult} ${f.optionCReduction === 'none' ? '· No Reduction' : '· Full Reduction'}`)
  const cell$ = (v) => (v >= 0.005 ? '$' + v.toFixed(2) : '$0')
  const costCell = (v) => ({ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, color: v > 0 ? INK : INK_FAINT, ...tnum })

  return (
    <div data-print-doc style={cardStyle}>
      {header}
      <Section title="How it works in retirement">
        <p style={{ fontSize: '0.92rem', color: INK, lineHeight: 1.6, margin: 0 }}>
          Your FEGLI can continue into retirement. At <strong>age 65</strong> your reduction elections take effect. A <strong>75% or 50% Basic reduction</strong> drops the Basic premium to <strong>$0</strong> — you keep 25% or 50% of the coverage for life at no cost. <strong>"No Reduction"</strong> keeps full coverage but the premium continues and climbs with age. Option A reduces to a small paid-up amount at no cost; <strong>Options B and C</strong> either reduce to $0 at 65 (Full Reduction) or continue at rising age-banded rates (No Reduction).
        </p>
      </Section>

      <Section title="Your coverage — now vs. in retirement">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: INK_FAINT, fontFamily: FONT_MONO, fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <th style={thCell}>Coverage</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Now (working)</th>
              <th style={{ ...thCell, textAlign: 'right' }}>In retirement (65+)</th>
            </tr>
          </thead>
          <tbody>
            {data.fegliCoverageRows.map((r) => (
              <tr key={r.name} style={{ borderTop: `1px solid ${rules.ink}` }}>
                <td style={{ ...tdCell, color: INK }}>{r.name}</td>
                <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, ...tnum }}>{formatCurrency(r.now)}</td>
                <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: r.ret < r.now ? MAROON : INK, ...tnum }}>{r.ret > 0 ? formatCurrency(r.ret) : 'ends'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.76rem', color: INK_FAINT, margin: '8px 0 0', lineHeight: 1.45 }}>
          Reductions phase in over the months after 65. Figures show the end-state coverage you keep for life.
        </p>
      </Section>

      <Section title="Your monthly cost by age">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ color: INK_FAINT, fontFamily: FONT_MONO, fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <th style={{ ...thCell, textAlign: 'left' }}>Age</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Basic</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Option A</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Option B</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Option C</th>
              <th style={{ ...thCell, textAlign: 'right' }}>Total / mo</th>
            </tr>
          </thead>
          <tbody>
            {data.fegliTable.map((r) => (
              <tr key={r.interval} style={{ borderTop: `1px solid ${rules.ink}` }}>
                <td style={{ ...tdCell, color: INK, fontWeight: 600 }}>{r.interval}</td>
                <td style={costCell(r.basic)}>{cell$(r.basic)}</td>
                <td style={costCell(r.optionA)}>{cell$(r.optionA)}</td>
                <td style={costCell(r.optionB)}>{cell$(r.optionB)}</td>
                <td style={costCell(r.optionC)}>{cell$(r.optionC)}</td>
                <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 700, color: NAVY, ...tnum }}>{cell$(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 8, border: `1px solid ${rules.brass}`, background: colors.accentPale, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT }}>Estimated total FEGLI cost in retirement · to age 90</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: '1.5rem', fontWeight: 600, color: NAVY, ...tnum }}>{formatCurrency(data.fegliTotal)}</div>
        </div>
        <p style={{ fontSize: '0.74rem', color: INK_FAINT, margin: '10px 0 0', lineHeight: 1.45 }}>
          Costs step on 5-year OPM rate brackets; $0 means not elected or reduced to no cost. Your elections: {opts.length ? opts.join(' · ') : 'none'}.
        </p>
      </Section>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${rules.ink}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: MAROON }}><SealRing size={26} w={1.3} /></span>
          <div style={{ fontFamily: FONT_SERIF, fontSize: '0.92rem', fontWeight: 600, color: NAVY }}>Federal Market Associates</div>
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: '0.6rem', lineHeight: 1.5, color: INK_FAINT, margin: 0, maxWidth: 440, textAlign: 'right' }}>
          FEGLI estimates use current OPM rates. Premiums and reductions depend on your elections at retirement. Not insurance or financial advice.
        </p>
      </div>
    </div>
  )
}

// The close — sits after the FEGLI page so it's the final thing the client reads.
function ClosingCard({ client, data }) {
  return (
    <div data-print-doc className="summary-section" style={{ width: '100%', maxWidth: 760, background: `linear-gradient(150deg, ${NAVY_DARK}, ${NAVY})`, color: '#fff', borderRadius: 12, padding: '22px 26px', boxShadow: elevation.artifact, display: 'flex', alignItems: 'center', gap: 18, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <span style={{ color: STEEL, flexShrink: 0 }}><SealRing size={36} w={1.4} /></span>
      <div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, marginBottom: 4 }}>Congratulations, {firstName(client.name)} — you're ready to plan with clarity.</div>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
          You have a clear, written plan — pension, Social Security, your income gap, TSP, health coverage, and FEGLI, all in one place. That's further than most federal employees ever get.{data.annualLeavePayout > 0 ? <> And don't forget: your unused annual leave pays out as a <strong>one-time {formatCurrency(data.annualLeavePayout)}</strong> lump sum on your final paycheck (taxable, paid once).</> : null}
        </p>
      </div>
    </div>
  )
}

/* ============================ small pieces ============================ */
function Check({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: INK, cursor: 'pointer', fontWeight: 600 }}>
      <input type="checkbox" checked={checked} onChange={onChange} /> {label}
    </label>
  )
}
function Seg({ label, value, onChange, options }) {
  return (
    <div>
      <div style={{ ...labelText, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(([key, lbl]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 7, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '0.76rem', fontWeight: 600,
              border: `1px solid ${value === key ? MAROON : rules.inkStrong}`,
              background: value === key ? colors.accentPale : WHITE,
              color: value === key ? OXBLOOD_INK : INK_SOFT,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}
function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || 'there' }

function Section({ title, children }) {
  return (
    <section className="summary-section" style={{ marginTop: 28 }}>
      <h2 style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: OXBLOOD_INK, margin: '0 0 14px' }}>{title}</h2>
      {children}
    </section>
  )
}
function Fact({ k, v }) {
  return (
    <div>
      <div style={{ fontFamily: FONT_MONO, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 2 }}>{k}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: INK, ...tnum }}>{v}</div>
    </div>
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
function BigFig({ value, accent }) {
  return <div style={{ fontFamily: FONT_SERIF, fontSize: '2.1rem', fontWeight: 600, color: accent ? NAVY : INK, letterSpacing: '-0.02em', ...tnum }}>{value}</div>
}
function MiniRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0', fontSize: '0.82rem' }}>
      <span style={{ color: INK_SOFT }}>{k}</span>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 600, color: INK, ...tnum }}>{formatCurrency(v)}</span>
    </div>
  )
}
function DocRow({ k, v, last }) {
  return (
    <tr style={{ borderTop: `1px solid ${rules.ink}`, borderBottom: last ? `1px solid ${rules.ink}` : 'none' }}>
      <td style={{ ...tdCell, color: INK_SOFT }}>{k}</td>
      <td style={{ ...tdCell, textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: INK, ...tnum }}>{v}</td>
    </tr>
  )
}
function Stat({ label, value, sub }) {
  return (
    <div>
      <div style={metaLabel}>{label}</div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '1.3rem', fontWeight: 600, color: NAVY, ...tnum }}>{value}</div>
      {sub && <div style={{ fontFamily: FONT_MONO, fontSize: '0.62rem', color: INK_FAINT, marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function FormGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}
function Field({ label, value, onChange, type = 'number', prefix, placeholder }) {
  return (
    <label style={labelText}>{label}
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: INK_FAINT, fontSize: '0.9rem', fontFamily: FONT_MONO }}>{prefix}</span>}
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...inputBox, paddingLeft: prefix ? 26 : 14, marginTop: label ? 4 : 0 }} />
      </div>
    </label>
  )
}

const inputBox = { display: 'block', width: '100%', padding: '9px 12px', fontSize: '0.9rem', border: `1px solid ${rules.inkStrong}`, borderRadius: 8, fontFamily: FONT_SANS, color: INK, background: WHITE, boxSizing: 'border-box' }
const labelText = { fontSize: '0.78rem', fontWeight: 600, color: INK_SOFT, display: 'block' }
const readout = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 12px', border: `1px solid ${rules.ink}`, borderRadius: 8, background: SURFACE, fontSize: '0.9rem' }
const hintText = { fontSize: '0.72rem', color: INK_FAINT, margin: 0, lineHeight: 1.45 }
const metaLabel = { fontFamily: FONT_MONO, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 2 }
const thCell = { padding: '0 0 8px', fontWeight: 600 }
const tdCell = { padding: '9px 0', fontSize: '0.88rem' }
function toolbarBtn(bg, ghost) {
  return { padding: '9px 16px', background: bg, color: '#fff', border: ghost ? '1px solid rgba(255,255,255,0.4)' : 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS }
}
