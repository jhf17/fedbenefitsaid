# FedBenefitsAid Two-Tier Overhaul — Authoritative Spec

> This file is the authoritative spec. Do not edit during execution. If scope genuinely needs to change, create `PLAN_AMENDMENTS.md` instead.

---

## Ground rules

- Commit after each task. Format: `fix: T1.3 reconcile landing page category counts` or `feat: T2.1 rebuild FEGLI calculator`.
- Update `PROGRESS.md` after every task. Change `[ ]` to `[x]`, append to Log: `- T1.3 complete (commit abc1234) — [date]`.
- After each commit: push → wait for Netlify (~2 min) → purge Cloudflare cache → verify live. If it doesn't render, assume stale cache before assuming code problem.
- Match existing patterns. Inline styles, no new CSS frameworks, no architectural refactors.
- Palette discipline. Primary navy `#0f172a` / `#1e3a5f`, accent maroon `#7b1c2e`, neutrals only otherwise. No blue, pink, or gray as accent.
- Cite sources in commit messages and code comments whenever you touch a dollar figure, rate, or date.
- If blocked on user input (testimonials, founder bio), stub with `{{REPLACE: description}}` and log in `PROGRESS.md`. Don't stop.
- Don't touch Supabase schema, auth flow, Airtable schema, or Netlify function business logic unless a task explicitly requires it. If one seems to, pause and log.
- Between Tier 1 and Tier 2, stop and report. Do not auto-proceed.

## Decisions locked in before execution (from user, pre-T1.1)

1. **T1.4 icons** — Inline SVGs matching lucide User and Award glyphs. Do NOT install lucide-react.
2. **T1.6 hero whitespace** — Gap is between bottom of sticky nav and top of H1. Target 80–100px.
3. **T1.8 SEO** — react-helmet-async per-route PLUS strong defaults in `index.html` for non-JS scrapers.
4. **T2.1 chart** — recharts.
5. **T2.1 sidebar + T2.4 email capture** — One surface. Email CTA lives in the Section 9 sidebar (FEGLI) and in the FERS results panel (FERS).
6. **T2.8 widget** — Replaces the chat preview on landing.
7. **T2.4 email sender** — Use existing `send-results-email.js` configuration. If it's still on Resend sandbox, flag in PROGRESS.md but ship anyway.
8. **{{REPLACE}} content** — Stub everything listed in T2.6 and the Org JSON-LD founder fields. Calendly URL confirmed: `https://calendly.com/jhf17/30min`. Social sameAs array: OMIT entirely for now (do not ship empty strings). og-image.png: keep reference in meta tags, user will drop the PNG into `/public/` before SEO launch.

---

# TIER 1 — Launch blockers

## T1.1 Delete orphan Quiz and Course pages

`src/pages/Quiz.jsx` and `src/pages/Course.jsx` — both routes return 404. Before deletion, grep the repo for imports or references and remove them. Check `App.jsx` for commented-out routes referencing them. Delete the files.

## T1.2 Fix FERS Calculator default Survivor Benefit

Change the default value of the Survivor Benefit Option control from "Full (10% deduction)" to "None". Reason: the landing-page Chat example shows $2,604/mo for age 60 / 25 YOS / $125k, but the calculator currently shows $2,344/mo for identical inputs because of the silent 10% default. Setting default to "None" resolves the contradiction.

Verify: with age 60 / 25 YOS / $125k high-3, headline result now reads $2,604/mo.

## T1.3 Fix landing page stale category counts

Assessment preview currently says "5 categories." The assessment produces 6 category bars. Change copy to "six categories" and list them: Pension, TSP, Healthcare, Income Optimization, Survivor Benefits, Financial Readiness.

Reference preview currently says "Six comprehensive categories" with 7 items listed. The Reference page shows 8 cards. Change copy to "eight comprehensive categories" and list them: FERS Pension, TSP, FEHB, FEGLI, Medicare, Social Security, CSRS, Survivor Benefits.

Add a code comment at both locations: `// TODO (T2): pull these dynamically from reference/assessment config.`

## T1.4 Fix duplicate icon on benefits cards

On the landing page, "Personalized to You" and "Free Tools, Expert Access" cards share the same people icon. Assign unique lucide-react icons: `User` for Personalized to You, `Award` for Free Tools, Expert Access. Keep the existing icon on "Current and Accurate."

> Decision: Use inline SVGs matching lucide User/Award glyphs — do NOT install lucide-react.

## T1.5 Fix muted mid-page Book Free Consultation CTA

In the "Need to talk to a real person?" section, the button renders muted/pink. Restyle to match the hero "Get Started Free" button exactly: background `#7b1c2e`, white text, 8px border-radius.

## T1.6 Fix hero top whitespace

~230px of empty space between nav and hero headline at 1440px width. Reduce hero section top padding so the headline sits 80–100px below the nav. Verify at 1440px and 1920px.

## T1.7 Update FEGLI disclaimer wording

On the FEGLI Calculator page, change "FEGLI rates and coverage are based on OPM data effective 10/1/2021" to "Current OPM FEGLI rates (set effective 10/1/2021)." Reads as current, not stale.

## T1.8 SEO metadata

For every public route (Landing, Assessment, Calculator, FEGLI Calculator, Chat, Reference hub + subtopics, Resources, VERA/VSIP), add or verify:

- Unique `<title>` — pattern: `[Page Topic] | FedBenefitsAid`, 55–60 chars
- Unique `<meta name="description">` — 150–160 chars, benefit-oriented
- Open Graph tags: `og:title`, `og:description`, `og:image` (site logo for now), `og:url`, `og:type="website"`
- `<link rel="canonical">`
- On `/admin`, `/auth`, `/404`: `<meta name="robots" content="noindex,nofollow">`

Use `react-helmet-async` if not already installed; add if needed.

## T1.9 Create public/sitemap.xml

Include every public route with `<lastmod>` set to today's date. Exclude `/admin`, `/auth`.

## T1.10 Create public/robots.txt

```
User-agent: *
Disallow: /admin
Disallow: /auth
Disallow: /.netlify/
Sitemap: https://fedbenefitsaid.com/sitemap.xml
```

## T1.11 Mobile 375px breakage sweep

Load every public page at 375px width (iPhone SE). Fix only breakage: nav overflow, buttons cut off, inputs overflowing viewport, text crushed unreadable, tap targets under 44px. Do NOT polish layout. Log findings per page in `PROGRESS.md`.

## T1.12 Console error sweep

Open DevTools Console on every public page plus Admin and Auth. Fix all red errors. Warnings wait for Tier 2. Log findings in `PROGRESS.md`.

**When T1.1–T1.12 are all `[x]`, produce `TIER1_REPORT.md` at repo root. Do not proceed to Tier 2.**

---

# TIER 2 — Presentation and strategic improvements

## T2.1 Rebuild FEGLI Calculator — the hero task of Tier 2

The existing calculator has correct math. The goal is presentation: make the user's personal cost projection the hero element, with a chart that visually shows how their exact cost evolves through each age bracket given their specific elections. Reference material (full OPM rate table) is secondary — collapsed by default.

Benchmarks: match the data depth of https://annuital.com/FEGLICalculator and https://www.opm.gov/retirement-center/calculators/fegli-calculator/. Beat both on presentation. Navy/maroon palette throughout — no teal, no generic blue.

### Page structure, top to bottom

**Section 1 — Inputs** (left column desktop, stacked mobile)

- Annual gross salary (number input, required)
- Current age (number input, required)
- Planned retirement age (number input, default 62, required — drives the post-65 inflection on the chart)
- Toggle: "USPS Postal Employee"
- Toggle: "Already retired" — if on, hide retirement age input and show post-65 reduction elections immediately

**Section 2 — Coverage Elections**

Four cards, each with toggle, live coverage amount, live current-age monthly cost, one-sentence explainer.

- Basic (default ON, require confirm to disable): coverage = salary rounded up to next $1,000 + $2,000
- Option A — Standard: coverage $10,000 flat
- Option B — Additional (multiples 1–5 dropdown): coverage = salary × multiples
- Option C — Family (multiples 1–5 dropdown): $5,000 × multiples spouse + $2,500 × multiples per child

**Section 3 — Post-Retirement Reduction Elections**

Only show dropdowns for options toggled ON in Section 2.

- Basic Reduction: 75% Reduction (default) / 50% Reduction / No Reduction
- Option A Reduction: Full Reduction only (read-only with explanation why)
- Option B Reduction: Full Reduction / No Reduction
- Option C Reduction: Full Reduction / No Reduction

Elections drive the chart in Section 4 — update live on change.

**Section 4 — Your Personal Cost Projection (HERO ELEMENT)**

Primary visualization on the page. Shows user's exact monthly cost, year-by-year, based on specific inputs and elections.

Chart type: stepped line chart (FEGLI rates are flat within a 5-year bracket, step-change at each bracket boundary, potentially large step at 65 based on reductions). Use recharts LineChart with stepAfter interpolation, or custom SVG if recharts can't handle the visual cleanly.

X-axis: Age, from user's current age through 80. Ticks at every 5-year bracket boundary (35, 40, 45, 50, 55, 60, 65, 70, 75, 80) plus the user's current age and planned retirement age.

Y-axis: Monthly cost in dollars.

Required visual treatment:

- Vertical dashed maroon line at current age labeled "Today — age [X]" with data-point marker
- Vertical dashed navy line at planned retirement age labeled "Retirement — age [X]" with data-point marker
- Shaded band or marker at age 65 labeled "Age 65 — reduction elections take effect." If Full Reduction elections, line visibly steps down to $0 or near-zero. If No Reduction on B or C, line continues climbing steeply — make that visible.
- Stacked area: each option contributes a colored band (Basic = navy, Option A = maroon, Option B = gold, Option C = muted red). User sees at a glance which option drives cost at each age.
- Hover tooltip: age bracket, total monthly cost, breakdown by option for that bracket.
- Below chart, three headline pill-cards: Cost today, Cost at retirement, Cost at age 75.
- One-sentence plain-English summary below the pills, generated from selections. Examples:
  - All Full Reduction: "Your FEGLI costs drop to $0 at age 65 when reductions take effect. You'll retain roughly $[Basic 25%] of Basic coverage for life at no cost."
  - No Reduction on B: "You've elected No Reduction on Option B. Premium continues climbing after 65 — by age 75, you'll pay roughly $[amount]/month. Most retirees reduce at this age."
  - Everything No Reduction: "You're keeping all coverage at full face value. Monthly premium will be about $[X] at 65, $[Y] at 75, $[Z] at 80."

This section is visible by default — it's the primary value.

**Section 5 — What Happens When You Retire (educational)**

Three subsections:

- **A. The 5-Year Rule.** Plain-English paragraph with bolded "must have been continuously enrolled in that coverage for the 5 years immediately before retirement" clause.
- **B. Your Reduction Election Choices.** Three-column table (Option / Your Choices / What This Means) covering Basic, A, B, C. Include cost and coverage implications at age 65, 70, 75 for each choice.
- **C. Pre-65 Retiree vs Post-65 Retiree.** Brief note on when elections take effect depending on retirement age.

**Section 6 — "Should I Keep FEGLI?" Decision Helper (callout)**

Three scenarios:

- Mortgage paid off, independent kids, spouse has own income → 75% Basic Reduction usually sufficient; dropping B and C saves significantly
- Young dependents or spouse relying on your income → Consider No Reduction on Option B through 70s, note premiums escalate ~3× between 60 and 70
- Significant retirement savings + other life insurance → Full Reduction on all optional coverage often makes sense; Basic 75% becomes free at 65

End with: "These are educational heuristics, not personal advice. Book a free consultation to review your situation." Link to Calendly.

**Section 7 — Full OPM Rate Table (COLLAPSED BY DEFAULT)**

Collapsible card. Trigger label: "Show full OPM rate table (all age brackets)" with chevron icon.

When expanded:

| Age Group | Basic (per $1,000) | Option A ($10,000 flat) | Option B (per $1,000) | Option C (1× Multiple) |
|---|---|---|---|---|
| Under 35 | $0.3467 | $0.43 | $0.043 | $0.43 |
| 35–39 | $0.3467 | $0.43 | $0.043 | $0.52 |
| 40–44 | $0.3467 | $0.65 | $0.065 | $0.80 |
| 45–49 | $0.3467 | $1.30 | $0.130 | $1.15 |
| 50–54 | $0.3467 | $2.17 | $0.217 | $1.80 |
| 55–59 | $0.3467 | $3.90 | $0.390 | $2.88 |
| 60–64 | $0.3467 | $13.00 | $0.867 | $5.27 |
| 65–69 | $0.3467 | $13.00 | $1.040 | $6.13 |
| 70–74 | $0.3467 | $13.00 | $1.863 | $8.30 |
| 75–79 | $0.3467 | $13.00 | $3.900 | $12.48 |
| 80+ | $0.3467 | $13.00 | $6.240 | $16.90 |

Highlight user's current age bracket row with subtle maroon 10% opacity tint + "← Today" chip. Highlight retirement age bracket row with navy 10% opacity tint + "← Retirement" chip.

Source note: "Rates from OPM, effective October 1, 2021. [Link to official OPM rate chart]."

Store rates as named constant in `src/data/fegliRates.js` with OPM source URL in file header comment.

**Section 8 — How Costs Are Calculated (COLLAPSED BY DEFAULT)**

Collapsible card. Trigger: "How these costs are calculated". Four formulas:

- Basic: (Coverage ÷ 1,000) × monthly rate
- Option A: flat monthly rate from the table
- Option B: (salary × multiples ÷ 1,000) × monthly rate
- Option C: flat monthly rate × number of multiples

**Section 9 — Coverage Summary sidebar** (sticky on desktop)

Persistent right-column card, sticky scroll on desktop, bottom sheet on mobile:

- Total Life Insurance Coverage (big, maroon)
- Monthly Cost today
- Annual Cost today
- Biweekly Cost (small)
- Coverage Breakdown (per-option lines)
- "Email me this projection" CTA — T2.4 integration; implement here

**Section 10 — Important Notes** (small info box at bottom)

- Rates shown are monthly employee share
- Rates jump at every 5-year bracket starting at age 35 for Option A/B/C
- Basic rate is flat at every age; only coverage amount changes if salary changes
- Options can be elected or changed during Open Season or following qualifying life event
- This is an estimate — consult OPM (opm.gov) for official rates

### Styling and polish

- Typography hierarchy: chart gets large H2. Reference sections get small H4s inside collapsed containers.
- Chart must feel premium — smooth stepped lines, clear labeled axes, readable tooltips, subtle grid, maroon/navy palette.
- Mobile: chart becomes full-width above inputs. Touch-friendly tooltip. Sidebar becomes sticky bottom sheet with total monthly cost + "Email me this."
- Accessibility: add "View as table" toggle exposing same data in screen-reader-friendly table. Label all axis and data points.
- Performance: memoize cost projection computation.

### Acceptance test for T2.1

Run these four scenarios and screenshot the chart for TIER2_REPORT:

1. Age 45, $95k, Basic only, retirement 62, Basic 75% Reduction → chart shows ~$33/mo flat 45–64, then $0 at 65+
2. Age 55, $95k, Basic + Option B (1×), retirement 62, Basic 75% + B Full Reduction → ~$74 at 55–59, ~$116 at 60–64, step down to $0 at 65+
3. Age 55, $95k, Basic + Option B (1×), retirement 62, Basic 75% + B No Reduction → ~$74 at 55–59, ~$116 at 60–64, ~$132 at 65–69, ~$210 at 70–74, ~$404 at 75–79 (steep escalation visible)
4. Age 35, $95k, Basic + Option A + Option B (3×) + Option C (2×), retirement 62, all Full Reduction at 65 → full lifecycle across 45 years

## T2.2 Rebuild FERS Calculator results layout

Replace single-number headline with a structured result panel:

- Top line: "Based on your inputs, your estimated monthly retirement income is $X,XXX."
- Eligibility chip next to the number: "Immediate Unreduced" / "MRA+10 Reduced" / "Deferred" / "Age 62 Unreduced with 1.1% multiplier"
- "What You'll Actually See" table: FERS Pension (gross), Survivor Benefit reduction (if elected, negative), FEHB premium (if toggled, negative), Medicare Part B premium (if toggled, negative), Subtotal = Net FERS Pension, FERS Supplement (if eligible), TSP Monthly projected, Social Security projected, Grand Total Monthly Net Income (bold)
- FERS Supplement inline explainer when user qualifies: "You'll also receive the FERS Supplement until age 62 — roughly $[computed]/mo, bridging until you can claim Social Security." Formula: estimated SS at 62 × (FERS years ÷ 40), rounded to nearest $10.
- Demote existing detail sections (FERS Pension Calculation breakdown, COLA projections) to smaller secondary headers below the main result panel.

## T2.3 Harden Chat system prompt

Find the Chat system prompt (likely in a Netlify function or config file — grep `system` or `role: 'system'`). Replace with rules requiring:

- Enumerate all retirement paths when eligibility is the topic: Immediate Unreduced (62+5, 60+20, MRA+30), MRA+10 Reduced, Postponed MRA+10, Deferred, Disability, VERA. For any fact pattern fitting multiple paths, name each and explain tradeoffs.
- Always note FERS Supplement implications on timing questions. Postponed/deferred annuitants don't get it.
- Never invent frameworks like "four paths to immediate retirement." Use actual OPM terminology.
- Always cite an OPM or TSP.gov source URL at the end of any rule-stating response.
- Refuse specific dollar pension calculations — redirect to /calculator.
- Refuse edge cases (LEO/FF/ATC specifics, court-ordered splits, complex military deposits, disability medical criteria) — redirect to Book a Call.
- After 3 user messages in a session, append "Book a free 30-minute consultation →" to the next response.

Test with three questions and paste full responses into TIER2_REPORT:

1. "I'm 57 with 10 years of FERS service. Can I retire now, and what happens if I wait?"
2. "Full vs partial survivor annuity — how do I decide? My spouse is 3 years younger with her own pension."
3. "I'm 65 next year and retired from federal service. Part B or keep FEHB alone?"

Acceptance: response 1 must mention postponed MRA+10 explicitly. Response 2 must discuss lifetime dollar tradeoff. Response 3 must mention FEHB-Medicare coordination and IRMAA. All three must end with an OPM URL.

## T2.4 Lead capture on both calculators

On FERS Calculator and FEGLI Calculator, after results render, add secondary CTA: "Email me this projection as a PDF." On submit, POST to `/.netlify/functions/add-lead` with `Source: "Calculator - FERS"` or `"Calculator - FEGLI"`, `Status: "New"`, and user inputs + computed outputs as JSON in notes field. Send formatted HTML email with the same numbers user sees. Use existing email infrastructure if present; otherwise Resend or Netlify email integration — document choice in PROGRESS.md.

## T2.5 Rename nav items

- Reference → Benefits Library
- Resources → Forms & Links
- Meeting → Book a Call (restyled as filled maroon primary button)

Update footer links and in-body references site-wide. Keep VERA/VSIP in main nav.

## T2.6 Create /about page

Route `/about`. Sections:

- Founder photo: `{{REPLACE: headshot 400×400px}}`
- Founder name + credentials: `{{REPLACE: e.g., John Doe, ChFEBC®, RICP®, 15 years federal benefits}}`
- Relationship to Federal Market Associates: `{{REPLACE: relationship paragraph}}`
- Why this site exists: `{{REPLACE: mission paragraph}}`
- OPM disaffiliation disclaimer (reuse existing)

Link from footer and from landing-page consultation CTA ("Book with `{{REPLACE: FOUNDER_NAME}}`"). Log all `{{REPLACE}}` markers in TIER2_REPORT.

## T2.7 Rework Assessment results into action plan

Current output: score + category bars. Add "Your Prioritized Action Plan" above the bars:

- 3–5 ordered items derived from user's answers
- Each item: action statement, why it matters (one sentence), link to relevant Benefits Library subtopic, "Book a consultation about this" sub-CTA
- Examples: Q5 "No" → "Request official retirement estimate from HR (Form RI 20-80 or equivalent)." Q6 "No, didn't know" → "Ask HR for accumulated sick leave balance — converts to service credit at retirement."

Keep existing email capture firing to Airtable with Source: "Retirement Checklist".

## T2.8 "When can I retire?" inline tool on landing page

Replace one existing preview card on landing with inline interactive widget.

> Decision: replaces the **chat preview** card.

Inputs: birth date (or current age), FERS hire date (or years of service), retirement system.

Output: timeline showing eligibility milestones — MRA (compute from birth year per FERS MRA table), MRA+10 (reduced), MRA+30 (immediate unreduced), age 60+20 YOS, age 62+5 YOS, age 62+20 YOS (1.1% multiplier). Each milestone shows calendar date when user hits it, eligibility type, whether FERS Supplement applies.

## T2.9 Recolor Reference "Ask AI" button

Currently renders blue. Change to outlined maroon: border `#7b1c2e`, text `#7b1c2e`, white background. Keep "Book Free Call" as filled maroon nearby.

## T2.10 Structured data

Add JSON-LD to:

- Landing: Organization schema (name, URL, logo, founder, description, sameAs — OMIT sameAs for now per user direction; don't ship empty strings)
- Each Reference subtopic: FAQPage schema pulling questions/answers from Rules & Requirements section

## T2.11 Lighthouse optimization

Run Lighthouse on Landing, FERS Calculator, FEGLI Calculator, Assessment, Chat, Reference hub, VERA/VSIP. Report Performance / Accessibility / Best Practices / SEO before and after. Fix top 3 easy wins per page (alt text, heading hierarchy, image lazy-loading, contrast). Log in TIER2_REPORT.

## T2.12 Verify Admin counter logic

Admin shows "Consultations Booked: 0" despite visible lead with status "Consultation Booked." Find counter logic in Admin component, determine whether it filters test data or is buggy. Fix whichever. Add code comment documenting the filter rule.

**When T2.1–T2.12 all `[x]`, produce `TIER2_REPORT.md` at repo root.**

---

## Reporting format for TIER1_REPORT.md and TIER2_REPORT.md

- Task-by-task status (✓ complete / ⚠ partial / ✗ blocked with reason)
- Commits with SHA + one-line summary
- `{{REPLACE}}` markers encountered with description of what user must supply
- New issues discovered during execution (as amendments, not silent scope changes)
- For Tier 2: Lighthouse before/after scores per page, Chat response quality tests (full bodies), FEGLI chart screenshots for all four acceptance scenarios

## Resume protocol if interrupted

Next Code session:

1. Read `PLAN.md` (full spec, unchanged)
2. Read `PROGRESS.md` (done / in-progress)
3. Run `git log --oneline -30`
4. Resume from first unchecked task. Do not redo checked tasks.
5. If mid-task at interrupt (uncommitted changes in working tree), check `git status` and either complete+commit or `git stash` and restart the task cleanly.
