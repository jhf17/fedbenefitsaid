import { colors, fonts } from '../constants/theme'
import { DATA_LAST_UPDATED_LABEL, DATA_SOURCES } from '../config/site'

// Standard estimate disclaimer + data-provenance strip for every calculator
// page. One component so the language stays identical (and legally vetted)
// across all tools. Optional `extra` adds a tool-specific caveat sentence.
export default function CalcDisclaimer({ extra }) {
  return (
    <div
      role="note"
      aria-label="Calculator disclaimer"
      style={{
        marginTop: 28,
        padding: '16px 20px',
        background: '#ffffff',
        border: `1px solid ${colors.primaryBorder || 'rgba(15,29,61,0.12)'}`,
        borderLeft: `3px solid ${colors.brassDeep || colors.accent || '#8d6f44'}`,
        borderRadius: 10,
        fontSize: '0.84rem',
        lineHeight: 1.65,
        color: colors.slate700 || '#475569',
        fontFamily: fonts.sans,
      }}
    >
      <strong style={{ color: colors.charcoal || '#1f2937' }}>Estimates only — for education, not advice.</strong>{' '}
      This tool applies the published federal formulas to the numbers you enter. Your official benefit is
      determined solely by OPM and your agency, and details like part-time service, deposits, court orders, or
      special pay rules can change the answer.{extra ? ` ${extra}` : ''} Before making any retirement election,
      get an official estimate from your HR Specialist or verify with{' '}
      {DATA_SOURCES.slice(0, 3).map((s, i) => (
        <span key={s.name}>
          {i > 0 && ', '}
          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.brassDeep || '#8d6f44', textDecoration: 'underline' }}>
            {s.name.replace('Office of Personnel Management', 'OPM').replace('Internal Revenue Service', 'IRS').replace('Social Security Administration', 'SSA')}
          </a>
        </span>
      ))}
      . Nothing here is financial, tax, or legal advice. Figures current as of {DATA_LAST_UPDATED_LABEL}.
    </div>
  )
}
