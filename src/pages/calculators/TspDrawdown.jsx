import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/fma/Button'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import Seo from '../../components/Seo'
import { colors, fonts } from '../../constants/theme'
import { formatCurrency } from '../../lib/pensionCalc'
import { DATA_LAST_UPDATED } from '../../config/site'
import { monthlyGuaranteedIncome } from '../../data/guaranteedIncomeCalc'
import { projectDrawdown } from '../../lib/tspProjection'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const inputBox = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  fontSize: '0.95rem',
  border: `1px solid ${colors.borderLight || '#cbd5e1'}`,
  borderRadius: 10,
  fontFamily: FONT_SANS,
  color: colors.charcoal,
  background: '#ffffff',
  marginTop: 6,
  appearance: 'auto',
}
const labelText = { fontSize: '0.84rem', fontWeight: 600, color: colors.pine, letterSpacing: '0.01em', display: 'block' }
const helpText = { fontSize: '0.78rem', color: colors.slate500, marginTop: 6, lineHeight: 1.45 }

export default function TspDrawdown() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [balance, setBalance] = useState(500000)
  const [age, setAge] = useState(60)
  const [incomeStartAge, setIncomeStartAge] = useState(60)
  const [growthPct, setGrowthPct] = useState(4.5)
  const [projectTo, setProjectTo] = useState(95)

  // Annual withdrawal defaults to the guaranteed lifetime income this balance
  // would produce ("auto"). Once the user edits it, we stop auto-syncing.
  const [withdrawal, setWithdrawal] = useState(0)
  const [auto, setAuto] = useState(true)

  // Guaranteed lifetime income (same engine the Full Income Picture uses).
  const guaranteed = useMemo(
    () => monthlyGuaranteedIncome(Number(balance) || 0, Number(age) || 0, Number(incomeStartAge) || Number(age) || 0),
    [balance, age, incomeStartAge]
  )
  const guaranteedAnnual = Math.round(guaranteed.annual)

  useEffect(() => {
    if (auto) setWithdrawal(guaranteedAnnual)
  }, [guaranteedAnnual, auto])

  const effWithdrawal = Number(withdrawal) || 0

  const { data, runOutAge } = useMemo(
    () =>
      projectDrawdown({
        balance: Number(balance) || 0,
        startAge: Number(age) || 0,
        incomeStartAge: Number(incomeStartAge) || Number(age) || 0,
        annualWithdrawal: effWithdrawal,
        growth: (Number(growthPct) || 0) / 100,
        endAge: Math.max(Number(age) || 0, Number(projectTo) || 95),
      }),
    [balance, age, incomeStartAge, effWithdrawal, growthPct, projectTo]
  )

  const endAge = Math.max(Number(age) || 0, Number(projectTo) || 95)
  const endingBalance = data.length ? data[data.length - 1].balance : 0
  const neverRunsOut = runOutAge == null

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="TSP Drawdown Calculator — will your balance last?"
        description="See what happens to your TSP balance if you withdraw a set amount each year at an assumed growth rate — and compare self-managing that income to a guaranteed lifetime income that never runs out."
        path="/calculators/tsp-drawdown"
      />

      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: '72px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 0%, rgba(123,28,46,0.18) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 14 }}>
            TSP Drawdown · Updated {DATA_LAST_UPDATED}
          </div>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 144, "SOFT" 50', marginBottom: 18 }}>
            Will your TSP last? <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              Self-managed vs. guaranteed for life.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            Draw a set amount from your TSP each year and watch the balance over time at a growth rate you choose. By
            default we withdraw the same income a guaranteed lifetime-income option would pay — so you can see whether
            self-managing that same paycheck would outlast you, or run dry.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
        {/* INPUTS */}
        <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`, borderRadius: 16, padding: isMobile ? 24 : 32, boxShadow: '0 1px 3px rgba(15,29,61,0.04)' }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: '1.4rem', fontWeight: 600, color: colors.pine, marginBottom: 6, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
            Your TSP
          </h2>
          <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 22 }}>Everything runs in your browser. Nothing is stored or sent.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={labelText}>
              TSP balance at retirement
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} step="10000" min="0" style={inputBox} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={labelText}>
                Your age now
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} step="1" min="40" max="80" style={inputBox} />
              </label>
              <label style={labelText}>
                Age income starts
                <input type="number" value={incomeStartAge} onChange={(e) => setIncomeStartAge(e.target.value)} step="1" min={Number(age) || 40} max="90" style={inputBox} />
                <span style={helpText}>Default is now — start drawing immediately.</span>
              </label>
            </div>

            <label style={labelText}>
              Annual withdrawal
              <input
                type="number"
                value={withdrawal}
                onChange={(e) => { setAuto(false); setWithdrawal(e.target.value) }}
                step="1000"
                min="0"
                style={inputBox}
              />
              <span style={helpText}>
                {auto ? (
                  <>Defaulted to the <strong>guaranteed lifetime income</strong> this balance would produce ({formatCurrency(guaranteedAnnual)}/yr · {formatCurrency(Math.round(guaranteed.monthly))}/mo).</>
                ) : (
                  <>Custom amount.{' '}
                    <button type="button" onClick={() => setAuto(true)} style={{ background: 'none', border: 'none', padding: 0, color: colors.brassDeep, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '0.78rem' }}>
                      Reset to guaranteed amount ({formatCurrency(guaranteedAnnual)}/yr)
                    </button>
                  </>
                )}
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={labelText}>
                Assumed growth rate
                <div style={{ position: 'relative' }}>
                  <input type="number" value={growthPct} onChange={(e) => setGrowthPct(e.target.value)} step="0.25" min="0" max="12" style={inputBox} />
                </div>
                <span style={helpText}>Annual return on the balance that stays invested. Default 4.5%.</span>
              </label>
              <label style={labelText}>
                Project through age
                <input type="number" value={projectTo} onChange={(e) => setProjectTo(e.target.value)} step="1" min={Number(incomeStartAge) || 62} max="100" style={inputBox} />
              </label>
            </div>
          </div>
        </div>

        {/* OUTPUT: the comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* self-managed */}
          <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`, borderRadius: 16, padding: 26 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.slate500, marginBottom: 8 }}>
              Self-managed · keep it in the TSP
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '1.9rem', fontWeight: 600, color: colors.pine, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {formatCurrency(effWithdrawal)}<span style={{ fontSize: '0.9rem', color: colors.slate500, fontFamily: FONT_SANS, fontWeight: 500 }}>/yr</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: colors.slate700, marginTop: 8, lineHeight: 1.5 }}>
              {neverRunsOut ? (
                <>At {growthPct}% growth, the balance <strong style={{ color: colors.pine }}>never runs out</strong> — it ends around {formatCurrency(endingBalance)} at age {endAge}. You keep control and anything left goes to your heirs, but the income isn't guaranteed and market years can change this.</>
              ) : (
                <>At {growthPct}% growth, the balance <strong style={{ color: colors.brassDeep }}>runs out around age {runOutAge}</strong>. After that, this income stops. You keep control and market upside, but you carry the risk of outliving it.</>
              )}
            </div>
          </div>

          {/* guaranteed */}
          <div style={{ background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 100%)`, color: '#fff', borderRadius: 16, padding: 26, boxShadow: '0 8px 24px rgba(15,29,61,0.12)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 8 }}>
              Guaranteed · lifetime income
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: '1.9rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {formatCurrency(guaranteedAnnual)}<span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontFamily: FONT_SANS, fontWeight: 500 }}>/yr</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.82)', marginTop: 8, lineHeight: 1.5 }}>
              The same {formatCurrency(Math.round(guaranteed.monthly))}/mo — <strong style={{ color: '#fff' }}>paid for life, no matter how markets or longevity play out</strong>. The trade-off: you give up direct control of the balance.
            </div>
          </div>
        </div>
      </section>

      {/* CHART */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 32px' }}>
        <div style={{ background: '#ffffff', border: `1px solid rgba(26,45,92,0.08)`, borderRadius: 16, padding: isMobile ? 20 : 32, boxShadow: '0 1px 3px rgba(15,29,61,0.04)' }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.4rem', fontWeight: 600, color: colors.pine, marginBottom: 4, letterSpacing: '-0.01em' }}>
            Your TSP balance, self-managed
          </h3>
          <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 18, maxWidth: 760 }}>
            Withdrawing {formatCurrency(effWithdrawal)}/yr from age {Math.max(Number(age) || 0, Number(incomeStartAge) || 0)} at {growthPct}% growth.
            {!neverRunsOut && <> The marked line is where the balance is exhausted — a guaranteed lifetime income would keep paying past it.</>}
          </p>
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.pine} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={colors.pine} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,45,92,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="age" tick={{ fontSize: 12, fill: colors.slate700, fontFamily: FONT_SANS }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 12, fill: colors.slate500 }} />
                <YAxis tick={{ fontSize: 12, fill: colors.slate700, fontFamily: FONT_SANS }} tickFormatter={(v) => (v >= 1000000 ? `$${(v / 1000000).toFixed(1)}m` : `$${Math.round(v / 1000)}k`)} />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), 'Balance']}
                  labelFormatter={(l) => `Age ${l}`}
                  contentStyle={{ background: '#ffffff', border: `1px solid ${colors.brass}`, borderRadius: 10, fontFamily: FONT_SANS, fontSize: '0.88rem' }}
                />
                <Area type="monotone" dataKey="balance" stroke={colors.pine} strokeWidth={3} fill="url(#balFill)" dot={false} name="TSP balance" />
                {runOutAge != null && (
                  <ReferenceLine x={runOutAge} stroke={colors.brassDeep} strokeDasharray="4 4" label={{ value: `Runs out · age ${runOutAge}`, fontSize: 11, fill: colors.brassDeep, position: 'top' }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Notes + CTA */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ background: colors.bone, borderRadius: 16, padding: isMobile ? 24 : 32, border: `1px solid rgba(26,45,92,0.08)`, marginBottom: 28 }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, color: colors.pine, marginBottom: 12, letterSpacing: '-0.01em' }}>
            How this calculator works
          </h3>
          <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.7 }}>
            <li>Each year once income starts, the withdrawal is taken first and the remaining balance grows at the rate you set. Growth is a flat assumption — real returns vary year to year.</li>
            <li>The <strong>guaranteed lifetime income</strong> figure is the same one used in the <Link to="/calculators/income-picture" style={{ color: colors.brassDeep, fontWeight: 600 }}>Full Income Picture</Link> calculator — what a protected lifetime-income option would pay from this balance, for life.</li>
            <li>Self-managing keeps your money under your control with market upside and a balance for heirs, but the income can run out. Guaranteed income never runs out, but you give up direct access to the balance. Neither is "right" — it depends on your situation.</li>
            <li>All figures are estimates, pre-tax, and not a recommendation. For numbers specific to you, talk to us.</li>
          </ul>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 70%, ${colors.pineLight} 100%)`, color: '#ffffff', borderRadius: 16, padding: isMobile ? 28 : 40, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 8 }}>
              Your TSP, your call
            </div>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: isMobile ? '1.4rem' : '1.6rem', fontWeight: 600, marginBottom: 10, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              Want to see this run against your real numbers?
            </h3>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
              Book a free meeting — we'll walk through your full income picture, show what each TSP decision actually costs or earns, and leave you with a written summary.
            </p>
          </div>
          <Button to="/consultation" variant="primary" arrow style={{ flexShrink: 0 }}>Book a free meeting</Button>
        </div>
      </section>
    </main>
  )
}
