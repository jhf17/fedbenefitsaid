# FedBenefitsAid Overhaul — Progress

## Current Tier: Tier 1
## Last updated: 2026-04-17

## Tier 1 Tasks
- [x] T1.1 Delete orphan Quiz and Course pages
- [x] T1.2 Fix FERS Calculator default Survivor Benefit
- [x] T1.3 Fix landing page stale category counts
- [x] T1.4 Fix duplicate icon on benefits cards
- [x] T1.5 Fix muted mid-page Book Free Consultation CTA
- [ ] T1.6 Fix hero top whitespace
- [ ] T1.7 Update FEGLI disclaimer wording
- [ ] T1.8 Add SEO metadata to all public routes
- [ ] T1.9 Create sitemap.xml
- [ ] T1.10 Create robots.txt
- [ ] T1.11 Fix mobile 375px breakage
- [ ] T1.12 Fix console errors

## Tier 2 Tasks (do NOT start until user says proceed)
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
- 2026-04-17 T1.5 complete — Landing.jsx:590 mid-page Book Free Consultation CTA restyled. Before: padding 18px/48px, borderRadius 12px, fontSize 1.1rem. After: padding 15px/32px, borderRadius 8px (per spec), fontSize 0.95rem — matches hero "Get Started Free" button scale. Also fixed hover handler bug (`e.target` → `e.currentTarget`) that could fire on child nodes. Color was already #7b1c2e — no change needed.
