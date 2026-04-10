import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// =============================================================================
// VERA / VSIP Guidance Page
//
// ACCURACY NOTE — Every factual claim on this page is backed by a primary U.S.
// government source (OPM.gov, U.S. Code, or CFR). Citations are placed inline
// as code comments next to the content they support so future edits can be
// verified against the original source. Do NOT add facts without citations.
// =============================================================================

const navy = '#0f172a'
const navyMid = '#1e3a5f'
const maroon = '#7b1c2e'
const cream = '#faf9f6'
const textBody = '#334155'
const textMuted = '#64748b'
const border = '#cbd5e1'
const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif"
const fontSans = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"

export default function VeraVsip() {
  useEffect(() => {
    document.title = 'VERA & VSIP Guide | FedBenefitsAid'
  }, [])

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: cream, fontFamily: fontSans }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)', color: 'white', padding: '72px 20px 60px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 18 }}>
            Federal Workforce Restructuring
          </div>
          <h1 style={{ fontFamily: fontSerif, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
            VERA &amp; VSIP: Should You Take the Early-Out?
          </h1>
          <p style={{ fontSize: '1.08rem', lineHeight: 1.6, opacity: 0.88, margin: '0 0 28px', maxWidth: 680 }}>
            Agencies across DoD, SSA, Commerce, Interior, and others are actively offering Voluntary Early Retirement Authority (VERA) and Voluntary Separation Incentive Payments (VSIP). Here&rsquo;s what the statutes actually say &mdash; and the questions you need to answer before you sign.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/consultation" style={{ background: maroon, color: 'white', padding: '13px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' }}>
              Book a Consultation to Review Your Offer
            </Link>
            <Link to="/calculators" style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', display: 'inline-block' }}>
              Run a Retirement Estimate
            </Link>
          </div>
        </div>
      </section>

      <main id="main-content" role="main" style={{ maxWidth: 820, margin: '0 auto', padding: '56px 20px 40px' }}>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderLeft: `4px solid ${maroon}`, borderRadius: 8, padding: '14px 18px', marginBottom: 40, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.55 }}>
          <strong>Educational content only.</strong> This page summarizes the governing statutes and OPM guidance but does not constitute legal, tax, or financial advice. Always confirm eligibility and numbers with your agency&rsquo;s HR office and your personal annuity estimate before acting on any VERA/VSIP offer.
        </div>

        {/* What is VERA */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>What is VERA?</h2>
          <p style={pStyle}>
            <strong>Voluntary Early Retirement Authority (VERA)</strong> lets an agency lower the normal age and service requirements so more employees can retire voluntarily during a restructuring, reorganization, reduction in force, transfer of function, or downsizing event. OPM must approve the agency&rsquo;s VERA request before it can be offered to employees.
          </p>
          {/* SOURCE: OPM — Voluntary Early Retirement Authority overview
              https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-early-retirement-authority/ */}

          <h3 style={h3Style}>Eligibility</h3>
          <p style={pStyle}>Under a VERA offer, an employee is eligible to retire voluntarily if they meet one of the following combinations:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Age 50 or older with at least 20 years</strong> of creditable federal service, or</li>
            <li style={liStyle}><strong>Any age with at least 25 years</strong> of creditable federal service.</li>
          </ul>
          {/* SOURCE: 5 U.S.C. § 8336(d)(2) (CSRS) and 5 U.S.C. § 8414(b)(1)(B) (FERS);
              OPM VERA guide: https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-early-retirement-authority/vera_guide/ */}

          <p style={pStyle}>
            In addition, the employee must have been on the agency&rsquo;s rolls for at least 30 days before the date the agency requested VERA, must be serving in a position covered by the VERA plan, and must separate by the date approved by OPM.
          </p>
          {/* SOURCE: 5 CFR Part 831 Subpart N (CSRS VERA) and 5 CFR Part 842 Subpart G (FERS VERA);
              OPM VERA page (agency-rolls requirement) */}

          <h3 style={h3Style}>Is the annuity reduced?</h3>
          <p style={pStyle}>
            This is where VERA differs by retirement system, and it&rsquo;s the single most misunderstood piece of the program:
          </p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <strong>FERS:</strong> The FERS component of a VERA annuity is <em>not</em> reduced for age. An eligible FERS employee who retires under VERA receives the annuity calculated using the standard formula with no early-retirement age penalty.
            </li>
            <li style={liStyle}>
              <strong>CSRS (and the CSRS component of a CSRS-to-FERS transferee):</strong> The CSRS portion is reduced by <strong>1/6 of 1% for each full month under age 55</strong> (roughly 2% per year under 55).
            </li>
          </ul>
          {/* SOURCE: OPM VERA page — "No reduction will be applied to the FERS component of the annuity."
              CSRS reduction: 5 U.S.C. § 8339(h); OPM VERA guide.
              https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-early-retirement-authority/ */}

          <p style={{ ...pStyle, fontStyle: 'italic', color: textMuted }}>
            If you transferred from CSRS to FERS at some point in your career, you likely have both components &mdash; the CSRS piece still gets reduced if you&rsquo;re under 55; the FERS piece does not.
          </p>
        </section>

        {/* What is VSIP */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>What is VSIP?</h2>
          <p style={pStyle}>
            <strong>Voluntary Separation Incentive Payment (VSIP)</strong>, often called a &ldquo;buyout,&rdquo; is a lump-sum cash incentive an agency can offer employees to voluntarily separate during the same restructuring events that trigger VERA. Like VERA, the agency must submit a plan and receive OPM approval before offering it.
          </p>
          {/* SOURCE: OPM — Voluntary Separation Incentive Payments
              https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-separation-incentive-payments/ */}

          <h3 style={h3Style}>How much is it?</h3>
          <p style={pStyle}>
            For most Executive Branch civilian agencies, VSIP is capped at <strong>$25,000</strong>, or the amount of severance pay the employee would be entitled to receive &mdash; whichever is less. The $25,000 statutory cap has been in place since the authority was enacted in the 1990s.
          </p>
          {/* SOURCE: 5 U.S.C. § 3523(b)(3)(B) — $25,000 statutory maximum;
              OPM VSIP page: https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-separation-incentive-payments/ */}

          <p style={pStyle}>
            A separate note for Department of Defense employees: DoD operates under its own VSIP authority and its cap has historically been higher than the governmentwide civilian limit. Because DoD&rsquo;s authority has been adjusted multiple times by Congress, confirm the current DoD-specific cap with your servicing HR office before making a decision.
          </p>
          {/* NOTE: Specific DoD VSIP cap intentionally omitted. The $40,000 DoD cap
              was authorized by Public Law 114-328 on a temporary basis and has since
              lapsed; we could not verify a current DoD-specific dollar figure against
              a primary source as of publication. Direct readers to HR rather than
              printing a number we cannot stand behind. */}

          <h3 style={h3Style}>Is VSIP taxed?</h3>
          <p style={pStyle}>
            Yes. VSIP is treated as wages for tax purposes and is subject to federal income tax withholding, Social Security (FICA), and Medicare taxes. State income tax may also apply. The $25,000 figure is the <em>gross</em> amount &mdash; your check will be noticeably smaller after withholding.
          </p>
          {/* SOURCE: 5 U.S.C. § 3521 defines VSIP as compensation; standard federal
              wage tax treatment under IRC. OPM VSIP guide describes withholding. */}

          <h3 style={h3Style}>Who is eligible?</h3>
          <p style={pStyle}>To be eligible for a VSIP offer, an employee generally must:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Be a current Executive Branch federal employee with at least <strong>3 years of continuous service</strong>,</li>
            <li style={liStyle}>Be serving in a position covered by the agency&rsquo;s OPM-approved VSIP plan,</li>
            <li style={liStyle}>Not have received a recruitment or relocation incentive in the past 24 months, a retention incentive in the past 12 months, or a student loan repayment benefit in the past 36 months, and</li>
            <li style={liStyle}>Not be in one of the statutory ineligibility categories (for example, reemployed annuitants, employees receiving disability retirement, or employees who have already received a separation incentive).</li>
          </ul>
          {/* SOURCE: 5 U.S.C. § 3521(1) (definition of "employee"); 5 U.S.C. § 3523(b)(3)(C)-(F) (incentive-repayment bars);
              5 CFR Part 576; OPM VSIP page (eligibility summary). */}
        </section>

        {/* VERA and VSIP are separate */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>VERA and VSIP are separate programs</h2>
          <p style={pStyle}>
            This is one of the most common points of confusion. VERA and VSIP share a purpose &mdash; helping agencies voluntarily reduce headcount &mdash; but they are authorized by different statutes and approved separately by OPM. Depending on what your agency requested and what you&rsquo;re eligible for, you may be offered:
          </p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>VERA only</strong> (an earlier retirement, but no cash incentive),</li>
            <li style={liStyle}><strong>VSIP only</strong> (a cash incentive to separate, but you retire or resign under normal rules),</li>
            <li style={liStyle}><strong>Both VERA and VSIP</strong> (early retirement <em>plus</em> a lump-sum payment), or</li>
            <li style={liStyle}><strong>Neither</strong> &mdash; your position or career level may not be covered by the agency&rsquo;s plan at all.</li>
          </ul>
          <p style={pStyle}>
            Read your offer letter carefully. It will specify which authority or authorities apply to you, the separation date window, and the exact dollar amount being offered.
          </p>
          {/* SOURCE: VERA under 5 U.S.C. §§ 8336(d), 8414(b); VSIP under 5 U.S.C. §§ 3521–3525.
              Separate statutory authorities; separate OPM plan approvals. */}
        </section>

        {/* 5-year FEHB rule */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>The 5-year FEHB rule still applies</h2>
          <p style={pStyle}>
            Taking VERA does not waive the <strong>5-year FEHB enrollment rule</strong>. To carry your Federal Employees Health Benefits coverage into retirement, you generally must have been enrolled in FEHB continuously for the 5 years immediately preceding your retirement date (or since your first opportunity to enroll, if that is less than 5 years).
          </p>
          {/* SOURCE: 5 U.S.C. § 8905(b); OPM FEHB Handbook — continuation of coverage in retirement.
              https://www.opm.gov/healthcare-insurance/healthcare/reference-materials/reference/continuation-of-enrollment/ */}

          <p style={pStyle}>
            If you&rsquo;re close to the 5-year mark &mdash; say, you enrolled in FEHB four years and nine months ago &mdash; taking a VERA offer with an imminent separation date could cost you the ability to keep FEHB for life. OPM has a limited waiver authority, but it is rarely granted. Check your enrollment history with your HR office <em>before</em> you accept.
          </p>
          {/* SOURCE: OPM — FEHB continuation-of-coverage guidance; statutory waiver authority in 5 U.S.C. § 8905(b)(1)(B). */}
        </section>

        {/* 5-year VSIP repayment rule */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>The 5-year VSIP repayment rule</h2>
          <p style={pStyle}>
            If you accept a VSIP and later return to federal service &mdash; as an employee or even as a personal services contractor &mdash; within <strong>5 years of your separation date</strong>, you must repay the <em>entire</em> VSIP amount, before your first day back on the job, to the agency that paid it.
          </p>
          {/* SOURCE: 5 U.S.C. § 3524 — repayment of VSIP;
              OPM VSIP page: "An employee who receives a VSIP and later accepts employment for compensation with the Government of the United States within 5 years of the date of separation... must repay the entire amount of the VSIP to the agency that paid it before the individual's first day of reemployment." */}

          <p style={pStyle}>
            There is a waiver possibility for emergency hiring needs (for example, an agency head waiver), but it is not something you should count on. Assume the repayment rule will apply to you if you accept a buyout.
          </p>
          {/* SOURCE: 5 U.S.C. § 3524(b) — waiver authority. */}
        </section>

        {/* How to evaluate */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>How to evaluate a VERA/VSIP offer</h2>
          <p style={pStyle}>
            A VERA/VSIP decision is one of the largest financial decisions most federal employees will ever make. Before you sign anything, work through these items in order:
          </p>
          <ol style={{ ...ulStyle, paddingLeft: 24 }}>
            <li style={liStyle}>
              <strong>Get an official annuity estimate from your HR office.</strong> Not the GRB Platform screenshot &mdash; an actual estimate that uses your exact retirement date, high-3, service computation date, and sick-leave balance. Ask for both the VERA date and a &ldquo;what if I wait and retire normally&rdquo; date so you can compare.
            </li>
            <li style={liStyle}>
              <strong>Confirm your FEHB 5-year status.</strong> If you are not yet vested in FEHB for retirement, taking VERA now may permanently cost you retiree health coverage. This alone can be worth more than a $25,000 VSIP over a lifetime.
            </li>
            <li style={liStyle}>
              <strong>Model the income gap.</strong> VERA gives you an annuity today; the question is whether the annuity, the FERS Supplement (if FERS and under 62), your TSP, and &mdash; eventually &mdash; Social Security will cover your spending. Work through the full picture, not just year one.
            </li>
            <li style={liStyle}>
              <strong>Check the VSIP net, not the gross.</strong> $25,000 before federal income tax, FICA, Medicare, and state tax can be closer to $16,000&ndash;$18,000 in many jurisdictions. Plan around the after-tax number.
            </li>
            <li style={liStyle}>
              <strong>Understand the TSP withdrawal rules for your age.</strong> If you separate in or after the year you turn 55 (50 for certain special-category employees), you can take penalty-free TSP withdrawals under the IRS &ldquo;rule of 55&rdquo; equivalent for governmental plans. If you leave earlier, pre-59&frac12; distributions may incur a 10% tax penalty.
            </li>
            <li style={liStyle}>
              <strong>Talk to someone who doesn&rsquo;t get paid to sell you products.</strong> An objective, fee-only review of your offer is worth far more than the time it takes.
            </li>
          </ol>
          {/* NOTE: Items 1-5 are general evaluation guidance, not statutory claims.
              Rule-of-55 TSP reference: IRC § 72(t)(2)(A)(v) and TSP Booklet "Withdrawing From Your TSP Account for Separated and Beneficiary Participants" (OPM/TSP.gov). */}
        </section>

        {/* Pending legislation */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>Pending legislation: H.R. 7256</h2>
          <p style={pStyle}>
            In the 119th Congress, <strong>H.R. 7256 &mdash; the Federal Workforce Early Separation Incentives Act</strong>, introduced by Rep. Nick Langworthy (R-NY), would remove the $25,000 statutory VSIP cap and replace it with a cap of <strong>six months of the employee&rsquo;s base salary</strong>, subject to agency-head approval. The bill advanced through markup in the House Committee on Oversight and Government Reform in early 2026 with bipartisan support.
          </p>
          {/* SOURCE: H.R. 7256, 119th Congress — bill text on Congress.gov:
              https://www.congress.gov/bill/119th-congress/house-bill/7256/text */}

          <p style={{ ...pStyle, background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px' }}>
            <strong>This is a bill, not law.</strong> As of publication it has not passed the full House or Senate, has not been signed by the President, and has no effective date. Any VSIP offer you receive today is governed by the current $25,000 civilian cap, not by H.R. 7256.
          </p>
        </section>

        {/* CTA */}
        <section style={{ ...sectionStyle, background: '#fff', border: `1px solid ${border}`, borderRadius: 14, padding: '32px 28px', marginTop: 48 }}>
          <h2 style={{ ...h2Style, marginTop: 0 }}>Have a VERA or VSIP offer in hand?</h2>
          <p style={pStyle}>
            Book a 30-minute consultation and we&rsquo;ll walk through your specific numbers &mdash; the annuity estimate, the FEHB math, the TSP picture, and the net VSIP check &mdash; and give you an honest read on whether taking the offer makes sense.
          </p>
          <Link to="/consultation" style={{ display: 'inline-block', background: maroon, color: 'white', padding: '13px 26px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', marginTop: 8 }}>
            Book a Free Consultation
          </Link>
        </section>

        {/* Sources list */}
        <section style={{ marginTop: 48, borderTop: `1px solid ${border}`, paddingTop: 24 }}>
          <h3 style={{ fontFamily: fontSerif, fontSize: '1rem', fontWeight: 700, color: navy, margin: '0 0 12px' }}>Primary sources</h3>
          <ul style={{ listStyle: 'disc', paddingLeft: 22, fontSize: '0.82rem', color: textMuted, lineHeight: 1.65 }}>
            <li>OPM &mdash; <a href="https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-early-retirement-authority/" target="_blank" rel="noopener noreferrer" style={{ color: navyMid }}>Voluntary Early Retirement Authority (VERA)</a></li>
            <li>OPM &mdash; <a href="https://www.opm.gov/policy-data-oversight/workforce-restructuring/voluntary-separation-incentive-payments/" target="_blank" rel="noopener noreferrer" style={{ color: navyMid }}>Voluntary Separation Incentive Payments (VSIP)</a></li>
            <li>5 U.S.C. &sect;&sect; 3521&ndash;3525 (VSIP authority and repayment)</li>
            <li>5 U.S.C. &sect; 8336(d) (CSRS VERA); 5 U.S.C. &sect; 8414(b) (FERS VERA)</li>
            <li>5 U.S.C. &sect; 8905(b) (FEHB 5-year continuation rule)</li>
            <li>5 CFR Part 576 (VSIP regulations); 5 CFR Parts 831 and 842 (VERA regulations)</li>
            <li><a href="https://www.congress.gov/bill/119th-congress/house-bill/7256/text" target="_blank" rel="noopener noreferrer" style={{ color: navyMid }}>H.R. 7256, 119th Congress</a> (pending VSIP cap legislation)</li>
          </ul>
        </section>

      </main>
    </div>
  )
}

const sectionStyle = { marginBottom: 44 }
const h2Style = { fontFamily: fontSerif, fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 800, color: navy, margin: '0 0 14px', letterSpacing: '-0.01em', lineHeight: 1.25 }
const h3Style = { fontFamily: fontSerif, fontSize: '1.1rem', fontWeight: 700, color: navyMid, margin: '24px 0 10px' }
const pStyle = { fontSize: '1rem', lineHeight: 1.7, color: textBody, margin: '0 0 14px' }
const ulStyle = { margin: '0 0 14px', paddingLeft: 22, color: textBody, fontSize: '1rem', lineHeight: 1.7 }
const liStyle = { marginBottom: 8 }
