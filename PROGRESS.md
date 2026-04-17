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
- [ ] T2.16 Generate placeholder og-image.png
- [ ] T2.15 Verify Resend domain configuration
- [ ] T2.13 Auth layer on chat.js + send-results-email.js
- [ ] T2.1 Rebuild FEGLI Calculator with personal cost projection chart
- [ ] T2.2 Rebuild FERS Calculator results layout
- [ ] T2.3 Harden Chat system prompt
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
