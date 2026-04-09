import React from 'react'
import { Link } from 'react-router-dom'

export default function Timeline() {
  React.useEffect(() => {
    document.title = 'Key Dates & Deadlines | FedBenefitsAid'
  }, [])

  const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif"
  const fontSans = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"
  const maroon = '#7b1c2e'
  const navy = '#0f172a'
  const navyLight = '#1e3a5f'
  const cream = '#faf9f6'

  const styles = {
    main: {
      minHeight: '100vh',
      background: cream,
      fontFamily: fontSans,
    },
    header: {
      background: `linear-gradient(160deg, ${navy} 0%, ${navyLight} 60%)`,
      color: 'white',
      padding: '56px 0 44px',
      fontFamily: fontSans,
    },
    container: {
      maxWidth: 960,
      margin: '0 auto',
      padding: '0 24px',
    },
    headerContent: {
      maxWidth: 960,
      margin: '0 auto',
      padding: '0 24px',
    },
    h1: {
      fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      marginBottom: 12,
      fontFamily: fontSerif,
    },
    subtitle: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: '1.05rem',
      lineHeight: 1.6,
      marginBottom: 0,
      maxWidth: 640,
      fontFamily: fontSans,
    },
    contentWrap: {
      maxWidth: 960,
      margin: '0 auto',
      padding: '48px 24px',
    },
    sectionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))',
      gap: 28,
      marginBottom: 48,
    },
    card: {
      background: 'white',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 14,
      padding: '32px 36px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      fontFamily: fontSans,
    },
    sectionTitle: {
      fontSize: '1.35rem',
      fontWeight: 700,
      color: navy,
      marginBottom: 24,
      fontFamily: fontSerif,
    },
    sectionLabel: {
      fontSize: '0.75rem',
      fontWeight: 700,
      color: navyLight,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: 20,
      fontFamily: fontSans,
    },
    itemList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    itemLabel: {
      fontWeight: 700,
      color: navy,
      fontSize: '0.95rem',
      fontFamily: fontSerif,
    },
    itemDetail: {
      fontSize: '0.9rem',
      color: '#475569',
      lineHeight: 1.6,
      fontFamily: fontSans,
    },
    itemSource: {
      fontSize: '0.8rem',
      color: '#94a3b8',
      marginTop: 4,
      fontStyle: 'italic',
      fontFamily: fontSans,
    },
    sourceBox: {
      marginTop: 20,
      paddingTop: 20,
      borderTop: '1px solid rgba(0,0,0,0.06)',
      fontSize: '0.8rem',
      color: '#64748b',
      fontFamily: fontSans,
    },
    ctaSection: {
      background: `linear-gradient(135deg, rgba(123, 28, 46, 0.05) 0%, rgba(30, 58, 95, 0.05) 100%)`,
      border: `1px solid ${maroon}20`,
      borderRadius: 14,
      padding: '40px 36px',
      textAlign: 'center',
      marginBottom: 48,
    },
    ctaHeading: {
      fontSize: '1.2rem',
      fontWeight: 700,
      color: navy,
      marginBottom: 12,
      fontFamily: fontSerif,
    },
    ctaText: {
      fontSize: '0.95rem',
      color: '#475569',
      marginBottom: 24,
      lineHeight: 1.6,
      fontFamily: fontSans,
    },
    ctaButton: {
      display: 'inline-block',
      background: maroon,
      color: 'white',
      padding: '14px 32px',
      borderRadius: 10,
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '0.95rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: fontSans,
    },
    disclaimer: {
      fontSize: '0.8rem',
      color: '#94a3b8',
      lineHeight: 1.6,
      marginTop: 40,
      paddingTop: 24,
      borderTop: '1px solid rgba(0,0,0,0.06)',
      fontFamily: fontSans,
    },
    responsiveCard: {
      '@media (max-width: 768px)': {
        padding: '24px 20px',
      },
    },
  }

  const sectionA = [
    {
      label: 'FEHB Open Season',
      detail: 'November 10 – December 8 (for following plan year). Changes effective first full pay period in January.',
      source: 'OPM.gov',
    },
    {
      label: 'FEDVIP (Dental & Vision)',
      detail: 'Same dates as FEHB Open Season. Effective January 1.',
      source: 'OPM.gov',
    },
    {
      label: 'FSAFEDS (Flexible Spending)',
      detail: 'Same dates as FEHB Open Season. Effective January 1.',
      source: 'OPM.gov',
    },
    {
      label: 'FEGLI (Life Insurance)',
      detail: 'NO annual open season. Changes only via qualifying life event (within 60 days, file SF-2817) or physical exam.',
      source: 'OPM.gov',
    },
    {
      label: 'TSP Contributions',
      detail: 'No enrollment season — start/stop/change contributions any pay period via myPay or Employee Express.',
      source: 'TSP.gov',
    },
  ]

  const sectionB = [
    {
      label: 'TSP Regular Limit (2026)',
      detail: '$24,500 (applies to traditional + Roth combined)',
      source: 'TSP.gov',
    },
    {
      label: 'TSP Catch-Up (Age 50+)',
      detail: '$8,000 additional',
      source: 'TSP.gov',
    },
    {
      label: 'TSP Super Catch-Up (Ages 60-63)',
      detail: '$11,250 additional (SECURE 2.0)',
      source: 'TSP.gov / IRS',
    },
    {
      label: 'Mandatory Roth Catch-Up',
      detail: 'If prior-year FICA wages exceed $150,000, catch-up must go to Roth.',
      source: 'TSP.gov Bulletin 25-3',
    },
    {
      label: 'IRA Contribution Limit (2026)',
      detail: '$7,500 (catch-up additional $1,000 for 50+)',
      source: 'IRS.gov',
    },
  ]

  const sectionC = [
    {
      label: 'Initial Enrollment Period',
      detail: '3 months before → 3 months after 65th birthday (7-month window)',
      source: 'CMS.gov',
    },
    {
      label: 'Special Enrollment Period',
      detail: '8 months after losing employer coverage or retiring (whichever is later)',
      source: 'CMS.gov',
    },
    {
      label: 'General Enrollment',
      detail: 'January 1 – March 31 annually (coverage begins July 1)',
      source: 'CMS.gov',
    },
    {
      label: 'Medicare Open Enrollment (Part C/D)',
      detail: 'October 15 – December 7 annually',
      source: 'CMS.gov',
    },
    {
      label: 'Late Enrollment Penalty',
      detail: '10% per year of delay added permanently to Part B premium',
      source: 'CMS.gov',
    },
    {
      label: '2026 Part B Standard Premium',
      detail: '$202.90/month',
      source: 'CMS.gov',
    },
    {
      label: '2026 Part B Deductible',
      detail: '$283/year',
      source: 'CMS.gov',
    },
  ]

  const sectionD = [
    {
      label: 'Retirement Application (SF-3107 or SF-2801)',
      detail: 'Submit 2-3 months before target retirement date',
      source: 'OPM.gov',
    },
    {
      label: 'Annuity Commencement',
      detail: 'First day of month after separation',
      source: 'OPM.gov',
    },
    {
      label: 'OPM Processing Time',
      detail: 'Approximately 60 days for interim payments, up to 6 months for final adjudication',
      source: 'OPM.gov',
    },
    {
      label: 'Optimal Retirement Dates',
      detail: 'Last day of a month (annuity starts next day); last day of leave year for maximum annual leave payout (January 9, 2027 for 2026 leave year)',
      source: 'OPM.gov',
    },
    {
      label: 'Annual Leave Lump Sum',
      detail: 'Paid at current hourly rate for all unused hours — no cap',
      source: 'OPM.gov',
    },
  ]

  const sectionE = [
    {
      label: 'FEHB 5-Year Rule',
      detail: 'Must be enrolled in FEHB for 5 consecutive years immediately before retirement (or since first eligible if less than 5 years) to carry into retirement.',
      source: 'OPM.gov',
    },
    {
      label: 'FEGLI 5-Year Rule',
      detail: 'Must have Basic FEGLI for 5 consecutive years immediately before retirement (or since first eligible) to carry into retirement.',
      source: 'OPM.gov',
    },
    {
      label: 'FEGLI Post-65 Reduction Election',
      detail: 'Made at time of retirement — choose 75% reduction (cheapest, Basic free after 65), 50% reduction, or no reduction.',
      source: 'OPM.gov',
    },
  ]

  const sectionF = [
    {
      label: 'FERS (hired before 2013)',
      detail: '0.8% of salary',
      source: 'OPM.gov',
    },
    {
      label: 'FERS-RAE (hired in 2013)',
      detail: '3.1% of salary',
      source: 'OPM.gov',
    },
    {
      label: 'FERS-FRAE (hired 2014 or later)',
      detail: '4.4% of salary',
      source: 'OPM.gov',
    },
  ]

  const sectionG = [
    {
      label: '2026 Earnings Test (under FRA)',
      detail: '$24,480/year ($1 withheld per $2 over)',
      source: 'SSA.gov',
    },
    {
      label: '2026 Earnings Test (year of FRA)',
      detail: '$65,160/year ($1 withheld per $3 over)',
      source: 'SSA.gov',
    },
    {
      label: 'Full Retirement Age (born 1960+)',
      detail: '67',
      source: 'SSA.gov',
    },
    {
      label: 'FERS Supplement Earnings Test',
      detail: 'Same $24,480 limit applies',
      source: 'SSA.gov',
    },
  ]

  const SectionCard = ({ title, items, label }) => (
    <div style={styles.card}>
      <div style={styles.sectionLabel}>{label}</div>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.itemList}>
        {items.map((item, idx) => (
          <div key={idx} style={styles.item}>
            <div style={styles.itemLabel}>{item.label}</div>
            <div style={styles.itemDetail}>{item.detail}</div>
            <div style={styles.itemSource}>Source: {item.source}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <main style={styles.main}>
      <style>{`
        @media (max-width: 768px) {
          [data-responsive-grid] {
            grid-template-columns: 1fr !important;
          }
        }
        a.cta-button:hover {
          background: #6a172a;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(123, 28, 46, 0.25);
        }
      `}</style>

      {/* Hero Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.h1}>Key Dates & Deadlines</h1>
          <p style={styles.subtitle}>
            Every enrollment window, filing deadline, and strategic date federal employees need to know — sourced from official government publications.
          </p>
        </div>
      </header>

      {/* Content */}
      <div style={styles.contentWrap}>
        {/* Section A: Annual Enrollment */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="A. ANNUAL ENROLLMENT WINDOWS"
            title="Enrollment Periods"
            items={sectionA}
          />
        </div>

        {/* Section B: Contribution Limits */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="B. 2026 CONTRIBUTION LIMITS"
            title="IRS & TSP Limits"
            items={sectionB}
          />
        </div>

        {/* Section C: Medicare */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="C. MEDICARE ENROLLMENT"
            title="Medicare Deadlines & Costs"
            items={sectionC}
          />
        </div>

        {/* Section D: Retirement */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="D. RETIREMENT APPLICATION & PROCESSING"
            title="Filing Timeline"
            items={sectionD}
          />
        </div>

        {/* Section E: FEHB & FEGLI Continuation */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="E. FEHB & FEGLI CONTINUATION INTO RETIREMENT"
            title="5-Year Rules & Elections"
            items={sectionE}
          />
        </div>

        {/* Section F: FERS Contribution */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="F. FERS EMPLOYEE CONTRIBUTION RATES"
            title="Your Required Deductions"
            items={sectionF}
          />
        </div>

        {/* Section G: Social Security */}
        <div style={{ ...styles.sectionGrid, marginBottom: 32 }} data-responsive-grid>
          <SectionCard
            label="G. SOCIAL SECURITY KEY NUMBERS"
            title="2026 Earnings & Benefits"
            items={sectionG}
          />
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <h3 style={styles.ctaHeading}>Questions about your retirement timeline?</h3>
          <p style={styles.ctaText}>
            Get personalized answers about which dates matter most for your situation.
          </p>
          <a
            href="https://calendly.com/jhf17/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button"
            style={styles.ctaButton}
          >
            Book a Free Consultation
          </a>
        </div>

        {/* Disclaimer */}
        <div style={styles.disclaimer}>
          <strong>Data Sources & Disclaimer:</strong> All information sourced from OPM.gov, SSA.gov, TSP.gov, CMS.gov, and IRS.gov. This page is current as of April 2026. Federal benefits rules change frequently — verify all dates, contribution limits, and eligibility requirements with your agency HR office before making decisions. This reference page is not a substitute for personalized tax or benefits advice. Consult a qualified benefits counselor or tax professional for your specific situation.
        </div>
      </div>
    </main>
  )
}
