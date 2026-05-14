import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { UNAVAILABLE_STATE_NAMES, DATA_LAST_UPDATED } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

export default function Disclaimer() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const unavailableList = Object.values(UNAVAILABLE_STATE_NAMES).join(', ')

  return (
    <main style={styles.main}>
      <Seo
        title="Disclaimer & Privacy"
        description="FedBenefitsAid is operated by Federal Market Associates. We are not affiliated with OPM or the U.S. government. Read our full disclaimer, sourcing methodology, and state availability."
        path="/disclaimer"
      />
      <div style={styles.container}>
        <h1 style={styles.h1}>Disclaimer &amp; Privacy</h1>
        <p style={styles.updated}>Last updated: April 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>Educational purposes only</h2>
          <p style={styles.p}>
            FedBenefitsAid provides educational information about federal employee retirement benefits including FERS,
            CSRS, TSP, FEHB, FEGLI, Medicare, and Social Security. Content on this site is for general informational
            purposes and does <strong>not</strong> constitute personalized financial, legal, tax, or investment advice.
          </p>
          <p style={styles.p}>
            Every federal employee's situation is different. Before making decisions about your benefits, talk with a
            qualified benefits advisor, financial planner, or your agency HR office. You can also verify any rule or
            figure directly with the Office of Personnel Management or the relevant federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Accuracy &amp; sourcing</h2>
          <p style={styles.p}>
            We update benefit rates, contribution limits, and eligibility rules each year for the current benefit year.
            Figures on this site are sourced from official government publications including OPM, IRS, SSA, CMS, and the
            Federal Retirement Thrift Investment Board (TSP). Where a number is referenced on the site, the underlying
            source is linked in the page footer or inline.
          </p>
          <p style={styles.p}>
            Federal benefit rules change. FedBenefitsAid is not responsible for outdated information or for decisions made
            based on a figure that has since been updated. Verify critical benefit decisions with the official source.
          </p>
          <p style={styles.p}>
            <strong>Most recent figure update:</strong> {DATA_LAST_UPDATED}.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>About Federal Market Associates &amp; consultations</h2>
          <p style={styles.p}>
            FedBenefitsAid is the public education arm of Federal Market Associates. When you book a consultation through this site, you're scheduling time with a Federal Retirement Consultant at Federal Market Associates — not with FedBenefitsAid directly. Consultations are always free; there is no set time limit and no second-meeting expectation.
          </p>
          <p style={styles.p}>
            Federal Market Associates is independent. We are <strong>not affiliated with, endorsed by, or authorized to
            speak on behalf of</strong> the U.S. government, the Office of Personnel Management, or any federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>State availability</h2>
          <p style={styles.p}>
            Insurance and annuity products discussed during consultations are not available to residents of{' '}
            <strong>{unavailableList}</strong>. The free educational tools on this site (calculators, library, articles)
            remain fully available regardless of where you live.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Privacy &amp; data collection</h2>
          <p style={styles.p}>
            When you book a consultation, we collect your name, email, and (optionally) phone number to provide the service and follow up on your interest. We use Google Analytics to understand how visitors navigate the site; you can decline analytics from the cookie banner at the bottom of any page.
          </p>
          <p style={styles.p}>
            Calculator inputs are processed in your browser and are <strong>not</strong> stored on our servers. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Compensation disclosure</h2>
          <p style={styles.p}>
            Federal Market Associates may be compensated when clients elect to purchase insurance, annuity, or related
            financial products through us. This site is provided as free education; choosing to purchase a product
            through us is always optional and is never a prerequisite for accessing the site, the calculators, or the
            consultation call.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Contact</h2>
          <p style={styles.p}>
            Questions about this disclaimer or our privacy practices? Reach us by{' '}
            <Link to="/consultation" style={styles.link}>booking a free meeting</Link> or by visiting the{' '}
            <Link to="/about" style={styles.link}>About</Link> page.
          </p>
        </section>

        <nav style={styles.backWrap}>
          <Link to="/" style={styles.backLink}>← Back to home</Link>
        </nav>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: 'calc(100vh - 64px)',
    background: colors.cream,
    padding: '64px 0 96px',
    fontFamily: FONT_SANS,
    color: colors.charcoal,
  },
  container: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '0 24px',
  },
  h1: {
    fontSize: 'clamp(2rem, 4vw, 2.6rem)',
    fontWeight: 600,
    color: colors.pine,
    letterSpacing: '-0.02em',
    marginBottom: 6,
    fontFamily: FONT_SERIF,
    fontVariationSettings: '"opsz" 144, "SOFT" 50',
  },
  updated: {
    fontSize: '0.88rem',
    color: colors.slate500,
    marginBottom: 48,
  },
  section: {
    marginBottom: 40,
  },
  h2: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.pine,
    marginBottom: 12,
    fontFamily: FONT_SERIF,
    letterSpacing: '-0.01em',
  },
  p: {
    fontSize: '1rem',
    color: colors.slate700,
    lineHeight: 1.75,
    marginBottom: 14,
  },
  link: {
    color: colors.brassDeep,
    textDecoration: 'underline',
    fontWeight: 500,
  },
  backWrap: {
    marginTop: 56,
    paddingTop: 28,
    borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.10)'}`,
  },
  backLink: {
    color: colors.brassDeep,
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
