import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Disclaimer() {
  useEffect(() => {
    document.title = 'Disclaimer — FedBenefitsAid'
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Disclaimer &amp; Privacy</h1>
        <p style={styles.updated}>Last updated: April 6, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>Educational Purposes Only</h2>
          <p style={styles.p}>
            FedBenefitsAid provides educational information about federal employee retirement benefits including FERS, TSP, FEHB, FEGLI, Medicare, and Social Security. The content on this website is for general informational purposes only and does not constitute financial, legal, tax, or investment advice.
          </p>
          <p style={styles.p}>
            Every individual's situation is unique. Before making any decisions about your federal benefits, consult with a qualified federal benefits advisor, financial planner, or legal professional. You can also verify information directly with the Office of Personnel Management (OPM) or the relevant federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Accuracy of Information</h2>
          <p style={styles.p}>
            We make every effort to ensure the accuracy of the information on this site, including benefit rates, contribution limits, and eligibility rules. All figures are updated for the current benefit year (2026) based on official government sources including OPM, IRS, SSA, CMS, and the Federal Retirement Thrift Investment Board.
          </p>
          <p style={styles.p}>
            However, benefit rules and figures can change. FedBenefitsAid is not responsible for any errors, omissions, or outdated information. Always verify critical benefit decisions with official government sources.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>AI Chat Assistant</h2>
          <p style={styles.p}>
            Our AI chat assistant provides helpful guidance based on federal benefits regulations and official data. While the AI is designed to be accurate and up-to-date, AI-generated responses may occasionally contain errors. AI responses should not be treated as official advice. Always verify important information independently before making benefit decisions.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Free Consultations</h2>
          <p style={styles.p}>
            Free consultations are provided by Federal Market Associates, a separate federal benefits education company. FedBenefitsAid connects you with these educators but does not employ them directly. Any guidance given during a consultation is the responsibility of the education company and educator providing it.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Privacy &amp; Data Collection</h2>
          <p style={styles.p}>
            When you create an account, we collect your name, email address, and phone number to provide you with our services and to follow up on your interest in federal retirement benefits. We use Google Analytics to understand how visitors use our website.
          </p>
          <p style={styles.p}>
            We do not sell, rent, or share your personal information with third parties for marketing purposes. Your data is used solely to deliver our services, communicate about your account, and improve the FedBenefitsAid experience.
          </p>
          <p style={styles.p}>
            Assessment results and calculator inputs are not stored permanently and are only used to personalize your experience during your session.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Not Affiliated with the U.S. Government</h2>
          <p style={styles.p}>
            FedBenefitsAid is not affiliated with, endorsed by, or connected to the Office of Personnel Management (OPM), the U.S. federal government, or any federal agency. References to government programs, forms, and regulations are for educational purposes only.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Contact</h2>
          <p style={styles.p}>
            If you have questions about this disclaimer or our privacy practices, you can reach us by booking a call at{' '}
            <a href="https://calendly.com/jhf17/30min" target="_blank" rel="noopener noreferrer" style={styles.link}>
              calendly.com/jhf17/30min
            </a>{' '}
            or visiting{' '}
            <a href="https://federalmarketassociates.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
              Federal Market Associates
            </a>.
          </p>
        </section>

        <nav style={styles.backWrap}>
          <Link to="/" style={styles.backLink}>Back to Home</Link>
        </nav>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: 'calc(100vh - 64px)',
    background: '#f8fafc',
    padding: '48px 0 80px',
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 24px',
  },
  h1: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  updated: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: 40,
  },
  section: {
    marginBottom: 36,
  },
  h2: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 10,
  },
  p: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: 1.7,
    marginBottom: 12,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
  backWrap: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #e2e8f0',
  },
  backLink: {
    color: '#1e3a5f',
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
