import { useEffect } from 'react'
export default function Resources() {
  useEffect(() => { document.title = 'Retirement Resources | FedBenefitsAid' }, [])

  return (
    <main style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <div style={s.badge}>Official Links &amp; Documents</div>
          <h1 style={s.h1}>Federal Benefits Forms &amp; Resources</h1>
          <p style={s.sub}>
            Direct links to official OPM, TSP, SSA, and FEHB resources — no searching required.
          </p>
        </header>

        {/* OPM Retirement Forms */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>OPM Retirement Forms</h2>
          <div style={s.grid}>
            <ResourceCard
              title="SF-3107"
              desc="FERS Application for Immediate Retirement — the primary form you submit to retire under FERS."
              href="https://www.opm.gov/forms/pdf_fill/sf3107.pdf"
              tag="FERS"
            />
            <ResourceCard
              title="SF-2801"
              desc="CSRS Application for Immediate Retirement — for employees under the Civil Service Retirement System."
              href="https://www.opm.gov/forms/pdf_fill/sf2801.pdf"
              tag="CSRS"
            />
            <ResourceCard
              title="SF-3112 Series"
              desc="FERS Disability Retirement application package — includes SF-3112A, 3112B, 3112C, and 3112D."
              href="https://www.opm.gov/retirement-services/publications-forms/formsguide/"
              tag="Disability"
            />
            <ResourceCard
              title="SF-3100"
              desc="FERS Application to Make Deposit or Redeposit — used for buying back civilian or military service time."
              href="https://www.opm.gov/forms/pdf_fill/sf3100.pdf"
              tag="Service Credit"
            />
            <ResourceCard
              title="SF-3106"
              desc="Application for Refund of Retirement Deductions — used when you leave federal service before retirement eligibility and want your FERS pension contributions returned."
              href="https://www.opm.gov/forms/pdf_fill/sf3106.pdf"
              tag="Refund"
            />
            <ResourceCard
              title="RI 92-19"
              desc="Election of Insurable Interest Annuity or Survivor Annuity — used to add or change survivor benefits after retirement."
              href="https://www.opm.gov/forms/pdf_fill/ri92-19.pdf"
              tag="Survivor Benefits"
            />
            <ResourceCard
              title="OPM Retirement Center"
              desc="Complete list of all OPM retirement forms, publications, and guides in one place."
              href="https://www.opm.gov/retirement-services/"
              tag="All Forms"
            />
          </div>
        </section>

        {/* Life Insurance & Beneficiary Forms */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Life Insurance &amp; Beneficiary Forms</h2>
          <div style={s.grid}>
            <ResourceCard
              title="SF-2823"
              desc="Designation of Beneficiary for FEGLI life insurance — ensures your life insurance goes to the right person."
              href="https://www.opm.gov/forms/pdf_fill/sf2823.pdf"
              tag="FEGLI"
            />
            <ResourceCard
              title="SF-2818"
              desc="Continuation of Life Insurance Coverage — used to elect FEGLI continuation into retirement."
              href="https://www.opm.gov/forms/pdf_fill/sf2818.pdf"
              tag="FEGLI"
            />
            <ResourceCard
              title="SF-2817"
              desc="Life Insurance Election — used to elect, decline, or change FEGLI coverage."
              href="https://www.opm.gov/forms/pdf_fill/sf2817.pdf"
              tag="FEGLI"
            />
            <ResourceCard
              title="FEGLI Program Guide"
              desc="Complete guide to Federal Employees Group Life Insurance — eligibility, coverage amounts, costs, and retirement options."
              href="https://www.opm.gov/healthcare-insurance/life-insurance/"
              tag="Reference"
            />
          </div>
        </section>

        {/* TSP Resources */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>TSP (Thrift Savings Plan)</h2>
          <div style={s.grid}>
            <ResourceCard
              title="TSP Account Login"
              desc="Access your TSP account to check balances, change contribution allocations, manage loans, and set up withdrawals."
              href="https://www.tsp.gov/tsp/login.html"
              tag="Account Access"
              highlight
            />
            <ResourceCard
              title="TSP-3: Beneficiary Designation"
              desc="Designate who receives your TSP account if you die. Critical to keep current after life events."
              href="https://www.tsp.gov/forms/tsp-3.pdf"
              tag="Beneficiary"
            />
            <ResourceCard
              title="TSP-70: Full Withdrawal"
              desc="Request a full withdrawal from your TSP account after separation or retirement."
              href="https://www.tsp.gov/forms/tsp-70.pdf"
              tag="Withdrawal"
            />
            <ResourceCard
              title="TSP Publications &amp; Forms"
              desc="All TSP forms, fact sheets, and publications including the Summary of the Thrift Savings Plan booklet."
              href="https://www.tsp.gov/publications/"
              tag="All Resources"
            />
            <ResourceCard
              title="TSP Contribution Election"
              desc="Change your TSP contribution amount or type through your agency's HR system (MyPay for military, Employee Express for most civilian agencies)."
              href="https://www.tsp.gov/making-contributions/"
              tag="Contributions"
            />
          </div>
        </section>

        {/* Social Security */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Social Security</h2>
          <div style={s.grid}>
            <ResourceCard
              title="my Social Security Account"
              desc="Get your personalized Social Security earnings record and benefit estimates. Essential for retirement planning — see your projected benefit at 62, FRA, and 70."
              href="https://www.ssa.gov/myaccount/"
              tag="My Account"
              highlight
            />
            <ResourceCard
              title="SSA Benefit Calculators"
              desc="Official SSA calculators to estimate your retirement, disability, and survivors benefits based on your earnings record."
              href="https://www.ssa.gov/benefits/calculators/"
              tag="Calculators"
            />
            <ResourceCard
              title="WEP &amp; GPO Information"
              desc="Windfall Elimination Provision and Government Pension Offset rules — critical for CSRS employees who also earned Social Security credits."
              href="https://www.ssa.gov/pubs/EN-05-10045.pdf"
              tag="CSRS / WEP"
            />
            <ResourceCard
              title="Apply for Social Security"
              desc="Apply online for retirement, disability, or Medicare benefits. You can apply up to 4 months before you want benefits to start."
              href="https://www.ssa.gov/apply/"
              tag="Apply"
            />
          </div>
        </section>

        {/* FEHB Health Insurance */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>FEHB Health Insurance</h2>
          <div style={s.grid}>
            <ResourceCard
              title="FEHB Plan Comparison Tool"
              desc="Compare all available FEHB health insurance plans side by side — premiums, deductibles, copays, and out-of-pocket maximums."
              href="https://www.opm.gov/healthcare-insurance/healthcare/plan-information/"
              tag="Compare Plans"
              highlight
            />
            <ResourceCard
              title="2026 FEHB Premium Rates"
              desc="Official OPM table of biweekly premium rates for all FEHB plans for the 2026 plan year."
              href="https://www.opm.gov/healthcare-insurance/healthcare/plan-information/premiums/"
              tag="Premiums"
            />
            <ResourceCard
              title="FEHB Retirement Handbook"
              desc="OPM's guide to continuing FEHB coverage into retirement — the 5-year rule, Medicare coordination, and enrollment options."
              href="https://www.opm.gov/healthcare-insurance/healthcare/reference-materials/reference/fehb-handbook/"
              tag="Retirement"
            />
            <ResourceCard
              title="FEHB Open Season"
              desc="Information about the annual open season window (typically mid-November through mid-December) to change your health plan."
              href="https://www.opm.gov/healthcare-insurance/healthcare/plan-information/open-season/"
              tag="Open Season"
            />
          </div>
        </section>

        {/* Medicare */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Medicare</h2>
          <div style={s.grid}>
            <ResourceCard
              title="Medicare.gov"
              desc="Official Medicare website — compare plans, check coverage, find providers, and manage your Medicare account."
              href="https://www.medicare.gov"
              tag="Official Site"
            />
            <ResourceCard
              title="Medicare &amp; FEHB Coordination"
              desc="OPM guide to coordinating Medicare with FEHB in retirement — when to enroll in Part B, coordination of benefits, and cost considerations."
              href="https://www.opm.gov/healthcare-insurance/healthcare/medicare/"
              tag="FEHB Coordination"
            />
            <ResourceCard
              title="Enroll in Medicare"
              desc="Apply for Medicare Part A and/or Part B through the Social Security Administration."
              href="https://www.ssa.gov/medicare/sign-up"
              tag="Enrollment"
            />
          </div>
        </section>

        {/* OPM Handbooks & Guides */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>OPM Handbooks &amp; Official Guides</h2>
          <div style={s.grid}>
            <ResourceCard
              title="FERS Retirement Guide"
              desc="The comprehensive OPM handbook for FERS employees — everything from eligibility and annuity calculation to survivor benefits and health insurance."
              href="https://www.opm.gov/retirement-services/publications-forms/csrsfers-handbook/"
              tag="FERS"
              highlight
            />
            <ResourceCard
              title="OPM Benefits Administration Letters"
              desc="Official guidance letters from OPM to HR offices — contains authoritative interpretations of benefits rules and policy updates."
              href="https://www.opm.gov/retirement-services/publications-forms/benefits-administration-letters/"
              tag="Policy Updates"
            />
            <ResourceCard
              title="Pay &amp; Leave Flexibilities"
              desc="OPM guidance on VERA, VSIP, leave buy-outs, and other separation incentive programs."
              href="https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/"
              tag="VERA/VSIP"
            />
            <ResourceCard
              title="Federal Register"
              desc="Official source for new federal regulations, including OPM rule changes affecting benefits, pay, and retirement."
              href="https://www.federalregister.gov/agencies/personnel-management"
              tag="Regulations"
            />
          </div>
        </section>

        {/* Disclaimer */}
        <div style={s.disclaimer}>
          Links open official government or plan provider websites. FedBenefitsAid is not affiliated with OPM, SSA, TSP, or any government agency. Always verify information directly with the relevant agency or a qualified federal benefits advisor.
        </div>

      </div>
    </main>
  )
}

function ResourceCard({ title, desc, href, tag, highlight }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...s.card, ...(highlight ? s.cardHighlight : {}) }}
    >
      <div style={s.cardTop}>
        <span style={{ ...s.tag, ...(highlight ? s.tagHighlight : {}) }}>{tag}</span>
        <span style={s.extIcon} aria-hidden="true">↗</span>
      </div>
      <div style={s.cardTitle}>{title}</div>
      <div style={s.cardDesc}>{desc}</div>
    </a>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', paddingBottom: 80 },
  container: { maxWidth: 960, margin: '0 auto', padding: '40px 20px' },

  header: { textAlign: 'center', marginBottom: 52 },
  badge: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1e40af',
    fontSize: '0.73rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 14px',
    borderRadius: 20,
    marginBottom: 14,
  },
  h1: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 },
  sub: { fontSize: '1rem', color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 },

  section: { marginBottom: 44 },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#1e3a5f',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '2px solid #e2e8f0',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  },

  card: {
    display: 'block',
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    padding: '18px 20px',
    textDecoration: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  cardHighlight: {
    border: '1.5px solid #bfdbfe',
    boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
  },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  tag: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: 6,
  },
  tagHighlight: { background: '#dbeafe', color: '#1e40af' },
  extIcon: { fontSize: '0.8rem', color: '#94a3b8' },
  cardTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 6 },
  cardDesc: { fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 },

  disclaimer: {
    marginTop: 40,
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    textAlign: 'center',
    maxWidth: 680,
    margin: '40px auto 0',
  },
}
