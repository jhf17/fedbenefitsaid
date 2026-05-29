import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'
import { UNAVAILABLE_STATE_NAMES, DATA_LAST_UPDATED } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

export default function Disclaimer() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const unavailableList = Object.values(UNAVAILABLE_STATE_NAMES).join(', ')

  return (
    <main style={styles.main}>
      <Seo
        title="Disclaimer"
        description={`${brand.name} is an independent education-focused practice. We are not affiliated with OPM or the U.S. government. Read our full disclaimer, sourcing, and state availability.`}
        path="/disclaimer"
      />
      <div style={styles.container}>
        <h1 style={styles.h1}>Disclaimer</h1>
        <p style={styles.updated}>Last updated: May 26, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>Educational purposes only</h2>
          <p style={styles.p}>
            This site provides educational information about federal employee benefits — FERS, CSRS, TSP, FEHB, FEGLI,
            Medicare, and Social Security. Content here is for general information and does <strong>not</strong>{' '}
            constitute personalized financial, legal, tax, or investment advice.
          </p>
          <p style={styles.p}>
            Every federal employee's situation is different. Before you act on what you read here, talk to a qualified
            benefits advisor, financial planner, or your agency HR office. You can also verify any rule or figure
            directly with OPM or the relevant federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Accuracy and sourcing</h2>
          <p style={styles.p}>
            We update benefit rates, contribution limits, and eligibility rules each year for the current benefit year.
            Figures on this site are sourced from official government publications including OPM, IRS, SSA, CMS, and
            the Federal Retirement Thrift Investment Board (TSP). Where a number is referenced, the underlying source
            is linked inline or in the page footer.
          </p>
          <p style={styles.p}>
            Federal benefit rules change. We aren't responsible for outdated information or for decisions made on a
            figure that has since been revised. Verify critical decisions with the official source.
          </p>
          <p style={styles.p}>
            <strong>Most recent figure update:</strong> {DATA_LAST_UPDATED}.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>About {brand.name} and consultations</h2>
          <p style={styles.p}>
            {brand.name} is an education-focused practice for federal employees. When you book through this site, you
            are scheduling time with a Federal Retirement Consultant on our team. The consultation is free. There is no
            time limit and no second-meeting expectation.
          </p>
          <p style={styles.p}>
            We are independent. {brand.name} is <strong>not affiliated with, endorsed by, or authorized to speak on
            behalf of</strong> the U.S. government, the Office of Personnel Management, or any federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>State availability</h2>
          <p style={styles.p}>
            Insurance and annuity products discussed in consultations aren't available to residents of{' '}
            <strong>{unavailableList}</strong>. The free educational tools on this site — calculators, library, articles —
            are open to everyone.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Privacy and data collection</h2>
          <p style={styles.p}>
            The only time we collect personal information here is when you book a meeting. The phone-call form takes
            your name, email, phone number, state of residence, and meeting preferences. The Zoom booking flow (Calendly)
            takes the same. We use that information to contact you about the meeting and to follow up. We don't sell it,
            trade it, or add it to marketing lists.
          </p>
          <p style={styles.p}>
            Calculator inputs (salary, years of service, TSP balance, and so on) are processed entirely in your browser
            and aren't transmitted to our servers. We use Google Analytics for anonymous traffic measurement; you can
            decline analytics from the cookie banner at the bottom of any page. For full detail see our{' '}
            <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Compensation</h2>
          <p style={styles.p}>
            {brand.name} may be compensated by an insurance carrier when a client elects to purchase an insurance,
            annuity, or related financial product through us. The education on this site is provided free of charge.
            Choosing to purchase a product through us is always optional and is never a prerequisite for the consultation
            or for access to anything on the site.
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
    color: colors.primary,
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
    color: colors.primary,
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
    color: colors.accentDark,
    textDecoration: 'underline',
    fontWeight: 500,
  },
  backWrap: {
    marginTop: 56,
    paddingTop: 28,
    borderTop: `1px solid ${colors.primaryBorder}`,
  },
  backLink: {
    color: colors.accentDark,
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
