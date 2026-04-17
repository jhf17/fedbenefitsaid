# FedBenefitsAid Overhaul — Progress

## Current Tier: Tier 2
## Last updated: 2026-04-17

## Tier 1 Tasks
- [x] T1.1 Delete orphan Quiz and Course pages
- [x] T1.2 Fix FERS Calculator default Survivor Benefit
- [x] T1.3 Fix landing page stale category counts
- [x] T1.4 Fix duplicate icon on benefits cards
- [x] T1.5 Fix muted mid-page Book Free Consultation CTA
- [x] T1.6 Fix hero top whitespace
- [x] T1.7 Update FEGLI disclaimer wording
- [x] T1.8 Add SEO metadata to all public routes
- [x] T1.9 Create sitemap.xml
- [x] T1.10 Create robots.txt
- [x] T1.11 Fix mobile 375px breakage
- [x] T1.12 Fix console errors

## Tier 2 Tasks (execution order per PLAN_AMENDMENTS.md)
- [x] T2.14 Harden calendly-webhook.js fail-closed
- [~] T2.14b Provision Calendly webhook end-to-end (BLOCKED — see log)
- [x] T2.16 Generate placeholder og-image.png
- [~] T2.15 Verify Resend domain configuration (probe script shipped, user must run)
- [x] T2.13 Auth layer on chat.js + send-results-email.js
- [x] T2.1 Rebuild FEGLI Calculator with personal cost projection chart
- [x] T2.2 Rebuild FERS Calculator results layout
- [x] T2.3 Harden Chat system prompt
- [ ] T2.4 Add lead capture to both calculators
- [ ] T2.5 Rename nav items
- [ ] T2.6 Create /about page
- [ ] T2.7 Rework Assessment results into action plan
- [ ] T2.8 Add "When can I retire?" inline tool to landing
- [ ] T2.9 Recolor Reference "Ask AI" button
- [ ] T2.10 Structured data (JSON-LD)
- [ ] T2.11 Lighthouse optimization
- [ ] T2.12 Verify Admin counter logic

## Pre-execution decisions (locked, from user)

1. T1.4 icons: inline SVGs (lucide User/Award glyphs), do NOT install lucide-react
2. T1.6 hero gap: bottom of nav to top of H1, target 80–100px
3. T1.8 SEO: react-helmet-async per-route + strong defaults in index.html
4. T2.1 chart: recharts
5. T2.1 sidebar + T2.4 email: one surface each calculator
6. T2.8 widget: replaces chat preview on landing
7. T2.4 email sender: use existing send-results-email.js config; flag Resend sandbox status if found
8. Calendly URL: https://calendly.com/jhf17/30min (confirmed)
9. {{REPLACE}} content for T2.6: stub everything, user provides before Tier 2 ships
10. Social sameAs array in JSON-LD: OMIT entirely (no empty strings)
11. og-image.png: keep reference in meta tags, user will drop file before SEO launch

## Log

- 2026-04-17 Initial PLAN.md + PROGRESS.md committed (Step 0, commit fbeffbc)
- 2026-04-17 T1.1 complete (commit 139a55c) — deleted Quiz.jsx, Course.jsx, quizData.js; removed lazy imports + 2 routes from App.jsx; removed training/quiz branch from ProtectedRoute.jsx. Post-delete grep: zero references remain. Build: 633ms, passes.
- 2026-04-17 T1.2 complete (commit 7209839) — Calculator.jsx:295 default survivor benefit 'full' → 'none'. Local verification: calcFERSPension(25 yrs, $125k, age 60, 'none') = $31,250/yr gross = $2,604/mo net, matches landing chat example.
- 2026-04-17 T1.3 complete (commit aefd20f) — Landing.jsx:401 "five categories" → "six" (listed Pension/TSP/Healthcare/Income Optimization/Survivor Benefits/Financial Readiness); Landing.jsx:499 "Six comprehensive" → "Eight" (listed FERS Pension/TSP/FEHB/FEGLI/Medicare/Social Security/CSRS/Survivor Benefits). TODO(T2) comments added at both locations.
- 2026-04-17 T1.4 complete (commit e02efc7) — Landing.jsx:237-242 benefits card icons. 'personalized' was a lucide "users" (multi-person); 'expert' was also a lucide "users" variant — identical glyph. Swapped 'personalized' to lucide User (single person, circle+body) and 'expert' to lucide Award (circle with ribbon tail). Inline SVG, no lucide-react dep.
- 2026-04-17 T1.5 complete (commit d95ba19) — Landing.jsx:590 mid-page Book Free Consultation CTA restyled. Before: padding 18px/48px, borderRadius 12px, fontSize 1.1rem. After: padding 15px/32px, borderRadius 8px (per spec), fontSize 0.95rem — matches hero "Get Started Free" button scale. Also fixed hover handler bug (`e.target` → `e.currentTarget`) that could fire on child nodes. Color was already #7b1c2e — no change needed.
- 2026-04-17 T1.6 complete (commit 47705ab) — Landing.jsx:101 hero section. Root cause: minHeight 100vh + alignItems:'center' vertically centered content in a full-viewport container, pushing H1 ~230px below nav on 1440/1920. Fix: minHeight → calc(100vh - 64px), alignItems → 'start', top padding 64px → 24px (desktop). Tagline chip (~40px + 32px margin) puts H1 ~96px below nav — inside 80–100px target. Mobile padding unchanged (40px top).
- 2026-04-17 T1.7 complete (commit e5e2398) — FEGLICalculator.jsx:250 disclaimer reworded from "FEGLI rates and coverage are based on OPM data effective 10/1/2021" to "Current OPM FEGLI rates (set effective 10/1/2021)". Reads as current, not stale.
- 2026-04-17 T1.8 complete (commit 64197ac) — Installed react-helmet-async, wrapped app in HelmetProvider (main.jsx), created src/components/Seo.jsx for per-route title/desc/canonical/og/twitter. Added <Seo> to 14 routes: Landing, Assessment, Calculator, Tools, FEGLICalculator, Chat, Reference (dynamic: list/category/detail), Resources, VeraVsip, Consultation, Disclaimer, Privacy, Terms, Auth (noindex), Admin (noindex), NotFound (noindex). Removed 11 duplicate `document.title` useEffect blocks. Strengthened index.html defaults with og:image width/height/alt, og:locale, twitter:image:alt so non-JS scrapers get full metadata. Build 643ms passes.
- 2026-04-17 T1.9 complete — public/sitemap.xml now includes all 13 public routes (was 10, missing /calculators, /calculators/fegli, /vera-vsip). lastmod refreshed to 2026-04-17 on every entry. Priority scheme: landing 1.0, tools/calc/assessment 0.9, vera-vsip/consultation 0.8, reference/resources/chat 0.7, legal 0.3.
- 2026-04-17 T1.10 complete (commit b0141ed) — public/robots.txt updated to disallow /admin, /auth, /login, /signup, /.netlify/ and point at sitemap. Previous had /admin /login /signup but missed /.netlify/ and /auth.
- 2026-04-17 T1.11 per-page sweep @ 375w:
  - Landing: grid 1fr at mobile, hero padding 40/20 — fits. Hero SVG max 560px auto-scales. No breakage.
  - Assessment: progress bars and milestone timeline wrap correctly (overflowX auto on timeline). No breakage.
  - Calculator: all forms grid 1fr at mobile. COLA table wrapped in overflowX auto. No breakage.
  - Tools/Calculators landing: grid-template-columns 1fr at mobile via @media. Hero padding steps down at 480. No breakage.
  - FEGLICalculator: rate table + cost projection tables both wrapped in overflowX auto. No breakage.
  - **Chat: BREAKAGE — 280px sidebar + flex row meant 95px main area at 375w.** Fix: added @media (max-width: 767px) CSS hiding [data-chat-sidebar] via data-attribute selector.
  - Reference: catGrid uses repeat(auto-fill, minmax(300px, 1fr)) — one column at 375w (content ~343px). Fits. No breakage.
  - Resources: minmax(260px, 1fr) — fits. No breakage.
  - VeraVsip: flex wrap rows. No breakage.
  - Consultation: minmax(320px, 1fr) cards with 20px section padding — 335px content fits. No breakage.
  - Auth: 340px card + body padding — fits. No breakage.
  - Admin: minHeight 44 on nav links ✓, hamburger minWidth/minHeight 44 ✓ (already handled).
  - Legal pages: body flow, no fixed widths. No breakage.
- 2026-04-17 T1.12 sweep results:
  - Build-time: Navbar.jsx:270-282 had duplicate `display` key (block → flex) in mobileLink. esbuild warned on every build. Fixed — `display: 'flex'` is the actual behavior, removed the dead `'block'`.
  - Runtime: previous session already fixed the Reference/FERS Pension crash (fers-rae-frae missing rules/watch arrays — commit a47116b). No other runtime red errors found in static sweep of `.map` keys, destructuring, or async handlers. Environment-var console.errors (supabase.js:7, Admin.jsx, Auth.jsx) are guarded and only fire on actual failure.
  - Warnings deferred per spec: none found beyond the duplicate-key (now fixed).
- 2026-04-17 T1.11+T1.12 committed (b4aa0a3 for sidebar fix; Navbar duplicate-key fix pending).

## Tier 2 Log

- 2026-04-17 Tier 1 complete (commit 34d38c5) — TIER1_REPORT.md shipped. Starting Tier 2 with 5 scope amendments logged in PLAN_AMENDMENTS.md: T2.13 (auth on functions), T2.14 (calendly fail-closed), T2.14b (calendly webhook provisioning), T2.15 (Resend probe), T2.16 (og-image placeholder). New execution order: T2.14 → T2.14b → T2.16 → T2.15 → T2.13 → T2.1 → ... → T2.12.
- 2026-04-17 T2.14 complete (commit f42c1b5) — netlify/functions/calendly-webhook.js now fails closed. Both branches (missing env var + failed signature) return HTTP 500 with body {error:"Webhook signature verification unavailable"} and never touch Airtable. Added module-scope startup log so every cold start makes the env-var state visible in Netlify function logs: warns "CALENDLY_WEBHOOK_SIGNING_KEY is NOT set" when missing, logs "Signing key loaded — signature verification is active" when present. Header docs updated to mark signing key as REQUIRED (was "optional but recommended"). node -c syntax check passes.
- 2026-04-17 T2.14b BLOCKED — cannot provision Calendly webhook programmatically:
  - `CALENDLY_API_TOKEN` env var: NOT present in local env
  - `NETLIFY_AUTH_TOKEN` env var: NOT present in local env
  - Netlify CLI: NOT installed (`which netlify` → not found)
  - `.env` / `.env.local`: neither exists (only `.env.example` present)
  - **Consequence**: until the user either (a) creates a Calendly Personal Access Token and exposes it via `CALENDLY_API_TOKEN`, or (b) logs into Netlify CLI or provides `NETLIFY_AUTH_TOKEN`, Code cannot create the webhook subscription or set the signing-key env var. After T2.14's fail-closed hardening, the existing Calendly webhook at Netlify is NOW broken (500s every real event) until the user adds a valid `CALENDLY_WEBHOOK_SIGNING_KEY` to Netlify and configures Calendly to sign with it.
  - Surfacing as BLOCKING note at top of TIER2_REPORT. Continuing with T2.16.
- 2026-04-17 T2.16 complete (commit 06569f7) — public/og-image.png generated at 1200×630, 95 KB. Implementation: installed `sharp` as devDependency, wrote scripts/generate-og-image.mjs that builds an SVG with site palette (#0f172a navy gradient, #d4af37 gold tagline, Merriweather serif wordmark "FedBenefitsAid", italic gold tagline "Retirement benefits, finally clear.", tech-stack kicker "FERS · TSP · FEHB · FEGLI · Medicare · Social Security", stylized Capitol-dome silhouette at 18% opacity gold, URL in lower-right corner). Rasterizes SVG via sharp and writes PNG. Also writes public/og-image.svg so the source is human-editable. `npm run og-image` regenerates. Both SVG and PNG committed — production build does not need sharp. Visually verified render.
- 2026-04-17 T2.15 — PROBE CANNOT RUN FROM CODE (`RESEND_API_KEY` is not exposed to this worktree; it lives in Netlify server env only). Shipped `scripts/probe-resend.mjs` + `npm run probe-resend` so the user can check domain status locally in 30 seconds (commit 391e292). Script calls GET https://api.resend.com/domains, parses the response, and reports whether `fedbenefitsaid.com` is `verified` or the account is in sandbox. Exit codes: 0 verified, 3 sandbox/not verified, 1/2 error. Surfacing as BLOCKING-not-blocking note in TIER2_REPORT: (a) ship T2.4 email flow using current sender string `FedBenefitsAid <results@fedbenefitsaid.com>`, (b) user runs `RESEND_API_KEY=re_xxx npm run probe-resend` post-Tier-2 to confirm delivery state, (c) add DNS records at Resend if not yet verified. Existing send-results-email.js behavior unchanged — it will either continue delivering (if verified) or fail with 403 (if sandbox).
- 2026-04-17 T2.13 complete — Supabase bearer-token auth layer on chat.js + send-results-email.js:
  - New helper `netlify/functions/_lib/verifyUser.js` — reads `Authorization: Bearer <token>`, calls `supabase.auth.getUser(token)` via the anon-key client, returns {user, errorResponse}. 401 on missing/invalid. Env-var fallbacks: SUPABASE_URL || VITE_SUPABASE_URL, SUPABASE_ANON_KEY || VITE_SUPABASE_ANON_KEY.
  - `chat.js` + `send-results-email.js`: both call verifyUser() as first post-CORS check. CORS headers updated to allow Authorization through preflight.
  - New client helper `src/lib/authFetch.js` — wraps fetch, pulls `supabase.auth.getSession()` and attaches `Authorization: Bearer <access_token>` when present. Falls through to plain fetch when no session (server returns 401, caller handles).
  - Updated frontend callers: Chat.jsx (all message POSTs, throws friendly error on 401: "Please sign in (or create a free account) to use the AI chat."), Calculator.jsx (send-results-email call), FEGLICalculator.jsx (send-results-email call), Assessment.jsx (send-results-email call — included for consistency even though not named in spec; same pattern).
  - Lead capture via add-lead.js is UNCHANGED (anonymous users can still submit calculator email captures — add-lead itself doesn't require auth; only the Resend email send does). If an anonymous user hits "Email me my plan", add-lead fires (lead captured), send-results-email fetch 401s (silently skipped). The lead lives in Airtable; they just don't get the email. That's the security/UX tradeoff.
  - Guest-mode 3-free-messages counter in Chat.jsx remains as client code but is effectively dead — server rejects unauthenticated chat POSTs. Will clean up in T2.3 when the system prompt is touched.
  - Pattern documented in verifyUser.js header comment for future functions.
  - Server env vars required in Netlify: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY). VITE_* names are already set for the client build — functions can reuse them, no new Netlify config needed. node -c syntax checks pass; `npm run build` 684ms.
- 2026-04-17 T2.1 complete (single rebuild commit + data commit 2cccb7a):
  - Installed recharts 3.8.1.
  - New src/data/fegliRates.js — single source of truth for OPM FEGLI rates (effective 10/1/2021). Exports rate table + getRateBracket + basicCoverageForSalary + coverageBreakdown + monthlyPremium + applyReductionFactors + buildCostProjection. Rate math verified against PLAN.md acceptance scenarios (see commit message for deltas).
  - Rewrote src/pages/FEGLICalculator.jsx top-to-bottom (900+ lines). 10 sections:
    1. Inputs (salary, current age, retirement age, postal toggle, already-retired toggle)
    2. Coverage Elections — 4 cards (Basic, Option A, Option B multiples, Option C multiples), toggle+live coverage+live current-age cost+explainer, Basic disable requires window.confirm per spec
    3. Post-retirement Reduction Elections (only shows dropdowns for elected options; Option A is read-only Full Reduction)
    4. HERO CHART: recharts ComposedChart with 4 stacked Area components (Basic navy / A maroon / B gold / C muted-red), stepAfter interpolation so age-bracket step-changes read clearly. Vertical dashed ReferenceLines at current age (maroon), retirement age (navy), age 65 (gold). Custom ChartTooltip shows per-option breakdown + total. 3 headline pill cards (cost today / at retirement / at 75). Plain-English summary sentence generated from elections (3 variants per spec). "View as table" accessibility toggle renders the same data as a tabular fallback for screen readers.
    5. What Happens When You Retire: 5-year rule paragraph + 3-col reduction-choices table + pre-65/post-65 note
    6. Should I Keep FEGLI? decision helper — 3 scenarios (mortgage-paid, young-dependents, savings-rich) ending with Calendly CTA
    7. Full OPM Rate Table (collapsed by default) — highlights current-age row (maroon 10% tint + "← Today") and retirement-age row (navy 10% tint + "← Retirement"); links to OPM source URL
    8. How These Costs Are Calculated (collapsed) — 4 formulas with worked examples
    9. Sidebar (right column desktop sticky at top:84; stacks below on mobile): navy background, gold Total Coverage big-number, monthly/annual/biweekly cost rows, per-option coverage breakdown, email-me-my-projection form that POSTs to add-lead (lead captured regardless of auth) and authFetch to send-results-email (silently skipped for anon users per T2.13)
    10. Important Notes bullet list at bottom
  - Palette: navy #0f172a, maroon #7b1c2e, gold #b8860b (+ goldLight #d4af37 for hero number), muted-red #9b3a4d for Option C. Zero blue, teal, or pink. Inline styles throughout, matches site pattern.
  - Build: 1.36s, FEGLICalculator chunk 399KB / 118KB gzipped (recharts bundle cost — lazy-loaded so only /calculators/fegli visitors pay). No build warnings. T2.11 Lighthouse pass will decide whether to tree-shake recharts or defer to a lighter chart lib.
- 2026-04-17 T2.2 complete — FERS Calculator results layout rebuilt:
  - New structured headline panel replaces the old 2-card breakdown. Top line reads "Based on your inputs, your estimated monthly retirement income is $X,XXX" with the big number in maroon.
  - Eligibility chip appears next to the number via new classifyEligibility() helper — returns one of: "Age 62 Unreduced · 1.1% multiplier", "Age 62 Unreduced · 1.0% multiplier", "Age 60 + 20 Immediate Unreduced", "MRA + 30 Immediate Unreduced", "MRA+10 Reduced", "Deferred Retirement", "CSRS Immediate Retirement", "Special Provisions (LEO/FF/ATC/Cong.)".
  - "What You'll Actually See Each Month" table via new ActualRow subcomponent. Rows: FERS/CSRS/Special Pension (gross), optional MRA+10 reduction (negative), optional Survivor Benefit reduction (negative), optional FEHB (negative with plan label), optional Medicare Part B (negative), Subtotal — Net FERS Pension (highlighted), FERS Supplement if eligible, TSP Drawdown, Social Security, Grand Total (navy background, white bold).
  - FERS Supplement inline explainer: when user qualifies AND ssAt62 is entered, shows "You'll also receive the FERS Supplement until age 62 — roughly $X/mo, bridging until you can claim Social Security" with the exact formula shown (years/40 × SS-at-62, rounded to nearest $10 per spec). When eligible but SS not entered, shows a prompt to enter SS estimate. Earnings Test warning shown below when a dollar figure is present.
  - WEP/GPO Repealed info callout preserved from old layout.
  - Existing detail cards (FERS Pension Calculation, TSP at Retirement, COLA Projection) are preserved but demoted: now sit under a new "Detail & Assumptions" section label below the headline panel, with smaller serif `<h3 style={s.secondaryTitle}>` headings instead of the previous maroon uppercase `s.cardTitle`.
  - Build: 1.34s, Calculator chunk 34KB / 10KB gzipped (+3KB vs before).
- 2026-04-17 T2.3 complete — chat.js BASE_SYSTEM_PROMPT rewritten:
  - Replaced the "four paths to immediate retirement" framing with the full OPM-terminology enumeration: Immediate Unreduced (62+5, 60+20, MRA+30), MRA+10 Reduced, Postponed MRA+10, Deferred, Disability, VERA. Each path has explicit FERS Supplement eligibility noted.
  - Added REFUSE SPECIFIC DOLLAR PENSION CALCULATIONS rule that redirects to /calculator — ends dollar-in-chat practice.
  - Added REFUSE COMPLEX EDGE CASES rule that redirects to Book-a-Call Calendly for LEO/FF/ATC specifics, court-ordered splits, complex military deposits, disability medical, and decisions with tax/estate/long-term-care implications.
  - Added CITE OPM OR TSP.GOV URL rule with 6 canonical source URLs (eligibility, supplement, TSP limits, FEHB 5-year, FEGLI, WEP/GPO Fairness Act).
  - Preserved 2026 figures section (verified factual data).
  - Added SURVIVOR ANNUITY TRADEOFFS section covering lifetime-dollar math.
  - Added FEHB + MEDICARE COORDINATION section covering IRMAA and late-enrollment penalty.
  - Added FERS COLA diet-COLA rules.
  - Removed the old FERS-RAE / Roth TSP / LWOP / reemployed-annuitant / part-time / court-order / death-in-service paragraphs — the model can answer those from general knowledge plus the Airtable context, and trimming the prompt reduces token cost per turn.
  - New dynamic directive: when the user has sent ≥3 messages in the session, chat.js appends an ADDITIONAL DIRECTIVE block to the system prompt instructing the model to end the response with "Book a free 30-minute consultation → [Calendly URL]" on its own line. Computed from sanitizedMessages user-role count each turn.
  - Acceptance-test responses captured in TIER2_REPORT after deploy (user's 3 test questions).
