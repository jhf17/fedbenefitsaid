import { Link } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'
import { formatCurrency } from '../lib/pensionCalc'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

/* Survivor-annuity election comparison.
 *
 * FERS (5 USC 8442/8419): full survivor = 50% of the (post-age-reduction)
 * annuity, costing a 10% reduction to the retiree; partial = 25%, costing 5%.
 * CSRS (5 USC 8339(j)): full survivor = 55% of the elected base; for a full
 * base the cost is 2.5% of the first $3,600 of annuity + 10% of the rest.
 *
 * The reason this panel exists: the election is effectively IRREVERSIBLE at
 * retirement, and it gates whether a surviving spouse can keep FEHB. That
 * linkage is the most expensive thing federal retirees get wrong.
 */
function csrsSurvivorCost(annualBase) {
  return Math.min(annualBase, 3600) * 0.025 + Math.max(0, annualBase - 3600) * 0.10
}

export default function SurvivorElectionPanel({ system, result, isMobile }) {
  if (!result || !result.annualAnnuity || result.annualAnnuity <= 0) return null

  const base = result.annualAnnuity // post-age-reduction, pre-survivor-reduction
  const isCsrs = system === 'CSRS'

  const options = isCsrs
    ? [
        { key: 'none', title: 'No survivor annuity', cost: 0, survivorPct: 0, note: 'Requires spouse’s notarized consent.' },
        { key: 'full', title: 'Full survivor (55%)', cost: csrsSurvivorCost(base), survivorPct: 0.55, note: '2.5% of first $3,600 + 10% of the rest.' },
      ]
    : [
        { key: 'none', title: 'No survivor annuity', cost: 0, survivorPct: 0, note: 'Requires spouse’s notarized consent.' },
        { key: 'partial', title: 'Partial survivor (25%)', cost: base * 0.05, survivorPct: 0.25, note: 'Costs 5% of your annuity.' },
        { key: 'full', title: 'Full survivor (50%)', cost: base * 0.10, survivorPct: 0.50, note: 'Costs 10% of your annuity.' },
      ]

  return (
    <section
      style={{
        background: '#ffffff',
        border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
        borderRadius: 16,
        padding: isMobile ? 20 : 32,
        boxShadow: '0 1px 3px rgba(15,29,61,0.04)',
      }}
    >
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: isMobile ? '1.4rem' : '1.7rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 6,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        The survivor election — the one you can't redo
      </h2>
      <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 18, maxWidth: 720, lineHeight: 1.6 }}>
        At retirement you choose, once, how much of your pension continues to your spouse if you die first.
        Using <strong>Scenario 1</strong>'s annuity of {formatCurrency(base)}/yr, here is what each election
        actually costs and pays ({isCsrs ? 'CSRS rules, 5 USC 8339(j)' : 'FERS rules, 5 USC 8419'}):
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : `repeat(${options.length}, 1fr)`,
          gap: 14,
          marginBottom: 18,
        }}
      >
        {options.map((o) => {
          const yourMonthly = (base - o.cost) / 12
          const survivorMonthly = (base * o.survivorPct) / 12
          return (
            <div
              key={o.key}
              style={{
                border: `1px solid ${o.key === 'none' ? 'rgba(123,28,46,0.35)' : colors.primaryBorder || 'rgba(15,29,61,0.12)'}`,
                borderRadius: 12,
                padding: '16px 18px',
                background: o.key === 'none' ? 'rgba(123,28,46,0.04)' : colors.bone,
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 10 }}>
                {o.title}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: colors.slate500 }}>Your monthly pension</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: colors.pine, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(yourMonthly)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: colors.slate500 }}>Spouse's monthly, for life, if you die first</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: o.survivorPct ? colors.pine : '#7b1c2e', fontVariantNumeric: 'tabular-nums' }}>
                    {o.survivorPct ? formatCurrency(survivorMonthly) : '$0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: colors.slate500 }}>Can your spouse keep FEHB?</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: o.survivorPct ? '#1f6f43' : '#7b1c2e' }}>
                    {o.survivorPct ? 'Yes — coverage can continue for life' : 'No — FEHB ends with you'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.74rem', color: colors.slate500, marginTop: 10 }}>{o.note}</div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(123,28,46,0.05)',
          border: '1px solid rgba(123,28,46,0.25)',
          borderRadius: 10,
          fontSize: '0.88rem',
          lineHeight: 1.65,
          color: colors.slate700,
          fontFamily: FONT_SANS,
        }}
      >
        <strong style={{ color: '#7b1c2e' }}>The FEHB rule most people learn too late:</strong> a surviving
        spouse can keep federal health insurance only if you elected at least a partial survivor annuity{' '}
        <em>and</em> they were covered under your Self&nbsp;+&nbsp;1 or Self&nbsp;&amp;&nbsp;Family enrollment when you died.
        Declining the survivor annuity to get the bigger check also cancels their FEHB — permanently. The right
        answer depends on your spouse's age, health, other coverage, and any life insurance in place — the math is
        above; <Link to="/consultation" style={{ color: '#7b1c2e', fontWeight: 600 }}>talking it through is free</Link>.
      </div>
    </section>
  )
}
