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
        description="Estimate your FERS basic annuity for any retirement date. Build unlimited side-by-side scenarios. Includes the 1.1% kicker, MRA+10 reduction, and the FERS Supplement."
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
            background: 'radial-gradient(circle at 80% 0%, rgba(176,141,90,0.18) 0%, transparent 55%)',
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
            Pick any retirement month. Add as many scenarios as you want. We compute eligibility, multiplier (1.0% vs
            1.1%), MRA+10 reductions, and the FERS Supplement — sourced directly from OPM rules.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 96px' }}>
        <PensionScenarioCalculator
          system="FERS"
          calc={fersPension}
          extraInputs={[
            {
              name: 'ssEstimateAt62',
              label: 'Estimated monthly Social Security benefit at age 62 (optional)',
              type: 'number',
              defaultValue: 0,
              step: '50',
              help:
                'Pull this from your SSA.gov "my Social Security" statement, the row labeled "if you start at age 62." Used to estimate the FERS Supplement, not the actual SS benefit.',
            },
          ]}
          formula="High-3 × Years of Service × Multiplier (1.0% standard, 1.1% if retiring at age 62+ with 20+ years)"
          eligibility={[
            'MRA + 30 years — Immediate Unreduced annuity (FERS Supplement until 62)',
            'Age 60 + 20 years — Immediate Unreduced (FERS Supplement until 62)',
            'Age 62 + 5 years — Immediate Unreduced (no Supplement; you are SS-eligible)',
            'MRA + 10 years — Immediate Reduced: 5%/year under 62 (or under 60 if 20+ years). No Supplement.',
            '5+ years, any age below MRA — Deferred (annuity at age 62, no Supplement)',
            'MRA = 55, 56, or 57 depending on birth year (table in the OPM CSRS-FERS Handbook).',
          ]}
          notes={[
            'Sick leave is added to creditable service (2,087 hours = 1 year). It does not count toward the FERS Supplement formula.',
            'MRA+10 retirees who postpone the annuity start can preserve FEHB and reduce the 5%/year penalty.',
            'The 1.1% multiplier kicks in at age 62 with 20+ years. Working one additional year to hit it can permanently raise your annuity by ~10%.',
            'COLA on the FERS pension generally starts at age 62 (Diet COLA: CPI minus 1% if CPI > 3%; CPI if CPI < 2%; 2% if CPI 2–3%).',
            'This calculator does not account for survivor election reductions, military service deposits, or part-time service prorations. For those, get an official estimate from your HR Specialist or run it past us on a call.',
          ]}
        />
      </section>
    </main>
  )
}
