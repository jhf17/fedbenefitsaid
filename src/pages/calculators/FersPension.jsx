import Seo from '../../components/Seo'
import PensionScenarioCalculator from '../../components/PensionScenarioCalculator'
import { fersPension } from '../../lib/pensionCalc'
import { colors, fonts } from '../../constants/theme'
import { DATA_LAST_UPDATED } from '../../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

export default function FersPension() {
  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="FERS Pension Calculator — customizable scenarios"
        description="Estimate your FERS basic annuity for any retirement date. Build unlimited side-by-side scenarios. Includes the 1.1% kicker and MRA+10 reduction. For Social Security and FERS Supplement dollar amounts, use the Full Income Picture calculator."
        path="/calculators/fers"
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
            background: 'radial-gradient(circle at 80% 0%, rgba(123,28,46,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
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
            FERS Pension · Updated {DATA_LAST_UPDATED}
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 18,
            }}
          >
            FERS Pension Calculator <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              Customizable, side-by-side.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            Pick any retirement month. Add as many scenarios as you want. We compute eligibility, the multiplier (1.0% vs 1.1%), and MRA+10 reductions — sourced directly from OPM rules.
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', maxWidth: 660, marginTop: 14 }}>
            Looking for the Social Security and FERS Supplement <em>dollar amounts</em>? Those live in the <a href="/calculators/income-picture" style={{ color: colors.brassLight, textDecoration: 'underline' }}>Full Income Picture</a> calculator, where you can layer all three legs (pension + SS + TSP) against your target retirement income.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 96px' }}>
        <PensionScenarioCalculator
          system="FERS"
          calc={fersPension}
          formula="High-3 × Years of Service × Multiplier (1.0% standard, 1.1% if retiring at age 62+ with 20+ years)"
          eligibility={[
            'MRA + 30 years — Immediate Unreduced annuity (FERS Supplement until 62)',
            'Age 60 + 20 years — Immediate Unreduced (FERS Supplement until 62)',
            'Age 62 + 5 years — Immediate Unreduced (no Supplement; you are SS-eligible)',
            'MRA + 10 years — Immediate Reduced: 5%/year under age 62. No Supplement. Can be avoided by postponing the annuity start.',
            '5+ years, any age below MRA — Deferred (annuity at age 62, no Supplement)',
            'MRA = 55, 56, or 57 depending on birth year (table in the OPM CSRS-FERS Handbook).',
          ]}
          notes={[
            'Sick leave is added to creditable service (2,087 hours = 1 year). It increases your annuity but does not count toward eligibility thresholds or the FERS Supplement formula.',
            'MRA+10 retirees who postpone the annuity start can preserve FEHB and avoid the 5%/year penalty.',
            'The 1.1% multiplier kicks in at age 62 with 20+ years. Working one additional year to hit it can permanently raise your annuity by ~10%.',
            'COLA on the FERS pension generally starts at age 62 (Diet COLA: CPI minus 1% if CPI > 3%; CPI if CPI < 2%; 2% if CPI 2–3%).',
            'This calculator does not account for survivor election reductions, military service deposits, or part-time service prorations. For those, get an official estimate from your HR Specialist or run it past us on a call.',
          ]}
        />
      </section>
    </main>
  )
}
