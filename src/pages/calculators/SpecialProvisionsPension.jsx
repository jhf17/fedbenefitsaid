import Seo from '../../components/Seo'
import PensionScenarioCalculator from '../../components/PensionScenarioCalculator'
import { specialProvisionsPension, formatCurrency, formatYearsMonths } from '../../lib/pensionCalc'
import { colors, fonts } from '../../constants/theme'
import { DATA_LAST_UPDATED } from '../../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

function SpecialTierBreakdown(result) {
  if (!result || !result.tiers) return null
  const { first20Years, additionalSpecial, additionalRegular } = result.tiers
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(31,61,44,0.08)' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 8 }}>
        Tier breakdown
      </div>
      <div style={{ fontSize: '0.84rem', color: colors.slate700, lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>First {formatYearsMonths(first20Years.years)} SP @ 1.7%</span>
          <span>{formatCurrency(first20Years.contribution)}</span>
        </div>
        {additionalSpecial.years > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>+{formatYearsMonths(additionalSpecial.years)} SP @ 1.0%</span>
            <span>{formatCurrency(additionalSpecial.contribution)}</span>
          </div>
        )}
        {additionalRegular.years > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>+{formatYearsMonths(additionalRegular.years)} regular FERS @ {(additionalRegular.multiplier * 100).toFixed(1)}%</span>
            <span>{formatCurrency(additionalRegular.contribution)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SpecialProvisionsPension() {
  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="FERS Special Provisions Pension Calculator — LEO, FF, ATC"
        description="Pension calculator for Special Provisions FERS employees: LEO, firefighters, ATC, Capitol Police, Secret Service Uniformed Division, nuclear materials couriers. 1.7%/1.0% formula with side-by-side scenarios."
        path="/calculators/special"
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
            FERS Special Provisions · Updated {DATA_LAST_UPDATED}
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
            Special Provisions Pension <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              LEO · Firefighter · ATC · CP · SS-UD · NMC.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            The 1.7% / 1.0% formula with the early-out windows and the FERS Supplement that's exempt from the earnings
            test until your MRA. Different from standard FERS in five meaningful ways — this calculator handles them.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 96px' }}>
        <PensionScenarioCalculator
          system="FERS Special Provisions"
          calc={specialProvisionsPension}
          extraInputs={[
            {
              name: 'additionalRegularYears',
              label: 'Years of additional regular FERS service (if any)',
              type: 'number',
              defaultValue: 0,
              step: '0.5',
              help:
                'If you transferred from a regular FERS position before becoming Special Provisions (or vice versa), enter those non-SP years here. They get the standard 1.0% (or 1.1% at age 62 with 20+ total) multiplier.',
            },
          ]}
          formula="(1.7% × first 20 SP yrs + 1.0% × additional SP yrs + standard rate × regular-FERS yrs) × High-3"
          eligibility={[
            'Age 50 + 20 years of Special Provisions service — Immediate Unreduced (Supplement until 62)',
            'Any age + 25 years of Special Provisions service — Immediate Unreduced (Supplement until 62)',
            'Mandatory retirement age 57 for LEO/Firefighters; 56 for Air Traffic Controllers.',
            'Below 50/20 or 25-year thresholds: standard FERS rules apply (no special provisions benefit).',
          ]}
          notes={[
            'The FERS Supplement for Special Provisions retirees is NOT subject to the SS earnings test until you reach your MRA. After MRA, it is.',
            'Special Provisions employees pay a higher contribution rate to FERS than regular employees — the higher pension formula is the corresponding benefit.',
            'Sick leave (2,087 hr = 1 yr) is added to creditable service in the annuity computation, but does NOT count toward the 20- or 25-year eligibility thresholds for Special Provisions retirement. Those thresholds must be met by actual Special Provisions service (per 5 USC 8415).',
            'If you retire under Special Provisions but do not have 20 years of SP service (e.g., 15 SP + 10 regular), the 1.7% multiplier applies only to your SP years; regular years use the standard FERS rate.',
            'COLA on Special Provisions FERS pension begins immediately at retirement (unlike standard FERS, which waits until age 62). This is a meaningful long-term advantage.',
            'For position-specific eligibility quirks (ATC mandatory age, secondary positions, primary/secondary creditable service), get an official estimate from HR or talk to us.',
            'For the FERS Supplement dollar amount and full retirement income picture, use the Full Income Picture calculator.',
          ]}
          renderScenarioDetails={SpecialTierBreakdown}
        />
      </section>
    </main>
  )
}
