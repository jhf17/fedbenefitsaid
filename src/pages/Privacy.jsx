import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main style={styles.main}>
      <Seo
        title="Privacy Policy"
        description="How FedBenefitsAid collects, uses, and protects your data. Learn about assessment responses, lead capture, cookies, and your privacy choices."
        path="/privacy"
      />
      <div style={styles.container}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: April 7, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>Overview</h2>
          <p style={styles.p}>
            FedBenefitsAid ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, how we store it, and your rights regarding your personal information.
          </p>
          <p style={styles.p}>
            We collect and process minimal personal data necessary to operate our website and services. We do not sell your personal information to third parties.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>What Data We Collect</h2>

          <h3 style={styles.h3}>Account Creation</h3>
          <p style={styles.p}>
            When you create an account on FedBenefitsAid, we collect:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Full name</li>
            <li style={styles.li}>Email address</li>
            <li style={styles.li}>Phone number</li>
            <li style={styles.li}>Password (securely hashed and encrypted)</li>
          </ul>
          <p style={styles.p}>
            This information is stored in Supabase, our cloud database provider, and is encrypted at rest.
          </p>

          <h3 style={styles.h3}>Assessment Tool</h3>
          <p style={styles.p}>
            Our Retirement Readiness Assessment collects your answers to 14 questions about your federal employment status, age, years of service, and retirement readiness. Your assessment responses and final readiness score are processed and displayed to you. If you opt to receive results via email, we may store the email request temporarily.
          </p>

          <h3 style={styles.h3}>Retirement Calculator</h3>
          <p style={styles.p}>
            Our FERS Retirement Calculator processes information you enter, including:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Current salary</li>
            <li style={styles.li}>Years of federal service</li>
            <li style={styles.li}>Planned retirement age</li>
            <li style={styles.li}>TSP balance and monthly contribution</li>
          </ul>
          <p style={styles.p}>
            <strong>Important:</strong> All calculator inputs are processed entirely in your browser and are NOT transmitted to our server or stored unless you choose to email the results to yourself.
          </p>

          <h3 style={styles.h3}>Email Results</h3>
          <p style={styles.p}>
            If you request to have your assessment or calculator results emailed to you, we collect your email address for that specific request. The email is delivered via our email service provider (Resend) and the delivery is processed through Amazon SES.
          </p>

          <h3 style={styles.h3}>AI Chat</h3>
          <p style={styles.p}>
            When you use our AI chat assistant (available to logged-in users), your conversation messages are sent to Anthropic's API for processing. These messages are not permanently stored by FedBenefitsAid. Refer to Anthropic's privacy policy for details on how they handle chat data.
          </p>

          <h3 style={styles.h3}>Consultation Booking</h3>
          <p style={styles.p}>
            When you book a free consultation through our Calendly integration, Calendly collects your name, email, and any additional information you provide. This data is subject to Calendly's privacy policy and is used by our consulting partner, Federal Market Associates, to contact you about your consultation.
          </p>

          <h3 style={styles.h3}>Website Analytics</h3>
          <p style={styles.p}>
            We use Google Analytics (GA4) to collect anonymous data about how visitors use our website, including:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Pages visited and time spent on each page</li>
            <li style={styles.li}>Device type and browser information</li>
            <li style={styles.li}>General location data (city/region, not individual address)</li>
            <li style={styles.li}>Interactions with tools and features</li>
          </ul>
          <p style={styles.p}>
            This data is collected via cookies and is anonymous—it does not identify you personally. Our GA4 measurement ID is G-6K0NHQ5WSK.
          </p>

          <h3 style={styles.h3}>Lead Information</h3>
          <p style={styles.p}>
            When you interact with our website (sign up, book a consultation, request results), we create a lead record in our Airtable CRM that includes your name, email, phone number, referral source, and the date of your interaction. This helps us track engagement and follow up on your interest in federal retirement benefits.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>How We Store Your Data</h2>

          <h3 style={styles.h3}>User Accounts</h3>
          <p style={styles.p}>
            User account information (name, email, phone, hashed password) is stored in Supabase, a cloud database provider that encrypts data at rest using AES-256 encryption. Supabase maintains secure data centers with regular backups and disaster recovery procedures.
          </p>

          <h3 style={styles.h3}>Lead Data</h3>
          <p style={styles.p}>
            Lead information is stored in Airtable, our CRM provider. This data is not shared with third parties except for internal management and consultation scheduling.
          </p>

          <h3 style={styles.h3}>Calculator Inputs</h3>
          <p style={styles.p}>
            Calculator inputs are processed entirely in your browser using JavaScript and are NOT sent to our servers unless you explicitly request to email the results to yourself.
          </p>

          <h3 style={styles.h3}>Financial Information</h3>
          <p style={styles.p}>
            <strong>We never collect, store, or process credit card numbers, bank account information, Social Security numbers, or any sensitive financial account data.</strong> All sensitive financial inputs to our calculator are processed locally on your device.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Third-Party Service Providers</h2>
          <p style={styles.p}>
            We use the following third-party service providers to operate our website and services:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Supabase</strong> — Authentication and database storage (user accounts)</li>
            <li style={styles.li}><strong>Airtable</strong> — CRM and lead management</li>
            <li style={styles.li}><strong>Netlify</strong> — Website hosting and serverless functions</li>
            <li style={styles.li}><strong>Cloudflare</strong> — CDN, DNS, and security services</li>
            <li style={styles.li}><strong>Google Analytics</strong> — Website analytics and user behavior tracking</li>
            <li style={styles.li}><strong>Anthropic</strong> — AI chat processing (conversation messages sent to their API)</li>
            <li style={styles.li}><strong>Resend</strong> — Transactional email delivery (powered by Amazon SES)</li>
            <li style={styles.li}><strong>Calendly</strong> — Consultation booking and scheduling</li>
          </ul>
          <p style={styles.p}>
            Each of these providers has their own privacy policy. We recommend reviewing their privacy policies to understand how they handle your data.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>How We Use Your Data</h2>

          <h3 style={styles.h3}>Service Delivery</h3>
          <p style={styles.p}>
            We use your data to:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Create and manage your account</li>
            <li style={styles.li}>Authenticate you when you log in</li>
            <li style={styles.li}>Personalize your experience with tools and resources</li>
            <li style={styles.li}>Send you requested information (assessment results, calculator outputs via email)</li>
            <li style={styles.li}>Facilitate consultation bookings with our advisory partners</li>
          </ul>

          <h3 style={styles.h3}>Communication</h3>
          <p style={styles.p}>
            We may contact you by email or phone to:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Confirm account creation or password resets</li>
            <li style={styles.li}>Follow up on your interest in federal retirement planning</li>
            <li style={styles.li}>Notify you of service updates or changes to this Privacy Policy</li>
            <li style={styles.li}>Respond to your inquiries or requests</li>
          </ul>

          <h3 style={styles.h3}>Analytics and Improvement</h3>
          <p style={styles.p}>
            We use Google Analytics data to understand how users interact with our website, identify popular features, and improve the overall user experience.
          </p>

          <h3 style={styles.h3}>Legal Compliance</h3>
          <p style={styles.p}>
            We may disclose your information if required by law, court order, or government request.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Data Sharing</h2>

          <h3 style={styles.h3}>We Do NOT Sell Your Data</h3>
          <p style={styles.p}>
            FedBenefitsAid does not sell, rent, or share your personal information with third parties for marketing, advertising, or any other commercial purpose.
          </p>

          <h3 style={styles.h3}>Limited Sharing with Service Providers</h3>
          <p style={styles.p}>
            Your data is shared only with the third-party service providers listed above, and only to the extent necessary to operate our services. These providers are contractually bound to keep your data confidential and secure.
          </p>

          <h3 style={styles.h3}>Consultation Bookings</h3>
          <p style={styles.p}>
            When you book a consultation through Calendly, your name, email, and phone number are shared with Federal Market Associates, our consulting partner, so they can contact you to schedule and conduct your consultation.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Your Privacy Rights</h2>

          <h3 style={styles.h3}>Right to Know</h3>
          <p style={styles.p}>
            You have the right to know what personal data we collect about you and how we use it.
          </p>

          <h3 style={styles.h3}>Right to Access</h3>
          <p style={styles.p}>
            You can request a copy of all personal data we hold about you.
          </p>

          <h3 style={styles.h3}>Right to Deletion</h3>
          <p style={styles.p}>
            You have the right to request deletion of your personal data, subject to certain legal obligations. We will delete your account data from our systems upon request.
          </p>

          <h3 style={styles.h3}>Right to Opt-Out</h3>
          <p style={styles.p}>
            You can opt out of data collection by not creating an account. You can also disable Google Analytics cookies in your browser settings.
          </p>

          <h3 style={styles.h3}>How to Exercise Your Rights</h3>
          <p style={styles.p}>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:jhf17@icloud.com" style={styles.link}>jhf17@icloud.com</a> with your request. We will respond within 30 days.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Cookies and Tracking</h2>

          <h3 style={styles.h3}>What Cookies We Use</h3>
          <p style={styles.p}>
            Our website uses the following types of cookies:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Supabase Session Cookies</strong> — Used to keep you logged into your account</li>
            <li style={styles.li}><strong>Google Analytics Cookies</strong> — Used to anonymously track website usage and behavior</li>
          </ul>

          <h3 style={styles.h3}>What We Don't Use</h3>
          <p style={styles.p}>
            We do not use advertising cookies, tracking cookies from third-party advertisers, or any cookies that identify you personally for marketing purposes.
          </p>

          <h3 style={styles.h3}>Managing Cookies</h3>
          <p style={styles.p}>
            You can control cookies in your browser settings. Disabling Supabase session cookies will log you out of your account. Disabling Google Analytics cookies will opt you out of analytics tracking.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Data Security</h2>

          <h3 style={styles.h3}>Encryption in Transit</h3>
          <p style={styles.p}>
            All data transmitted between your browser and our servers is encrypted using HTTPS (TLS 1.2+). This prevents third parties from intercepting your information.
          </p>

          <h3 style={styles.h3}>Encryption at Rest</h3>
          <p style={styles.p}>
            All user data stored in Supabase is encrypted at rest using AES-256 encryption.
          </p>

          <h3 style={styles.h3}>API Security</h3>
          <p style={styles.p}>
            Sensitive information like API keys and database credentials are stored as environment variables on our server and are never exposed to the browser.
          </p>

          <h3 style={styles.h3}>Password Security</h3>
          <p style={styles.p}>
            Passwords are hashed using bcrypt and are never stored in plain text.
          </p>

          <h3 style={styles.h3}>Limitations</h3>
          <p style={styles.p}>
            While we implement industry-standard security measures, no system is 100% secure. We cannot guarantee absolute security, but we are committed to protecting your data.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Children's Privacy</h2>
          <p style={styles.p}>
            FedBenefitsAid is not directed at anyone under 18 years old. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will delete such information promptly.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Changes to This Privacy Policy</h2>
          <p style={styles.p}>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. The "Last updated" date at the top of this page indicates when the policy was last revised.
          </p>
          <p style={styles.p}>
            If we make material changes to this Privacy Policy, we will notify you by email (if you have an account) or by posting a notice on our website before the change becomes effective. Your continued use of the website after changes are posted constitutes your acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Contact Us</h2>
          <p style={styles.p}>
            If you have questions about this Privacy Policy, your personal data, or our privacy practices, please contact us:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Email:</strong> <a href="mailto:jhf17@icloud.com" style={styles.link}>jhf17@icloud.com</a></li>
            <li style={styles.li}><strong>Website:</strong> <a href="https://fedbenefitsaid.com" target="_blank" rel="noopener noreferrer" style={styles.link}>fedbenefitsaid.com</a></li>
          </ul>
          <p style={styles.p}>
            We will respond to all privacy inquiries within 30 days.
          </p>
        </section>

        <section style={styles.section}>
          <p style={styles.disclaimer}>
            <strong>Important Note:</strong> This privacy policy is provided for transparency and to explain our data practices. We recommend consulting with a legal professional for specific legal questions about privacy and data protection.
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
    background: '#faf9f6',
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
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  updated: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: 40,
  },
  section: {
    marginBottom: 36,
  },
  h2: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  h3: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  p: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: 1.7,
    marginBottom: 12,
  },
  ul: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: 1.7,
    marginLeft: 20,
    marginBottom: 12,
  },
  li: {
    marginBottom: 8,
  },
  link: {
    color: '#7b1c2e',
    textDecoration: 'none',
    fontWeight: 500,
  },
  disclaimer: {
    fontSize: '0.9rem',
    color: '#475569',
    lineHeight: 1.6,
    padding: '16px',
    backgroundColor: '#faf9f6',
    borderLeft: '4px solid #7b1c2e',
    borderRadius: '4px',
  },
  backWrap: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #cbd5e1',
  },
  backLink: {
    color: '#7b1c2e',
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
