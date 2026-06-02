import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main style={styles.main}>
      <Seo
        title="Privacy Policy"
        description={`How ${brand.name} collects, uses, and protects your data. The only data we collect is what you provide when booking a free meeting.`}
        path="/privacy"
      />
      <div style={styles.container}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: May 26, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>The short version</h2>
          <p style={styles.p}>
            This is a free educational website operated by <strong>{brand.name}</strong>. You don't need an account,
            you don't have to sign up, and you don't have to hand over an email address to use anything on it. The
            calculators and library run without collecting your personal information.
          </p>
          <p style={styles.p}>
            <strong>The only time we collect personal information is when you choose to book a free meeting</strong>{' '}
            (phone or Zoom). What you submit is used to schedule and conduct that meeting and to follow up about it.
            We don't sell it, rent it, or hand it over to advertisers or marketers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Who we are</h2>
          <p style={styles.p}>
            On this site, "we," "us," and "our" refer to <strong>{brand.name}</strong>. We are an independent firm and
            are not affiliated with, endorsed by, or authorized to speak on behalf of the U.S. Office of Personnel
            Management or any federal agency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>What we collect</h2>

          <h3 style={styles.h3}>1. Phone-call meeting requests</h3>
          <p style={styles.p}>
            If you submit the phone-call request form at <Link to="/consultation" style={styles.link}>/consultation</Link>, we collect:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Your name</li>
            <li style={styles.li}>Your email address</li>
            <li style={styles.li}>Your phone number</li>
            <li style={styles.li}>Your state of residence</li>
            <li style={styles.li}>Your employer / agency / department (if you choose to provide it)</li>
            <li style={styles.li}>Your preferred date and time for the call</li>
            <li style={styles.li}>Any optional message you include with the request</li>
          </ul>
          <p style={styles.p}>
            We use this information for one purpose: to call you at the time you requested and follow up if needed.
            You won't end up on a marketing list, and we don't sell or share this information with third parties for
            their own use.
          </p>

          <h3 style={styles.h3}>2. Video meeting bookings (Calendly)</h3>
          <p style={styles.p}>
            If you book a Zoom video meeting, the scheduling page is provided by <strong>Calendly</strong>. The
            information you enter (name, email, phone number, and any answers to Calendly's custom questions) is
            processed by Calendly under their own privacy policy, and a copy is shared with us so we can prepare for
            the call.
          </p>
          <p style={styles.p}>
            Calendly's policy: <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>calendly.com/privacy</a>.
          </p>

          <h3 style={styles.h3}>3. Calculator inputs</h3>
          <p style={styles.p}>
            All calculators (FERS pension, CSRS, Special Provisions, FEGLI cost, income picture, what-if coverage,
            High-3) <strong>run entirely in your browser</strong>. The numbers you enter
            (salary, years of service, retirement age, TSP balance) are not transmitted to our servers and aren't stored
            outside your device. We never see them.
          </p>

          <h3 style={styles.h3}>4. Website analytics (Google Analytics 4)</h3>
          <p style={styles.p}>
            We use Google Analytics 4 to understand how visitors find and use the site. This includes anonymous,
            aggregated data such as:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Pages you visited and how long you stayed</li>
            <li style={styles.li}>The general region you are in (city or state, not your street address)</li>
            <li style={styles.li}>Device type and browser</li>
            <li style={styles.li}>How you arrived (search engine, direct, referring link)</li>
          </ul>
          <p style={styles.p}>
            Google Analytics doesn't identify you personally. You can opt out by clicking <strong>Decline</strong> on
            the cookie banner at the bottom of the page, by using a browser-level Do Not Track setting, or by installing
            Google's official opt-out browser add-on.
          </p>

          <h3 style={styles.h3}>What we do NOT collect</h3>
          <p style={styles.p}>
            We never collect any of the following on this site:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Social Security numbers</li>
            <li style={styles.li}>Bank account or credit card information (there's nothing to pay for)</li>
            <li style={styles.li}>Passwords (there are no user accounts)</li>
            <li style={styles.li}>Health information</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>How we store and protect your information</h2>
          <p style={styles.p}>
            Information you submit through a meeting request is stored in our internal CRM so the consultant assigned
            to your meeting can reach you. Access is limited to the people inside our firm who need it to schedule,
            prepare for, or follow up on your meeting.
          </p>
          <p style={styles.p}>
            All data transmitted between your browser and our website is encrypted in transit using HTTPS / TLS. Our
            third-party providers (Calendly, Netlify, Cloudflare, Google) maintain industry-standard security controls
            and encrypt data at rest.
          </p>
          <p style={styles.p}>
            No system is ever fully immune to a breach. We will notify you in accordance with applicable law if a
            security incident affects your personal information.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Third-party service providers</h2>
          <p style={styles.p}>
            We use the following providers to operate the site. Each is bound by its own privacy policy:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Netlify</strong> — Website hosting and the serverless function that receives your phone-call request</li>
            <li style={styles.li}><strong>Cloudflare</strong> — DNS, content delivery, and basic security protection</li>
            <li style={styles.li}><strong>Calendly</strong> — Scheduling for Zoom video meetings</li>
            <li style={styles.li}><strong>Resend</strong> — Sends an internal notification email to the consultant so they know you've requested a call</li>
            <li style={styles.li}><strong>Google Analytics 4</strong> — Anonymous traffic and usage analytics</li>
          </ul>
          <p style={styles.p}>
            We do not share your information with any third party for marketing, advertising, profiling, or resale.
            The providers above process information only on our behalf to operate the website and the booking flow.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Cookies and similar technologies</h2>
          <p style={styles.p}>
            We use a small number of cookies and similar technologies:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Consent cookie</strong> — Remembers whether you accepted or declined analytics so we don't show you the banner on every page</li>
            <li style={styles.li}><strong>Google Analytics cookies</strong> — Only loaded if you accept analytics. Used to anonymously measure site usage</li>
            <li style={styles.li}><strong>Calendly cookies</strong> — Set by Calendly when you load the video-booking widget; governed by Calendly's privacy policy</li>
          </ul>
          <p style={styles.p}>
            You can clear cookies, block them in your browser settings, or click <strong>Decline</strong> in the cookie
            banner at the bottom of any page. Declining will disable Google Analytics tracking for your visit.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>How long we keep your information</h2>
          <p style={styles.p}>
            Meeting-request records are kept in our CRM as long as needed to schedule, conduct, and follow up on your
            meeting, and afterwards for ordinary recordkeeping and regulatory purposes. If you ask us to delete your
            record (see "Your rights" below), we will do so unless we are required by law or by financial-services
            recordkeeping rules to retain it.
          </p>
          <p style={styles.p}>
            Analytics data collected by Google is retained according to Google's default retention settings.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Your rights</h2>
          <p style={styles.p}>
            Depending on where you live, you may have some or all of the following rights with respect to your
            personal information:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Right to know</strong> — Ask what personal information we hold about you</li>
            <li style={styles.li}><strong>Right to access</strong> — Request a copy of that information</li>
            <li style={styles.li}><strong>Right to correct</strong> — Ask us to fix inaccurate information</li>
            <li style={styles.li}><strong>Right to delete</strong> — Ask us to delete your information (subject to legal retention requirements)</li>
            <li style={styles.li}><strong>Right to opt out</strong> — Decline analytics and choose not to submit any forms</li>
            <li style={styles.li}><strong>Right to non-discrimination</strong> — We will not deny you service for exercising any of these rights</li>
          </ul>
          <p style={styles.p}>
            To exercise any of these rights, email us at <a href={`mailto:${brand.contact.email}`} style={styles.link}>{brand.contact.email}</a>{' '}
            with enough detail to identify your record (the name, email, or phone number you submitted). We will
            respond within 30 days.
          </p>
          <p style={styles.p}>
            We do not "sell" personal information as that term is defined under the California Consumer Privacy Act
            (CCPA) or analogous state laws, and we do not share personal information for cross-context behavioral
            advertising.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Children's privacy</h2>
          <p style={styles.p}>
            This site is intended for U.S. federal employees and is not directed at children under 18. We do not
            knowingly collect personal information from anyone under 18. If you believe a minor has submitted
            information to us, contact us and we will delete it.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Visitors outside the United States</h2>
          <p style={styles.p}>
            The site is hosted in the United States and intended for U.S. federal employees. If you access the site
            from outside the U.S., you understand that any information you submit will be processed in the United
            States.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Changes to this Privacy Policy</h2>
          <p style={styles.p}>
            We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page
            indicates the most recent revision. Material changes will be highlighted on the home page or noted within
            the policy itself for a reasonable period.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Contact us</h2>
          <p style={styles.p}>
            If you have a question about this Privacy Policy or about how we handle your information, contact us:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Email:</strong> <a href={`mailto:${brand.contact.email}`} style={styles.link}>{brand.contact.email}</a></li>
            <li style={styles.li}><strong>Website:</strong> <a href={brand.url} target="_blank" rel="noopener noreferrer" style={styles.link}>{brand.domain}</a></li>
          </ul>
        </section>

        <section style={styles.section}>
          <p style={styles.disclaimer}>
            <strong>Plain English:</strong> use the calculators and library freely. We don't track who you are. If
            you book a meeting, the only thing we use your information for is to call you back about that meeting.
            Nothing else.
          </p>
        </section>

        <nav style={styles.backWrap}>
          <Link to="/" style={styles.backLink}>Back to home</Link>
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
  h3: {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fonts.serif,
  },
  p: {
    fontSize: '0.95rem',
    color: colors.slate700,
    lineHeight: 1.7,
    marginBottom: 12,
  },
  ul: {
    fontSize: '0.95rem',
    color: colors.slate700,
    lineHeight: 1.7,
    marginLeft: 20,
    marginBottom: 12,
  },
  li: {
    marginBottom: 8,
  },
  link: {
    color: colors.accentDark,
    textDecoration: 'none',
    fontWeight: 500,
  },
  disclaimer: {
    fontSize: '0.92rem',
    color: colors.slate700,
    lineHeight: 1.65,
    padding: '16px',
    backgroundColor: colors.bone,
    borderLeft: `4px solid ${colors.accent}`,
    borderRadius: '4px',
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
