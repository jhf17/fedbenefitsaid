import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { DATA_LAST_UPDATED } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const CALCULATORS = [
  {
    title: 'FERS Pension',
    blurb:
      'For employees hired into the standard FERS system. Customizable retirement-date scenarios, side-by-side comparison, and the 1.0%/1.1% multiplier.',
    href: '/calculators/fers',
    eyebrow: 'Standard FERS',
  },
  {
    title: 'CSRS Pension',
    blurb:
      'The tiered formula (1.5% / 1.75% / 2.0%), 80% cap, and CSRS-specific eligibility (55+30, 60+20, 62+5). No FERS Supplement, no 1.1% kicker.',
    href: '/calculators/csrs',
    eyebrow: 'CSRS',
  },
  {
    title: 'Special Provisions Pension',
    blurb:
      'For LEO, firefighters, ATC, Capitol Police, Secret Service Uniformed Division, and nuclear materials couriers. The 1.7%/1.0% formula with the 50+20 / any-age+25 paths.',
    href: '/calculators/special',
    eyebrow: 'LEO · FF · ATC · CP · SS-UD · NMC',
  },
  {
    title: 'High-3 Salary',
    blurb:
      'Average your three highest consecutive years of base pay — the figure every pension formula starts from. Enter your salary history; we find the optimal 36-month window.',
    href: '/calculators/high-3',
    eyebrow: 'Pension building block',
  },
  {
    title: 'FEGLI Cost Over Time',
    blurb:
      'See exactly how your federal life-insurance premiums change after age 50, 60, 65 — through age 80. Most federal employees are surprised by what happens at 65.',
    href: '/calculators/fegli',
    eyebrow: 'Life insurance',
  },
  {
    title: 'Full Income Picture',
    blurb:
      'Combine your pension, FERS Supplement, Social Security, and TSP withdrawals — net of federal/state tax and FEHB/Medicare — and compare to your current take-home. Honest, not optimistic.',
    href: '/calculators/income-picture',
    eyebrow: 'Whole-picture income',
  },
  {
    title: 'TSP Drawdown',
    blurb:
      'Draw a set amount from your TSP and watch the balance over time at a growth rate you choose. See whether self-managing that income outlasts you — or runs dry — versus a guaranteed lifetime income.',
    href: '/calculators/tsp-drawdown',
    eyebrow: 'TSP · Income',
  },
  {
    title: '"What if..." Coverage',
    blurb:
      'What your federal benefits actually pay if you die or become disabled. FEGLI, FERS Survivor, Social Security, and FERS Disability modeled honestly.',
    href: '/calculators/what-if',
    eyebrow: 'Death · Disability',
  },
]

export default function Tools() {
  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Calculators — federal retirement, by the numbers"
        description="Free calculators for federal employees: FERS pension, CSRS pension, Special Provisions pension, and FEGLI cost-over-time. Updated for the current benefit year."
        path="/calculators"
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
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 0%, rgba(176,141,90,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 920, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassLight,
              marginBottom: 14,
            }}
          >
            Calculators · Updated {DATA_LAST_UPDATED} · OPM, IRS, SSA
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 18,
            }}
          >
            Pick the right tool for your <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              federal retirement system.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 640 }}>
            FERS, CSRS, and Special Provisions follow different rules. Mixing them in one calculator buries the
            distinctions that actually matter at retirement. Each tool below is built for its system specifically.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {CALCULATORS.map((c) => (
            <Link
              key={c.title}
              to={c.href}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: '#ffffff',
                borderRadius: 18,
                padding: 32,
                border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                boxShadow: '0 1px 3px rgba(20,42,29,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.brass
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(20,42,29,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(31,61,44,0.08)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(20,42,29,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: colors.brassDeep,
                  marginBottom: 12,
                }}
              >
                {c.eyebrow}
              </div>
              <h2
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: colors.pine,
                  marginBottom: 12,
                  letterSpacing: '-0.01em',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                {c.title}
              </h2>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 20, flex: 1 }}>
                {c.blurb}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: colors.brassDeep,
                }}
              >
                Open calculator <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: 36,
            padding: '20px 24px',
            background: colors.brassPale,
            border: `1px solid ${colors.brass}`,
            borderRadius: 12,
            fontSize: '0.92rem',
            color: colors.slate700,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: colors.brassDeep, fontFamily: FONT_SERIF, letterSpacing: '-0.005em' }}>
            Estimates only.
          </strong>{' '}
          All calculators provide estimates based on current federal rules and publicly-available figures. Use them to
          orient — not as the sole basis for a retirement election. For an official figure, request a retirement
          estimate from your HR Specialist (FERS / CSRS / Special) or talk to us on a call.
        </div>
      </section>
    </main>
  )
}
