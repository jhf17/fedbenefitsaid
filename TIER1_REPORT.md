# Tier 1 Report — Launch Blockers

**Date**: 2026-04-17
**Scope**: 12 tasks, T1.1 through T1.12
**All tasks**: ✓ complete, pushed to `main`, verified live on `fedbenefitsaid.com`

---

## Task-by-task status

| Task | Status | Commit | Summary |
|---|---|---|---|
| T1.1 | ✓ | `139a55c` | Deleted `Quiz.jsx`, `Course.jsx`, `quizData.js`; removed lazy imports + `/training` + `/training/quiz/:topicId` routes + dead branch in `ProtectedRoute.jsx` |
| T1.2 | ✓ | `7209839` | FERS Calculator default survivor benefit `'full'` → `'none'`; age 60/25 YOS/$125k high-3 now returns the advertised $2,604/mo |
| T1.3 | ✓ | `aefd20f` | Landing "five categories" → "six" (Pension/TSP/Healthcare/Income Optimization/Survivor Benefits/Financial Readiness); "Six comprehensive" → "Eight" with all 8 reference cards listed; TODO(T2) comments for dynamic pull |
| T1.4 | ✓ | `e02efc7` | `Personalized to You` → inline lucide User glyph; `Free Tools, Expert Access` → inline lucide Award glyph; no new npm dep |
| T1.5 | ✓ | `d95ba19` | Mid-page "Book Free Consultation" CTA normalized to hero button scale (15/32 padding, 8px radius, 0.95rem, solid `#7b1c2e`); hover handler bug `e.target` → `e.currentTarget` |
| T1.6 | ✓ | `47705ab` | Hero `minHeight: 100vh` + `alignItems:'center'` → `calc(100vh - 64px)` + `'start'`; top padding 64 → 24. Tagline chip puts H1 ~96px below sticky nav (within 80–100px target) |
| T1.7 | ✓ | `e5e2398` | FEGLI disclaimer reworded from stale "...are based on OPM data effective 10/1/2021" to current "Current OPM FEGLI rates (set effective 10/1/2021)" |
| T1.8 | ✓ | `64197ac` | Installed `react-helmet-async`, added `<HelmetProvider>` wrapper (main.jsx), created `src/components/Seo.jsx`. Added `<Seo>` to 14 routes; `noindex` on `/admin`, `/login`, `/signup`, `/404`. Strengthened index.html defaults (og:image width/height/alt, og:locale, twitter:image:alt, explicit robots). Removed 11 duplicate `document.title` useEffect blocks |
| T1.9 | ✓ | `b0141ed` | `public/sitemap.xml`: 10 → 13 URLs (added `/calculators`, `/calculators/fegli`, `/vera-vsip`); `lastmod` refreshed from frozen `2026-04-08` to `2026-04-17` site-wide |
| T1.10 | ✓ | `b0141ed` | `public/robots.txt`: added `Disallow: /.netlify/` and `Disallow: /auth`; removed unnecessary `Allow: /` |
| T1.11 | ✓ | `b4aa0a3` | Mobile 375px breakage sweep. Only one real issue: Chat's 280px sidebar left ~95px of main area at 375w. Fixed with a scoped `@media (max-width: 767px) [data-chat-sidebar] { display: none }`. All other pages passed (grids collapse to 1fr on mobile, tables are wrapped in `overflowX:auto`, tap targets ≥ 44px) |
| T1.12 | ✓ | `ef26282` | Clear console warnings. Navbar.jsx mobileLink had duplicate `display` keys ('block' then 'flex') — esbuild warning on every build. Kept the `flex` that was silently winning. Runtime red errors: none found (the prior Reference/FERS-Pension crash was already fixed in `a47116b`) |

---

## Commits, chronological

1. `fbeffbc` — chore: add PLAN and PROGRESS tracking docs
2. `139a55c` — chore: T1.1 delete orphan Quiz and Course pages
3. `7209839` — fix: T1.2 default FERS survivor benefit to None
4. `aefd20f` — fix: T1.3 reconcile landing page category counts
5. `e02efc7` — fix: T1.4 unique icons on benefits cards
6. `d95ba19` — fix: T1.5 normalize mid-page Book Free Consultation CTA
7. `47705ab` — fix: T1.6 tighten hero top whitespace
8. `e5e2398` — fix: T1.7 reword FEGLI disclaimer to read current, not stale
9. `64197ac` — feat: T1.8 per-route SEO metadata via react-helmet-async
10. `b0141ed` — feat: T1.9/T1.10 refresh sitemap.xml and robots.txt
11. `b4aa0a3` — fix: T1.11 hide Chat sidebar at <768px to restore mobile chat area
12. `ef26282` — fix: T1.12 clear console warnings — Navbar duplicate display key

All 12 pushed to `origin/main` as fast-forwards.

---

## Live verification (post-deploy)

| Check | Result |
|---|---|
| `/`, `/calculator`, `/calculators`, `/calculators/fegli`, `/assessment`, `/reference`, `/resources`, `/chat`, `/vera-vsip`, `/consultation`, `/disclaimer`, `/privacy`, `/terms` | all HTTP 200 |
| `/sitemap.xml` | 200, contains **13 URLs** including `/calculators/fegli` — ✓ |
| `/robots.txt` | 200, contains `Disallow: /.netlify/` — ✓ |
| Main `index.html` | `<title>` present; `og:image:alt`, `og:image:width`, `og:image:height`, `og:locale`, `twitter:image:alt` all injected — ✓ (T1.8 non-JS defaults) |
| Main JS bundle | zero matches for `Course` or `Quiz` — ✓ (T1.1 cleanup) |
| `Calculator-*.js` chunk | contains `useState("none")` for survivor default — ✓ (T1.2) |
| `Chat-*.js` chunk | contains `data-chat-sidebar` selector for mobile hide — ✓ (T1.11) |
| `Reference-*.js` chunk | contains `"refund of contributions on separation forfeits"` (fers-rae-frae rules/watch arrays present) — ✓ (prior hotfix preserved) |
| `npm run build` | 632ms, zero warnings, zero errors — ✓ (T1.12) |

---

## `{{REPLACE}}` markers encountered

**None in Tier 1.** Tier 1 was purely structural/content fixes — no founder bio, headshot, or third-party copy required. All `{{REPLACE}}` work is concentrated in T2.6 (/about page), and the user has already confirmed stubs are acceptable until Tier 2 starts.

One incomplete asset noted (not a Tier 1 task but ships before SEO launch):
- `public/og-image.png` — 1200×630 PNG still missing. Index.html and per-route `<Seo>` tags reference `/og-image.png`; currently returns the SPA HTML fallback rather than an image. User confirmed they'll drop the PNG in before the SEO push. Not a blocker for any of T1.1–T1.12.

---

## New issues discovered during execution

These surfaced during the Tier 1 work but were **out of scope** for launch-blocker fixes. Logged here, not silently addressed:

1. **FERS Supplement eligibility display for Special Provisions** — while not a Tier 1 task, this was a real credibility bug fixed earlier (`a47116b`) along with the Reference/FERS-Pension crash that was unrelated to T1 but blocked the Reference → FERS Pension navigation path referenced in T1.3.
2. **Hero hover handlers use `e.target` not `e.currentTarget`** in Landing.jsx:114,117 — same pattern as T1.5 mid-page CTA. Fires on child span descendants. Not breakage (button has no children currently), but worth sweeping during T2 polish.
3. **`calendly-webhook.js` still fails open if `CALENDLY_WEBHOOK_SIGNING_KEY` env var is missing** (pre-existing, primer ship-blocker #4). Out of Tier 1 scope; verify env var is set in Netlify before any outbound push.
4. **`chat.js` + `send-results-email.js` have no auth in front of Anthropic/Resend** — flagged in prior audit. Will be revisited in T2.4 when adding calculator lead capture.
5. **Resend sandbox vs verified domain** — cannot verify the current Resend configuration without running the function or reading env vars; confirm before T2.4.
6. **Bundle size growth** — adding `react-helmet-async` in T1.8 pushed main bundle from 470kB to 490kB (gzipped 130kB → 137kB). Acceptable for the SEO value; can be trimmed in T2.11 Lighthouse pass.
7. **Chat page title race** — `document.title` useEffect blocks were removed in T1.8 (Helmet owns title), but on a slow connection the tab may briefly show the index.html default before Helmet sets the route title. Expected Helmet behavior; no action needed.

---

## Open for Tier 2

- **T2.1 FEGLI rebuild**: user confirmed `recharts`. I'll install during T2.1. Rate table and 4 acceptance scenarios will be screenshot for TIER2_REPORT.
- **T2.4 lead capture**: one surface per calculator (sidebar for FEGLI, results panel for FERS). Email sender will reuse existing `send-results-email.js` configuration — will document whether the domain is Resend-sandbox or fedbenefitsaid.com-verified when I start T2.4.
- **T2.8**: replaces the chat preview card on landing with the interactive eligibility widget, per user decision.
- **T2.6 about page**: stubs with `{{REPLACE}}` markers; user will supply founder name/credentials/bio/relationship copy/headshot before Tier 2 ships.
- **Social `sameAs` array (T2.10)**: will OMIT entirely per user direction rather than shipping empty strings.

---

## Next session

User to reply "**proceed to Tier 2**" to start T2.1. Planning docs (`PLAN.md`, `PROGRESS.md`) are authoritative — do not edit `PLAN.md`, use `PLAN_AMENDMENTS.md` for any scope change.

If interrupted mid-T2: next Code session reads `PLAN.md` + `PROGRESS.md` + `git log --oneline -30`, resumes from first unchecked `[ ]` in Tier 2 section.
