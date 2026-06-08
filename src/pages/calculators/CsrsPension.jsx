import Seo from '../../components/Seo'
import PensionScenarioCalculator from '../../components/PensionScenarioCalculator'
import { csrsPension, formatCurrency } from '../../lib/pensionCalc'
import { colors, fonts } from '../../constants/theme'
import { DATA_LAST_UPDATED } from '../../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

function CsrsTierBreakdown(result) {
  if (!result || !result.tiers) return null
  const { first5Years, next5Years, remaining } = result.tiers
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(26,45,92,0.08)' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 8 }}>
        Tier breakdown
      </div>
      <div style={{ fontSize: '0.84rem', color: colors.slate700, lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>First 5 yrs @ 1.5%</span>
          <span>{formatCurrency(first5Years.contribution)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Next 5 yrs @ 1.75%</span>
          <span>{formatCurrency(next5Years.contribution)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{remaining.years.toFixed(1)} yrs @ 2.0%</span>
          <span>{formatCurrency(remaining.contribution)}</span>
        </div>
        {result.cappedHit && (
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: colors.brassDeep, fontWeight: 600 }}>
            ⓘ 80% cap reached — formula clipped to {formatCurrency(result.high3 * 0.8)}/yr.
          </div>
        )}
        {result.replacementRate > 0 && (
          <div style={{ marginTop: 4, fontSize: '0.78rem', color: colors.slate500 }}>
            Replacement rate: {(result.replacementRate * 100).toFixed(0)}% of High-3
          </div>
        )}
      </div>
    </div>
  )
}

export default function CsrsPension() {
  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="CSRS Pension Calculator — customizable scenarios"
        description="CSRS pension estimator with customizable retirement-date scenarios. Tiered formula (1.5/1.75/2.0%), 80% cap, and CSRS-specific eligibility."
        path="/calculators/csrs"
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
            CSRS Pension · Updated {DATA_LAST_UPDATED}
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
            CSRS Pension Calculator <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              The 1.5 / 1.75 / 2.0 formula, exactly.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            Built for CSRS retirees — separate from FERS because the formula, eligibility, COLA timing, and survivor
            elections are genuinely different. No FERS Supplement, no 1.1% kicker, no SS earned from federal service.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 96px' }}>
        <PensionScenarioCalculator
          system="CSRS"
          calc={csrsPension}
          formula="(1.5% × first 5 yrs + 1.75% × next 5 yrs + 2.0% × remaining yrs) × High-3 — capped at 80% of High-3"
          eligibility={[
            'Age 55 + 30 years — Immediate Unreduced',
            'Age 60 + 20 years — Immediate Unreduced',
            'Age 62 + 5 years — Immediate Unreduced',
            '5+ years, age < 62 — Deferred (annuity at age 62)',
            'CSRS does not have an MRA+10 path or a FERS Supplement.',
          ]}
          notes={[
            'CSRS COLAs start the year after retirement (full CPI), not at age 62 like FERS.',
            'The 80% cap is reached at 41 years 11 months of service — but unused sick leave can grow the annuity above the cap.',
            'CSRS retirees did not pay into Social Security on federal earnings, so there is no FERS-style supplement.',
            'CSRS Offset employees (paid SS while CSRS-covered) have a different calculation: pension is offset by the SS amount earned during offset service when SS begins. This calculator is regular CSRS, not Offset.',
            'The standard survivor benefit for CSRS is 55% of the annuity (vs FERS at 50%); the reduction is roughly 10% of the gross annuity for full survivor.',
            'For CSRS Offset or Voluntary Contribution scenarios, get an official estimate from your HR or run it by us on a call.',
          ]}
          renderScenarioDetails={CsrsTierBreakdown}
        />
      </section>
    </main>
  )
}
