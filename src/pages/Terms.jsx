import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main style={styles.main}>
      <Seo
        title="Terms of Service"
        description={`Terms governing your use of ${brand.domain}. Educational use only; no financial, tax, or legal advice; limitation of liability and accuracy disclaimer.`}
        path="/terms"
      />
      <div style={styles.container}>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.updated}>Last updated: May 26, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>1. Acceptance of these Terms</h2>
          <p style={styles.p}>
            These Terms of Service ("Terms") govern your access to and use of <strong>{brand.domain}</strong> (the "Site"), operated by <strong>{brand.name}</strong> ("we," "us," "our"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, do not use the Site.
          </p>
          <p style={styles.p}>
            You must be at least 18 years old to use the Site or to book a meeting through it.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>2. What the Site is</h2>
          <p style={styles.p}>
            {brand.domain} is a free, public educational resource for U.S. federal employees. The Site offers:
          </p>
          <ul style={styles.list}>
            <li>Calculators for FERS pension, CSRS pension, Special Provisions pension, FEGLI cost over time, retirement income picture, "what-if" coverage, and High-3 average salary</li>
            <li>A reference library of federal benefit topics (FERS, CSRS, TSP, FEHB, FEGLI, Medicare, Social Security, Survivor Benefits)</li>
            <li>The option to book a free meeting (phone or Zoom) with a Federal Retirement Consultant at {brand.name}</li>
          </ul>
          <p style={styles.p}>
            There are no paid features on the Site, no user accounts to create, and no requirement to provide your information except when you choose to book a meeting.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>3. NOT financial, tax, or legal advice</h2>
          <p style={styles.p}>
            The Site is provided for general educational purposes only. <strong>Nothing on the Site constitutes personalized financial, investment, tax, insurance, or legal advice</strong>, and nothing on the Site creates a fiduciary, advisory, or attorney-client relationship between you and us. By using the Site, you understand and agree that:
          </p>
          <ul style={styles.list}>
            <li>Calculator results are <strong>estimates</strong> based on the inputs you provide and publicly available formulas, rates, and limits. Actual benefits, taxes, and outcomes may differ.</li>
            <li>Library content summarizes federal rules for educational purposes and may be incomplete, generalized, or out of date.</li>
            <li>Before making any decision about retirement, benefits, insurance, taxes, or investments, you should consult an appropriately licensed professional and verify any figure with the official source (OPM, IRS, SSA, CMS, TSP, or your agency HR office).</li>
          </ul>
          <p style={styles.p}>
            {brand.name} is <strong>not affiliated with, endorsed by, or authorized to speak on behalf of</strong> the U.S. Office of Personnel Management, the federal government, or any federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>4. Free meetings with {brand.name}</h2>
          <p style={styles.p}>
            When you book a meeting through the Site, you are scheduling time with a <strong>Federal Retirement Consultant ("FRC") at {brand.name}</strong>. The meeting is free and has no set time limit. You understand that:
          </p>
          <ul style={styles.list}>
            <li>The meeting is educational in nature. It does not, by itself, create an advisory, fiduciary, brokerage, or insurance-agent relationship.</li>
            <li>FRCs at {brand.name} are also licensed in life and health insurance. If a product is discussed and you choose to purchase it, {brand.name} may be compensated by the insurance carrier — never by you directly through the Site.</li>
            <li>Choosing not to purchase any product is always an option. You are under no obligation to purchase anything as a result of using the Site or attending a meeting.</li>
            <li>Insurance and annuity products are not available to residents of California, New York, or Arkansas. The educational portion of the Site is open to everyone.</li>
            <li>Phone-call requests are routed through our internal system; Zoom meetings are scheduled through Calendly. By using either flow, you agree to the third-party terms of any provider used in the process.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>5. Accuracy and currency of information</h2>
          <p style={styles.p}>
            We update benefit figures, contribution limits, and rules for the current benefit year and cite official government sources where possible. However, federal benefit rules, limits, premium amounts, and eligibility criteria change. We are <strong>not responsible</strong> for:
          </p>
          <ul style={styles.list}>
            <li>Changes in federal law, regulation, or guidance issued after information is posted</li>
            <li>Errors, omissions, or out-of-date figures</li>
            <li>Discrepancies between content on the Site and official government publications</li>
          </ul>
          <p style={styles.p}>
            Always verify critical numbers (multipliers, premiums, contribution limits, COLA percentages, Medicare premiums, FERS Supplement calculations, etc.) with OPM, IRS, SSA, CMS, the Federal Retirement Thrift Investment Board (TSP), or your agency HR office before relying on them for a decision.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>6. Limitation of liability</h2>
          <p style={styles.p}>
            The Site is provided <strong>"as is"</strong> and <strong>"as available"</strong>, without warranty of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, non-infringement, or uninterrupted availability.
          </p>
          <p style={styles.p}>
            To the fullest extent permitted by applicable law, in no event will {brand.name} or any of its officers, employees, contractors, or affiliates be liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages — including loss of profits, loss of benefits, loss of savings, lost data, or any other intangible loss — arising out of or related to:
          </p>
          <ul style={styles.list}>
            <li>Your use of, or inability to use, the Site or any of its tools</li>
            <li>Decisions made based on calculator estimates or library content</li>
            <li>Errors, omissions, or inaccuracies in any content</li>
            <li>Any interruption, suspension, or termination of the Site</li>
            <li>Any conduct or content of any third party (including Calendly, Netlify, Cloudflare, Google, or any insurance carrier referenced in a meeting)</li>
          </ul>
          <p style={styles.p}>
            Because the Site is provided to you free of charge, our maximum aggregate liability to you under or in connection with these Terms will not exceed <strong>one hundred U.S. dollars ($100)</strong>. Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above may not apply to you.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>7. Acceptable use</h2>
          <p style={styles.p}>
            You agree not to use the Site to:
          </p>
          <ul style={styles.list}>
            <li>Attempt to gain unauthorized access to the Site, its underlying systems, or any of our third-party providers</li>
            <li>Probe, scan, or test the vulnerability of the Site or circumvent any security or authentication measure</li>
            <li>Use automated tools, bots, scrapers, or any similar means to harvest content or submit forms</li>
            <li>Impersonate another person or provide false information when booking a meeting</li>
            <li>Use the Site for any illegal, fraudulent, harassing, defamatory, or otherwise harmful purpose</li>
            <li>Interfere with, disrupt, or impair the operation of the Site or the availability of the meeting-booking flow for others</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>8. Intellectual property</h2>
          <p style={styles.p}>
            All content, design, code, calculators, formulas, layout, and educational materials on the Site are owned by or licensed to {brand.name}. Government-published rates, formulas, and rules are public information; the way we present, organize, and explain them on this Site is ours.
          </p>
          <p style={styles.p}>
            You may read, share, and link to the Site for personal, non-commercial use. You may not copy, reproduce, modify, distribute, republish, scrape, or create derivative works from any part of the Site for commercial purposes without our prior written permission.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>9. Third-party services and links</h2>
          <p style={styles.p}>
            The Site relies on third-party providers — including Netlify (hosting), Cloudflare (DNS/CDN), Calendly (scheduling), Resend (transactional email), and Google Analytics (analytics) — and may link to third-party sites (e.g., opm.gov, ssa.gov, irs.gov, tsp.gov). We are not responsible for the availability, accuracy, content, or practices of any third-party service or site, and your use of any third-party service is governed by that party's own terms and privacy policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>10. Privacy</h2>
          <p style={styles.p}>
            Your use of the Site is also subject to our <Link to="/privacy" style={styles.link}>Privacy Policy</Link>, which describes what information we collect, how we use it, and your rights with respect to that information.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>11. Changes to the Site or to these Terms</h2>
          <p style={styles.p}>
            We may add, change, or remove any feature, calculator, or page on the Site at any time, with or without notice. We may also update these Terms from time to time. When we do, we will revise the "Last updated" date at the top of this page. Your continued use of the Site after we post a change constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>12. Governing law and disputes</h2>
          <p style={styles.p}>
            These Terms and any dispute arising out of or relating to your use of the Site are governed by the laws of the United States and (where applicable) the State of New Jersey, without regard to conflict-of-law principles. Any action or proceeding must be brought in a court of competent jurisdiction in the United States.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>13. Severability and entire agreement</h2>
          <p style={styles.p}>
            If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect. These Terms, together with the Privacy Policy and the Disclaimer, constitute the entire agreement between you and us regarding your use of the Site, and supersede any prior agreements on the same subject.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>14. Contact</h2>
          <p style={styles.p}>
            Questions about these Terms? Contact us:
          </p>
          <ul style={styles.list}>
            <li>Email: <a href={`mailto:${brand.contact.email}`} style={styles.link}>{brand.contact.email}</a></li>
            <li>Website: <a href={brand.url} target="_blank" rel="noopener noreferrer" style={styles.link}>{brand.domain}</a></li>
            <li>Book a free meeting: <Link to="/consultation" style={styles.link}>/consultation</Link></li>
          </ul>
        </section>

        <section style={styles.disclaimer}>
          <p style={styles.disclaimerText}>
            These Terms are provided in good faith for transparency. They are not a substitute for legal advice; consult an attorney for specific legal questions.
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
    background: colors.cream,
    padding: '48px 0 80px',
    fontFamily: fonts.sans,
    color: colors.charcoal,
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 24px',
  },
  h1: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: colors.primary,
    letterSpacing: '-0.02em',
    marginBottom: 4,
    fontFamily: fonts.serif,
  },
  updated: {
    fontSize: '0.85rem',
    color: colors.slate500,
    marginBottom: 40,
  },
  section: {
    marginBottom: 36,
  },
  h2: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 10,
    fontFamily: fonts.serif,
  },
  p: {
    fontSize: '0.95rem',
    color: colors.slate700,
    lineHeight: 1.7,
    marginBottom: 12,
  },
  list: {
    fontSize: '0.95rem',
    color: colors.slate700,
    lineHeight: 1.7,
    marginBottom: 12,
    marginLeft: 24,
    listStyleType: 'disc',
  },
  link: {
    color: colors.accentDark,
    textDecoration: 'none',
    fontWeight: 500,
  },
  disclaimer: {
    marginTop: 48,
    padding: 24,
    background: colors.bone,
    borderRadius: 8,
    borderLeft: `4px solid ${colors.accent}`,
    marginBottom: 36,
  },
  disclaimerText: {
    fontSize: '0.9rem',
    color: colors.slate700,
    lineHeight: 1.6,
    margin: 0,
    fontStyle: 'italic',
  },
  backWrap: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: `1px solid ${colors.primaryBorder}`,
  },
  backLink: {
    color: colors.accentDark,
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
