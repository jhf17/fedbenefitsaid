# Site Audit — FedBenefitsAid — 2026-04-15

Read-only end-to-end audit of fedbenefitsaid.com. Every page, every calculator formula, every Netlify function, every major piece of copy. Source code state at HEAD `d8f3f16` on branch `claude/funny-tesla` in worktree `funny-tesla`. Production bundle `/assets/index-CzaRb4Kq.js` (live on Netlify at time of audit).

---

## Discovery summary (Step 0)

### Part A — Resources available in this session

| Resource | Available? | Used in audit |
| --- | --- | --- |
| **Subagents** (general-purpose + Explore + Plan + code-reviewer + claude-code-guide) | Yes, unlimited parallel | 6 general-purpose subagents dispatched in parallel for deep reads |
| **Managed/background agents** | Scheduled-tasks MCP, cron, ScheduleWakeup, remote-trigger | Not needed for a one-shot audit |
| **Project skills** | None checked into `.claude/` in worktree | N/A |
| **User + plugin skills** | `deploy-and-verify`, `fedbenefitsaid-site-update`, `lead-pipeline-debug`, `client-email-builder`, `federal-employee-prospecting`, Apollo, Marketing, Sales, Productivity suites, canvas/docx/xlsx/pptx/pdf, skill-creator, mcp-builder | Referenced but not invoked — audit is read-only |
| **MCP / connectors** | Airtable, Netlify, Supabase, Apollo, Chrome extension, Claude_Preview, mcp-registry, scheduled-tasks, ccd_directory, ccd_session | Did not call — would require writes |
| **Plugins** | Apollo, Marketing, Sales, Productivity, Cowork plugin management, Airtable | — |
| **External tools** | WebFetch, WebSearch, Bash, Grep, Glob, Read, Edit, Write, TodoWrite | WebFetch, Bash, Grep, Read, TodoWrite, Write all used |
| **Headless browser** | `/Applications/Google Chrome.app` (v147) via `--headless` | Used for production screenshots to `/tmp/fba-screenshots/` |
| **Env/secrets** | `.env.example` in repo; real secrets in Netlify env (not exposed to this session) | Not used |

**Parallelism strategy used:** 6 subagents running concurrently for the heaviest reads (calculators, pages, functions). Main thread did config reads, grep sweeps, live fetches, and screenshots in parallel with them.

### Part B — Project context files

I read every file the prompt asked about. Here is what I found:

| File | Expected by prompt | Actual state |
| --- | --- | --- |
| `CLAUDE.md` (repo root) | "Project-level instruction file" | **Exists** — 35 lines. Stack, key files, Airtable base IDs, design tokens, file-encoding guardrail, plugin list, business context |
| `primer.md` (repo root) | "Jack's canonical source of live-state truth. The §10 bug list from last night's discovery pass lives here" | **DOES NOT EXIST.** Searched worktree, main repo, and common subdirs. No `primer.md` anywhere. No §10 bug list to reconcile against |
| `memory.sh` (repo root) | "Part of Jack's memory system, read it if present" | **DOES NOT EXIST.** Not in repo, not in main worktree |
| `README.md` (repo root) | "General project context" | **DOES NOT EXIST.** There is no README. The only docs at the repo root are `CLAUDE.md` and (after this audit) `site-audit-2026-04-15.md` |
| `.claude/` in repo | "Settings, skills, or hooks specific to this project" | **Nearly empty.** Main repo has only `.claude/worktrees/` (just worktree bookkeeping). No `settings.json`, no `skills/`, no `hooks/` committed |
| `memory/` directory | "Productivity plugin working memory" | **Does not exist** in the repo. The user-level memory dir at `~/.claude/projects/-Users-jackfitzgerald-fedbenefitsaid/memory/` exists but is **empty** |
| Subdirectory `CLAUDE.md` files | "Any nested instructions" | None found |

**Conflicts between sources and current code:**

1. `CLAUDE.md` lists `src/pages/Chat.jsx` as "AI chat (auth required)". The route `/chat` in `src/App.jsx:88` is **not** wrapped in `<ProtectedRoute>`. Chat.jsx enforces guest limits via `localStorage.chatFreeCount` (Chat.jsx:15-21, bypassable). So "auth required" in CLAUDE.md is factually wrong for anonymous users — they get 3 free messages before the client-side paywall. **Resolution: trust current code. The `/chat` route is open to guests with a trivially bypassable limit.**
2. `CLAUDE.md` lists `src/pages/Landing.jsx` as "hero, features (4-card grid), how it works (4 steps), footer". The actual Landing.jsx has **8 sections** including hero, value prop 3-card, calculator preview with tabs, assessment preview, chat preview, 8-card reference grid, resources list, final CTA. **Resolution: CLAUDE.md is stale; site has grown well beyond its description.**
3. `CLAUDE.md` lists `src/pages/Calculator.jsx` as "FERS retirement calculator". The actual Calculator.jsx supports **FERS, CSRS, and Special Provisions** (LEO/firefighter/ATC/congressional) via tabs. **Resolution: CLAUDE.md description is narrower than reality.**
4. There is no `primer.md` §10 bug list. Everything I verify below is checked against the **current code in the worktree**, not a pre-existing bug list.

The rule I followed: **current code wins over everything else.** Where CLAUDE.md and reality disagree, I go with reality and flag the drift.

---

## Executive summary (5 bullets)

1. **Two math bugs ship user-visible wrong numbers every day.** Calculator.jsx line 266 divides the FERS Supplement by an extra 12 (bug in `calcFERSSupplement`) — a 30-year retiree with $2,000/mo SS sees a **$125/mo** supplement instead of the correct **$1,500/mo**. FEGLICalculator.jsx line 126 displays Option B coverage **1,000× too small** ($360 shown for what should be $360,000 of coverage). Premiums on FEGLI are right because they use the same expression at a different scale; only the "Total Coverage" display is catastrophically wrong. **These are the highest-leverage fixes on the site.**
2. **The `/reference` page has a `B → /` typo that mangles "Part B" and "FEHB" 53 times.** `src/data/refData.js` has 36 hits of `Part /` and 17 hits of `FEH/` — every Medicare and FEHB topic is affected ("Medicare Part /", "FEH/-only", "2026 Part / standard premium"). It looks like a bad find/replace. Visible to every user who opens Reference → Medicare or FEHB. No other `B/` corruption in the codebase.
3. **Security: one open webhook, two unauthenticated LLM/email endpoints.** `calendly-webhook.js` accepts unsigned webhooks if `CALENDLY_WEBHOOK_SIGNING_KEY` is missing from the environment (lines 70–78 fail-open with a `console.warn`). `chat.js` has no auth in front of the Anthropic proxy — rate-limited to 20 req/min/IP, but an attacker can rotate IPs. `send-results-email.js` has no auth in front of Resend — bill-pump risk. `get-leads.js` and `update-lead.js` **do** enforce `user.email === 'jhf17@icloud.com'` server-side via Supabase JWT (get-leads.js:36) — admin data is properly locked down.
4. **Content drift, vapor product, and a dead page sitting in plain sight.** Course.jsx (`/training`) sells "11 Benefit Modules" but `quizData.js` only has 9. "Contact Sales" goes to `/signup`. Both pricing tiers are mocks. Assessment question count disagrees across pages — Terms.jsx:31 says 12, Assessment/Privacy/Landing all say 14. Landing.jsx:473 has a marketing chat bubble claiming "approximately 30.8% of your high-3" for 28 YOS at age 56 — the correct figure for that scenario is 28%, and more importantly the user isn't eligible for immediate unreduced retirement at 56/28 anyway. `src/data/colors.js` is 70 LOC of design tokens that nothing in the codebase imports — dead file.
5. **SEO and social sharing are partially broken.** `sitemap.xml` is missing the `/calculators`, `/calculators/fegli`, and `/vera-vsip` routes (only lists 10 of the 18 real routes) and every `lastmod` is frozen at `2026-04-08`. `public/og-image.png` is referenced in `index.html` meta tags but **does not exist** in `public/` — a HEAD request returns `content-type: text/html` and 7,293 bytes (the SPA fallback serving `index.html`). Social sharing will show no preview image. HTTP security headers and structured-data JSON-LD are strong.

---

## Route-by-route audit

### Route inventory and confirmation

The prompt listed 18 routes extracted from the production bundle. I verified these match `src/App.jsx` lines 82–114 exactly:

| # | Route | Component | File path | Auth | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `/` | `Landing` | [src/pages/Landing.jsx](src/pages/Landing.jsx) | public | 595 lines |
| 2 | `/login` | `Auth mode="login"` | [src/pages/Auth.jsx](src/pages/Auth.jsx) | public | 557 lines |
| 3 | `/signup` | `Auth mode="signup"` | [src/pages/Auth.jsx](src/pages/Auth.jsx) | public | 557 lines, shared file |
| 4 | `/calculator` | `Calculator` | [src/pages/Calculator.jsx](src/pages/Calculator.jsx) | public | 1,132 lines — FERS/CSRS/Special |
| 5 | `/calculators` | `Calculators` (aliased to `Tools`) | [src/pages/Tools.jsx](src/pages/Tools.jsx) | public | 349 lines. **File is named Tools.jsx but exports `Calculators`.** |
| 6 | `/calculators/fegli` | `FEGLICalculator` | [src/pages/FEGLICalculator.jsx](src/pages/FEGLICalculator.jsx) | public | 790 lines |
| 7 | `/assessment` | `Assessment` | [src/pages/Assessment.jsx](src/pages/Assessment.jsx) | public | 1,426 lines |
| 8 | `/reference` | `Reference` | [src/pages/Reference.jsx](src/pages/Reference.jsx) | public | 639 lines, backed by [src/data/refData.js](src/data/refData.js) (903 lines) |
| 9 | `/resources` | `Resources` | [src/pages/Resources.jsx](src/pages/Resources.jsx) | public | 364 lines |
| 10 | `/chat` | `Chat` | [src/pages/Chat.jsx](src/pages/Chat.jsx) | **public** (CLAUDE.md incorrectly says auth-required) | 591 lines. 3-msg guest cap via localStorage |
| 11 | `/consultation` | `Consultation` | [src/pages/Consultation.jsx](src/pages/Consultation.jsx) | public | 696 lines |
| 12 | `/vera-vsip` | `VeraVsip` | [src/pages/VeraVsip.jsx](src/pages/VeraVsip.jsx) | public | 277 lines |
| 13 | `/training` | `Course` (inside `<ProtectedRoute>`) | [src/pages/Course.jsx](src/pages/Course.jsx) | **auth required** | 307 lines |
| 14 | `/training/quiz/:topicId` | `Quiz` (inside `<ProtectedRoute>`) | [src/pages/Quiz.jsx](src/pages/Quiz.jsx) | **auth required** | 521 lines. **Orphaned — no page currently links into it** |
| 15 | `/admin` | `Admin` | [src/pages/Admin.jsx](src/pages/Admin.jsx) | **client-side email gate only** (server-side auth in `get-leads.js`) | 1,097 lines |
| 16 | `/disclaimer` | `Disclaimer` | [src/pages/Disclaimer.jsx](src/pages/Disclaimer.jsx) | public | 148 lines |
| 17 | `/terms` | `Terms` | [src/pages/Terms.jsx](src/pages/Terms.jsx) | public | 280 lines |
| 18 | `/privacy` | `Privacy` | [src/pages/Privacy.jsx](src/pages/Privacy.jsx) | public | 407 lines |
| — | `*` | `NotFound` | inline in [src/App.jsx:32](src/App.jsx:32) | public | SPA 404 with links to `/` and `/reference` |

**Confirmed:** production bundle list matches source code exactly. No orphaned routes in either direction. No SPA fallback masking missing code.

### Per-route findings

Each row below covers: **component** · **purpose** · **embedded tools** · **ratings (Accuracy / Visual / Usability / Trust, 1–10)** · **bugs** · **recommendation**. Screenshot paths under `/tmp/fba-screenshots/` (not committed — see Visual evidence note at the end).

#### 1. `/` — Landing.jsx
- **Purpose**: Marketing homepage for the full funnel.
- **Tools embedded**: Tabbed calculator preview (mock numbers), assessment preview (mock score ring), AI chat preview bubble, 8-card reference grid, resources list. 8 sections total.
- **Ratings**: Accuracy **6** · Visual **9** · Usability **9** · Trust **7**
- **Bugs**:
  - [Landing.jsx:473](src/pages/Landing.jsx:473) — chat preview bubble reads "approximately 30.8% of your high-3 salary" for 28 YOS at age 56. The 30.8% figure corresponds to 28 × 1.1% (enhanced multiplier), but the enhanced multiplier only applies at age 62+ with 20+ YOS. At 56, the standard 1.0% applies → 28%. Also: age 56 with 28 YOS does not qualify for immediate unreduced retirement under any FERS rule (MRA+30 needs 2 more YOS; 60/20 is 4 years away), so "Yes — you're eligible for an immediate, unreduced FERS retirement" is wrong twice.
  - [Landing.jsx:499](src/pages/Landing.jsx:499) — "Six comprehensive categories" immediately before a grid that renders 8 cards.
  - [Landing.jsx:289](src/pages/Landing.jsx:289) and [Landing.jsx:331](src/pages/Landing.jsx:331) — `$5,318` monthly income and `$582,000` FEGLI coverage are hard-coded preview data with no "sample" label. A casual viewer could mistake them for computed output.
- **Recommendation**: **Polish.** Three-line copy fixes + a "sample data" badge on the preview widgets. Do not rebuild — the hero, section cadence, and CTA flow are all working.

#### 2. `/login` · `/signup` — Auth.jsx
- **Purpose**: Supabase-backed login + signup. Collects name, phone, email, password.
- **Tools embedded**: Supabase `signInWithPassword` / `signUp`; fire-and-forget POST to `/.netlify/functions/add-lead`.
- **Ratings**: Accuracy **9** · Visual **9** · Usability **9** · Trust **8**
- **Bugs**:
  - [Auth.jsx:120](src/pages/Auth.jsx:120) — `addLeadToCRM(name, email, phone)` is **not awaited**. On fast tab-close after signup, the Airtable write can silently drop. One retry with no user-facing error ([Auth.jsx:38-53](src/pages/Auth.jsx:38)).
  - Phone is optional and validated with a lax regex (`/^[\d\s()+-]{7,}$/`) only when a value is present ([Auth.jsx:90](src/pages/Auth.jsx:90)).
  - No CAPTCHA / bot protection. Relies on Supabase-side throttling.
  - `emailRedirectTo: window.location.origin + '/chat'` at [Auth.jsx:115](src/pages/Auth.jsx:115) — fine in prod; will break in local dev unless Supabase allowlist includes `localhost`.
- **Recommendation**: **Polish.** Await the CRM call OR move signup → CRM into a Supabase Database trigger / webhook so writes can't drop. Make phone required if it's part of Apollo outbound segmentation. Enable Supabase hCaptcha before any outbound push that might attract spam signups.

#### 3. `/calculator` — Calculator.jsx (FERS / CSRS / Special Provisions)
- **Purpose**: Federal retirement income calculator. Three tabs. Lead capture via email send.
- **Tools embedded**: FERS/CSRS/Special pension math, TSP future value, Social Security age adjustment, FERS Supplement, FEHB premium deduction, Medicare Part B deduction, COLA projection, FIA payout projections (computed but never shown).
- **Ratings**: Accuracy **6** · Visual **8** · Usability **7** · Trust **8**
- **Bugs** (see Calculator Deep Dive for file:line detail and test-scenario numbers):
  1. **[Calculator.jsx:266](src/pages/Calculator.jsx:266)** — `calcFERSSupplement` divides by 12 when the `ssAt62` input is already labeled `$/mo`. Output is 12× too small. **CRITICAL.**
  2. [Calculator.jsx:103](src/pages/Calculator.jsx:103) — FERS enhanced-multiplier test uses `yrs` rather than `effectiveYrs`, so a retiree whose sick-leave credit pushes them to 20 YOS at age 62 won't get the 1.1% rate.
  3. [Calculator.jsx:309-313](src/pages/Calculator.jsx:309) — MRA table collapsed to three buckets (1970+=57, 1953–1969=56, pre-1953=55). OPM actually phases MRA in 2-month steps between 1948 and 1969.
  4. [Calculator.jsx:298](src/pages/Calculator.jsx:298) — Social Security FRA is hardcoded to age 67. Users born 1955–1959 have FRA 66+2mo to 66+10mo.
  5. [Calculator.jsx:12-13](src/pages/Calculator.jsx:12) — 2026 SS bend points `$1,286` / `$7,749` are defined as constants but never used in any formula.
  6. [Calculator.jsx:155-172](src/pages/Calculator.jsx:155) — CSRS tier helper has unreachable branches; works for ≤5 YOS only, but the structure is a confusing if/else/return/fall-through.
  7. [Calculator.jsx:73-74](src/pages/Calculator.jsx:73) — GEHA Standard/High and Aetna Direct FEHB plans are flagged `verified: false` in the data but the `verified` flag is never surfaced to the user. Users see estimates as authoritative.
  8. [Calculator.jsx:277](src/pages/Calculator.jsx:277), [Calculator.jsx:329](src/pages/Calculator.jsx:329), [Calculator.jsx:463-467](src/pages/Calculator.jsx:463) — `showFIA`, `includeSupp`, `fiaPayouts` are all set but never rendered. Dead UI state.
  9. [Calculator.jsx:395-403](src/pages/Calculator.jsx:395) — validation gap: `currentAge`, `tspBalance`, `ssAt62`, `tspGrowthRate` have no bounds or required checks. Blank currentAge defaults to 0 and balloons the TSP projection.
  10. Unsourced constants: 5% MRA+10 per-year penalty, survivor 5%/10%, 4% safe withdrawal, 40-year FERS Supplement divisor, $24,480 earnings-test literal in JSX.
- **Recommendation**: **Polish, do not rebuild.** The underlying math engine for the core pension formulas is solid and well-sourced. Fix bug #1 first — it's a 1-character change with a massive correctness impact. Then MRA table, FRA-from-birth-year, validation tightening, and delete the dead code.

#### 4. `/calculators` — Tools.jsx (aliased component `Calculators`)
- **Purpose**: Hub page. 2-card grid linking to `/calculator` and `/calculators/fegli`.
- **Ratings**: Accuracy **10** · Visual **8** · Usability **9** · Trust **9**
- **Bugs**: Filename/component mismatch (file `Tools.jsx`, component name `Calculators`, route alias in [App.jsx:16](src/App.jsx:16)). Not a bug, but will bite whoever inherits this.
- **Recommendation**: **Keep.** Rename `src/pages/Tools.jsx` → `src/pages/Calculators.jsx` during the next refactor pass to remove the alias confusion.

#### 5. `/calculators/fegli` — FEGLICalculator.jsx
- **Purpose**: FEGLI premium + coverage calculator. Basic + Option A/B/C. Post-retirement reduction projections.
- **Ratings**: Accuracy **4** · Visual **8** · Usability **6** · Trust **7**
- **Bugs** (see Calculator Deep Dive for full list):
  1. **[FEGLICalculator.jsx:126](src/pages/FEGLICalculator.jsx:126)** — Option B coverage display is 1,000× too small. Shows $360 for what should be $360,000. **CRITICAL.** Premiums are correct because they use the same expression at a different scale; only the displayed coverage number is wrong.
  2. **[FEGLICalculator.jsx:93](src/pages/FEGLICalculator.jsx:93), [:95](src/pages/FEGLICalculator.jsx:95)** — Post-65 Basic 50%-reduction and no-reduction monthly rates hardcoded to `0.75` and `2.25` per $1,000. OPM's published values are `0.94` and `2.55`. **Material mismatch on the retirement projection side.**
  3. **[FEGLICalculator.jsx:510](src/pages/FEGLICalculator.jsx:510), [:545-555](src/pages/FEGLICalculator.jsx:545), [:689](src/pages/FEGLICalculator.jsx:689)** — Hardcoded help text and displayed rate table show `$0.3250` / `$0.33` per $1,000 for Basic employee premium. The constant actually used in math (`FEGLI_BASIC_EMPLOYEE = 0.1600` at [FEGLICalculator.jsx:25](src/pages/FEGLICalculator.jsx:25)) is half that value. Users see two different rates on the same page.
  4. [FEGLICalculator.jsx:53](src/pages/FEGLICalculator.jsx:53), [:171](src/pages/FEGLICalculator.jsx:171) — `fegliRetireAge` and `fegliRetirementStatus` are inputs in the UI but never consumed by `calcFEGLI`. Retirement projections always start at age 60 regardless of what the user enters.
  5. [FEGLICalculator.jsx:27](src/pages/FEGLICalculator.jsx:27) — `FEGLI_BASIC_ANNUITANT` constant declared but never used; line 80 uses an inline literal instead.
  6. [FEGLICalculator.jsx:594](src/pages/FEGLICalculator.jsx:594) — Current-bracket highlight logic (`isCurrent = age >= projAge-2 && age < projAge+5`) highlights two rows at age 58 (60 AND 65).
  7. [FEGLICalculator.jsx:486-500](src/pages/FEGLICalculator.jsx:486) — Projected costs card only shows ages 65 and 75, duplicating the table below it which shows 60/65/70/75/80.
- **Recommendation**: **Polish urgently.** Option B coverage bug is high-visibility. All fixes together are under 50 lines of code. Do not rebuild — the UX scaffolding is solid.

#### 6. `/assessment` — Assessment.jsx
- **Purpose**: 14-question multi-step retirement readiness assessment with weighted scoring across 6 categories, personalized action plan, Airtable lead capture, emailed results.
- **Tools embedded**: Question state machine, score ring, detail sections, retirement timeline, email capture → `/.netlify/functions/send-results-email` + `/.netlify/functions/add-lead`.
- **Ratings**: Accuracy **7** · Visual **8** · Usability **7** · Trust **7**
- **Bugs**:
  - [Assessment.jsx:1191](src/pages/Assessment.jsx:1191) — `<DetailSection defaultExpanded={weakestCats.includes(catId)} />` is passed as prop but `DetailSection` at [Assessment.jsx:664](src/pages/Assessment.jsx:664) never destructures `defaultExpanded`. Internal `useState(false)` always starts collapsed. The "auto-expand your weakest categories" UX never fires.
  - [Assessment.jsx:1051-1056](src/pages/Assessment.jsx:1051) — `sendAssessmentEmail` maps checklist items as `{title: item.text || item.title, description: item.explanation || item.desc}`, but `getChecklist` returns items shaped `{priority, category, task}`. Emailed action items render with blank title and blank description.
  - [Assessment.jsx:966](src/pages/Assessment.jsx:966), [1069-1113](src/pages/Assessment.jsx:1069) — `showChecklist` state + `handleUnlockChecklist` + `handleUnlockForUser` all exist but nothing in the JSX ever consumes them. Lead source `"Retirement Checklist"` is unreachable dead path.
  - [Assessment.jsx:1314](src/pages/Assessment.jsx:1314) — `border: '1.5px solid maroon'` uses the CSS named color `maroon` (`#800000`) rather than the brand `#7b1c2e`. Subtle visual drift.
  - [Assessment.jsx:983-996](src/pages/Assessment.jsx:983) — email capture has no format validation, only truthy check.
  - Hardcoded "$202.90" Medicare Part B literals appear at [Assessment.jsx:470](src/pages/Assessment.jsx:470), [:585](src/pages/Assessment.jsx:585), [:864](src/pages/Assessment.jsx:864) — will need to be updated manually each year.
- **Recommendation**: **Polish.** Three small bugs that each individually erode trust. Wire `defaultExpanded` through, fix the email checklist-item shape, delete the dead `showChecklist` branches, add email-format validation, centralize the Part B number.

#### 7. `/reference` — Reference.jsx + refData.js
- **Purpose**: In-house navigable reference guide of federal benefit topics with search, drill-down categories, and topic detail pages.
- **Tools embedded**: Fuzzy search over title/summary/overview/rules; category → topic → detail navigation; breadcrumbs; `ConsultantCTA` component at the bottom of every topic page.
- **Ratings**: Accuracy **7** · Visual **10** · Usability **10** · Trust **8**
- **Bugs**:
  - **`Part B` → `Part /` typo in [refData.js](src/data/refData.js) occurring 36 times.** Grep confirmed 36 hits of `Part /` across Medicare topics (lines include 307, 310, 313, 314, 318, 324, 325, 462, 475, 476, 477, 478, 493, 496, 502, 503, 504, 588, plus 18 more). Every visitor to Reference → Medicare sees "Medicare Part /", "2026 Part / standard premium", "Part / late enrollment penalty", etc.
  - **`FEHB` → `FEH/` typo in refData.js occurring 17 times.** Same root cause. "Retirees in FEH/-only", "FEH/-only who delay Medicare", etc.
  - Category icon map built inside render on every draw ([Reference.jsx:162-174](src/pages/Reference.jsx:162)). Minor perf smell.
- **Recommendation**: **Keep.** This is the strongest page on the site once the typo is fixed. The typo fix is one `sed`-style find/replace across refData.js for `B` → missing character. **Priority: next commit.**

#### 8. `/resources` — Resources.jsx
- **Purpose**: Static directory of 25+ official external links (OPM forms, TSP, SSA, FEHB, Medicare).
- **Ratings**: Accuracy **9** · Visual **9** · Usability **9** · Trust **10**
- **Bugs**: None material. Link hub, no inline numbers to go stale, no interactive state. Good `target="_blank"` + `rel="noopener noreferrer"` hygiene throughout.
- **Recommendation**: **Keep.** Not redundant with Reference.jsx (different purpose: external forms vs. in-house explainers). Add cross-links between the two.

#### 9. `/chat` — Chat.jsx
- **Purpose**: Guest-gated AI chat for federal benefits Q&A.
- **Tools embedded**: POSTs to `/.netlify/functions/chat`; 3-msg localStorage gate; optional auto-send from Calculator results; auto-scroll after first user message.
- **Ratings**: Accuracy **8** · Visual **9** · Usability **9** · Trust **8**
- **Bugs**:
  - [Chat.jsx:15-21](src/pages/Chat.jsx:15), [:67-70](src/pages/Chat.jsx:67), [:82](src/pages/Chat.jsx:82) — free-message gate is client-side localStorage only. A guest can bypass by clearing storage or using incognito. Server-side `/.netlify/functions/chat` has IP-based rate limit (20/min) as the real backstop but no per-session counter.
  - No client-side textarea `maxLength` — large inputs hit the server.
  - Conversations are **not persisted**. No writes to Supabase `conversations` / `messages` tables despite those tables existing in `supabase_schema.sql`. Dual-source-of-truth opportunity on the schema side.
- **Recommendation**: **Polish + decide on persistence.** Cap textarea at 4–8k chars. Move the 3-message guest gate to a hashed-cookie server-side counter if you keep free access. Decide whether to log conversations to Supabase for QA / abuse review — they currently go nowhere.

#### 10. `/consultation` — Consultation.jsx
- **Purpose**: Conversion page for booking a free 30-min Calendly consultation with Federal Market Associates.
- **Tools embedded**: Two CTA buttons linking to `https://calendly.com/jhf17/30min` (new tab); FAQ accordion; consultant card with FMA logo.
- **Ratings**: Accuracy **7** · Visual **9** · Usability **7** · Trust **6**
- **Bugs**:
  - **[Consultation.jsx:335](src/pages/Consultation.jsx:335)** — "Your consultant is a certified federal retirement specialist" is asserted without a name, cert number (CRC/CFP), or credentialing body. If no one on staff actually holds the referenced certification, this is misleading marketing copy that could expose FMA to a consumer-protection complaint.
  - [Consultation.jsx:325](src/pages/Consultation.jsx:325) — "work with hundreds of federal employees each year" is a specific quantitative claim with no substantiation.
  - [Consultation.jsx:455](src/pages/Consultation.jsx:455), [:465](src/pages/Consultation.jsx:465) — Section header reads "Choose a Time" but there is **no inline Calendly embed** — just a button that opens Calendly in a new tab. UX mismatch. Calendly CSP is already whitelisted at `netlify.toml:23` (`frame-src https://calendly.com`), so an inline embed would work.
  - No consultant headshot, name, or bio despite the prominent "Your Consultant" card.
- **Recommendation**: **Polish.** Either substantiate the credential claim with a real name + cert, or soften to "experienced federal benefits educator." Embed Calendly inline under "Choose a Time" (CSP already permits it). Add a photo.

#### 11. `/vera-vsip` — VeraVsip.jsx
- **Purpose**: Static educational reference for Voluntary Early Retirement Authority + Voluntary Separation Incentive Payment, plus status of H.R. 7256 in the 119th Congress.
- **Ratings**: Accuracy **9** · Visual **8** · Usability **8** · Trust **10**
- **Bugs**: None material. Every factual claim has an inline source comment tied to a U.S. Code section or OPM URL. This is the **gold standard** page for trust signals on this site.
- **Recommendation**: **Keep as-is.** The only small improvement is to either cite a specific DoD VSIP cap ($40,000 per NDAA/DoD guidance) or keep the current conservative "DoD has its own authority — verify directly" framing. Use this page's citation style as the template for tightening Calculator and Assessment trust signals.

#### 12. `/training` — Course.jsx (auth-gated)
- **Purpose**: Paid training product marketing page. $19.99/mo Professional, $149/mo Agency. AI chat add-on toggle.
- **Ratings**: Accuracy **4** · Visual **8** · Usability **6** · Trust **4**
- **Bugs**:
  - **[Course.jsx:5-17](src/pages/Course.jsx:5)** — `TOPICS` array has 11 entries. [Course.jsx:20](src/pages/Course.jsx:20) stat says "350+ Practice Questions". But `QUIZ_MODULES` in [src/data/quizData.js:16-71](src/data/quizData.js:16) has only **9 modules** (fers, tsp, fehb, fegli, medicare, social-security, csrs, survivor, leave). Four advertised modules — "FERS Supplement", "Special Provisions", "Disability Retirement", "Federal Pay & Leave" — do not exist as quizzes.
  - [Course.jsx:95](src/pages/Course.jsx:95) — dead ternary `{chatAddon1 ? '.99' : '.99'}` (both branches identical).
  - [Course.jsx:180](src/pages/Course.jsx:180) — "Contact Sales" button links to `/signup`, not a sales form or mailto.
  - [Course.jsx:128](src/pages/Course.jsx:128), [:180](src/pages/Course.jsx:180) — neither pricing button has any Stripe / payment wiring. This is a marketing page for an **unbuilt** product.
  - [Course.jsx:65](src/pages/Course.jsx:65) — uses `dangerouslySetInnerHTML` to render static HTML entities (`&amp;`) where plain text would work.
- **Recommendation**: **Rework or pull from nav.** Either (a) ship the product and wire real payments, (b) reduce to a "coming soon" landing page with email capture, or (c) remove from the navbar until it's real. Selling vapor is the single biggest trust risk on the site aside from the calculator accuracy bugs.

#### 13. `/training/quiz/:topicId` — Quiz.jsx (auth-gated)
- **Purpose**: Interactive per-topic quiz runner reading from `QUIZ_QUESTIONS[topicId]`.
- **Ratings**: Accuracy **8** · Visual **9** · Usability **8** · Trust **8**
- **Bugs**:
  - **Orphaned route.** No page in `src/pages/` currently links to `/training/quiz/:topicId`. The Course page doesn't list topics with links. The only way to reach a quiz is by typing the URL.
  - [Quiz.jsx:224](src/pages/Quiz.jsx:224) — running score denominator is `currentIdx + (answered ? 1 : 0)` — works but confusing.
  - No progress persistence across refresh.
- **Recommendation**: **Keep, but link to it.** Add quiz entry points from Course.jsx (or from Reference.jsx topic pages). This is good code that nobody can reach.

#### 14. `/admin` — Admin.jsx
- **Purpose**: Lead command center for the single admin user. Shows leads, outbound campaigns, consultations. Inline editing.
- **Tools embedded**: `fetchData()` GETs `/.netlify/functions/get-leads` with Supabase JWT bearer; `updateLeadField` POSTs to `/.netlify/functions/update-lead`; filter/search/sort state; detail panel.
- **Ratings**: Accuracy **8** · Visual **8** · Usability **8** · Trust N/A (internal)
- **Bugs / Security notes**:
  - [Admin.jsx:7](src/pages/Admin.jsx:7) — `ADMIN_EMAIL = 'jhf17@icloud.com'` hardcoded in the client bundle. Anyone who views the bundle can see Jack's personal email.
  - [Admin.jsx:33-37](src/pages/Admin.jsx:33) — non-admin redirect is in a `useEffect`, which runs after first render. The component returns `null` for non-admin ([Admin.jsx:336-338](src/pages/Admin.jsx:336)), so there's no visible flash. Client-side-only gating is fine **because** the real gate is server-side in `get-leads.js:36` which enforces `user.email === 'jhf17@icloud.com'` via the Supabase JWT (confirmed — see Netlify Functions Audit).
  - [Admin.jsx:228](src/pages/Admin.jsx:228) — native `alert()` instead of a toast component for update failures.
- **Recommendation**: **Polish.** Move `ADMIN_EMAIL` to a build-time env var so the client bundle doesn't dox the owner. Replace `alert()` with a toast. Otherwise the dashboard is in good shape and the server-side auth is correctly locked down.

#### 15. `/disclaimer` — Disclaimer.jsx
- **Purpose**: Short-form disclaimer (148 lines, 7 sections). Prominent "Not affiliated with OPM" section at [Disclaimer.jsx:64-67](src/pages/Disclaimer.jsx:64).
- **Ratings**: Accuracy **8** · Visual **9** · Usability **9** · Trust **9**
- **Bugs**: None. Real content, `Last updated: April 6, 2026`, working Calendly + FMA external links with `rel="noopener noreferrer"`, no contact email beyond Calendly (minor gap).
- **Recommendation**: **Keep.** Add a professional domain email (`contact@fedbenefitsaid.com`) to the Contact section so visitors have a non-Calendly way to reach support.

#### 16. `/terms` — Terms.jsx
- **Purpose**: SaaS-style terms of service, 13 numbered sections + closing italic note. ~820 words.
- **Ratings**: Accuracy **7** · Visual **9** · Usability **9** · Trust **8**
- **Bugs**:
  - [Terms.jsx:31](src/pages/Terms.jsx:31) — "Retirement readiness assessment (12-question quiz)" contradicts Assessment.jsx, Privacy.jsx, and Landing.jsx which all say 14 questions.
  - [Terms.jsx:165-169](src/pages/Terms.jsx:165) — "Governing Law: laws of the United States" with no specific state. A real court would force you to pick one.
  - No arbitration / class-action waiver clause.
  - [Terms.jsx:177](src/pages/Terms.jsx:177) — contact email is `jhf17@icloud.com` (personal iCloud).
- **Recommendation**: **Polish.** Fix "12 questions" → "14 questions". Pick a specific governing state. Optionally add arbitration. Swap contact email for a domain address.

#### 17. `/privacy` — Privacy.jsx
- **Purpose**: Long-form privacy policy (407 lines, 12 sections, ~1,600 words). The de facto privacy page for GDPR/CCPA purposes.
- **Ratings**: Accuracy **7** · Visual **9** · Usability **9** · Trust **8**
- **Bugs / gaps**:
  - [Privacy.jsx:45](src/pages/Privacy.jsx:45) — "14 questions" (consistent with Assessment, inconsistent with Terms).
  - No explicit GDPR legal basis (consent / legitimate interest).
  - No CCPA "Do Not Sell / Do Not Share" disclosure (even a "we do not sell" line would satisfy).
  - No data retention period.
  - No international data transfer notice (Anthropic, Airtable, Resend, Supabase all US-hosted — acceptable for US users, material for EU visitors).
  - No explicit "Not affiliated with OPM" line (present on Disclaimer + Terms but missing here).
  - [Privacy.jsx:270](src/pages/Privacy.jsx:270) — "Passwords are hashed using bcrypt" is a specific claim about Supabase internals that may drift.
- **Recommendation**: **Polish.** Reconcile question count, add retention period, add CCPA + OPM affiliation lines, soften the bcrypt claim to "industry-standard hashing." None of these are expensive, and they materially strengthen the trust posture before any outbound push that collects EU traffic.

---

## Calculator Deep Dive

### `/calculator` (Calculator.jsx) — FERS / CSRS / Special Provisions

**Inputs:** `yearsService`, `high3`, `currentAge`, `retireAge`, `survivorBenefit` (none/reduced/full), `sickLeaveHours`, `specialCat` (LEO/firefighter/ATC/congressional), `tspBalance`, `monthlyContrib`, `tspGrowthRate` (default 6%), `ssAt62`, `ssClaimAge` (default 67), `includeMedicare` toggle, `includeFEHB` toggle, `fehbPlan`, `fehbCoverage`, `fehbCustom`, plus name/email/phone capture.

**Outputs:** Total Monthly Income (hero), Pension monthly, FERS Supplement (if > 0), SS monthly, TSP 4% withdrawal, Medicare deduction, FEHB deduction, WEP/GPO repealed notice, pension breakdown (high-3 × years × multiplier − early reduction − survivor reduction = net), projected TSP balance & 4% annual, FERS COLA projection at 5/10/15/20 years post-retirement, Calendly CTA, email capture, assumptions panel.

**Constants referenced and verified:**

| Constant | Value in code | File:line | 2026 authoritative | Match? |
| --- | --- | --- | --- | --- |
| FERS_STANDARD multiplier | 0.010 | [Calculator.jsx:16](src/pages/Calculator.jsx:16) | 1.0% | ✅ |
| FERS_ENHANCED multiplier (62+ & 20+ YOS) | 0.011 | [:17](src/pages/Calculator.jsx:17) | 1.1% | ✅ |
| CSRS Tier 1 (yrs 1-5) | 0.015 | [:20](src/pages/Calculator.jsx:20) | 1.5% | ✅ |
| CSRS Tier 2 (yrs 6-10) | 0.0175 | [:21](src/pages/Calculator.jsx:21) | 1.75% | ✅ |
| CSRS Tier 3 (yrs 11+) | 0.020 | [:22](src/pages/Calculator.jsx:22) | 2.0% | ✅ |
| CSRS max (80% cap) | 0.80 | [:23](src/pages/Calculator.jsx:23) | 80% | ✅ |
| Special Provision high (first 20) | 0.017 | [:26](src/pages/Calculator.jsx:26) | 1.7% | ✅ |
| Special Provision low (21+) | 0.010 | [:27](src/pages/Calculator.jsx:27) | 1.0% | ✅ |
| **Medicare Part B 2026 standard** | $202.90 | [:30](src/pages/Calculator.jsx:30) | $202.90 (CMS finalized Nov 2025) | ✅ |
| SS bend point 1 (AIME) | $1,286 | [:12](src/pages/Calculator.jsx:12) | 2026 bend point 1 | ✅ but **never used** in any formula |
| SS bend point 2 (AIME) | $7,749 | [:13](src/pages/Calculator.jsx:13) | 2026 bend point 2 | ✅ but **never used** |
| MRA+10 penalty | 5%/yr under 62 | [:113](src/pages/Calculator.jsx:113) | 5%/yr | ✅ |
| Survivor reduction — full | 10% | [:122](src/pages/Calculator.jsx:122) | 10% | ✅ |
| Survivor reduction — partial | 5% | [:120](src/pages/Calculator.jsx:120) | 5% | ✅ |
| Sick leave divisor | 174 hrs/mo | [:98](src/pages/Calculator.jsx:98) | 174 | ✅ |
| **FERS Supplement formula** | `(yrs/40) × ss / 12` | [:266](src/pages/Calculator.jsx:266) | `(yrs/40) × ss_monthly` | ❌ **12× too small** |
| **MRA table** | 3 buckets: 57 / 56 / 55 | [:309-313](src/pages/Calculator.jsx:309) | OPM: 10 buckets, 2-mo steps | ❌ **oversimplified** |
| **SS FRA** | hardcoded 67 | [:298](src/pages/Calculator.jsx:298) | Varies 66+2mo → 67 by birth year | ❌ **wrong for 1955–1959 cohort** |
| FERS COLA projection rate | 2% | [:33,:46](src/pages/Calculator.jsx:33) | 2026 actual COLA = 2.5% | ⚠️ acceptable as "historical average" |
| TSP safe withdrawal | 4% | [:439,:464](src/pages/Calculator.jsx:439) | Trinity/Bengen convention | ✅ acceptable |
| FERS earnings-test annual limit | $24,480 literal in JSX | [:783](src/pages/Calculator.jsx:783) | 2026 SSA pre-FRA exempt | ✅ but hardcoded as string |
| TSP contribution limits | not present | — | 2026 = $24,500 base | N/A — calculator doesn't check |

### `/calculators/fegli` (FEGLICalculator.jsx)

**Inputs:** `fegliSalary`, `fegliAge`, `fegliIsPostal`, `fegliRetirementStatus`, `fegliRetireAge`, Basic toggle, Option A toggle, Option B multiplier (0–5), Option C spouse checkbox, Option C children checkbox, Option C multiplier (1–5), Basic reduction election (75/50/no), Option A/B/C reduction elections (full/none), plus name/email/phone.

**Outputs:** Coverage Breakdown card (Basic/A/B/C/Total), Current Monthly Cost card (monthly/biweekly/annual), Projected Costs at Key Ages, Cost Projection Over Time table (60/65/70/75/80), FEGLI Premium Rate Table, email capture, Calendly CTA, assumptions.

**Test scenario** (Age 58, $120,000 salary, Basic ON, Option A ON, Option B 3×, Option C 2 multiples, 75% Basic reduction, all A/B/C "full" reduction):

| Field | As coded | What it should be |
| --- | --- | --- |
| BIA | $122,000 | ✅ correct |
| Option A coverage | $10,000 | ✅ correct |
| **Option B coverage** | **$360** | ❌ **$360,000** (1,000× off) |
| Option C coverage | $10,000 | ✅ correct |
| **Total Coverage** | **$142,360** | ❌ **~$502,000** |
| Basic biweekly | $19.52 | ✅ |
| Option A biweekly | $1.80 | ✅ |
| Option B biweekly | $64.80 | ✅ (premiums used the same division at a different scale, so they're right) |
| Option C biweekly | $2.66 | ✅ |
| **Total current biweekly / monthly / annual** | $88.78 / $192.36 / $2,308.28 | ✅ |
| Age 65 projected monthly (75% Basic + full A/B/C reduction) | $0 | ✅ correct (Basic free, A/B/C = $0 at full reduction) |

**Critical constants:**

| Constant | Code value | File:line | OPM authoritative | Match? |
| --- | --- | --- | --- | --- |
| FEGLI Basic employee biweekly / $1k | 0.1600 | [FEGLICalculator.jsx:25](src/pages/FEGLICalculator.jsx:25) | 0.1600 | ✅ |
| Basic postal biweekly | 0.00 | [:26](src/pages/FEGLICalculator.jsx:26) | 0.00 | ✅ |
| Option A employee 55-59 | 1.80 | [:11](src/pages/FEGLICalculator.jsx:11) | 1.80 | ✅ |
| Option B employee 80+ | 2.88 | [:16](src/pages/FEGLICalculator.jsx:16) | 2.88 | ✅ |
| Option C employee 80+ | 7.80 | [:21](src/pages/FEGLICalculator.jsx:21) | 7.80 | ✅ |
| Pre-65 Basic 75% reduction (monthly/$k) | 0.3467 | [:80](src/pages/FEGLICalculator.jsx:80) | 0.3467 | ✅ |
| Pre-65 Basic 50% reduction | 1.0967 | [:81](src/pages/FEGLICalculator.jsx:81) | 1.0967 | ✅ |
| Pre-65 Basic no reduction | 2.5967 | [:82](src/pages/FEGLICalculator.jsx:82) | 2.5967 | ✅ |
| **Post-65 Basic 50% reduction** | **0.75** | **[:93](src/pages/FEGLICalculator.jsx:93)** | **0.94** | ❌ mismatch |
| **Post-65 Basic no reduction** | **2.25** | **[:95](src/pages/FEGLICalculator.jsx:95)** | **2.55** | ❌ mismatch |
| **Displayed help text Basic rate** | **$0.3250** | **[:510](src/pages/FEGLICalculator.jsx:510), [:689](src/pages/FEGLICalculator.jsx:689)** | $0.1600 | ❌ stale |
| **Displayed rate table Basic rate** | **$0.33** | **[:545-555](src/pages/FEGLICalculator.jsx:545)** | $0.16 | ❌ stale |

**Note on FEGLI rate staleness:** OPM has not updated FEGLI rates since the October 2021 adjustment. The 2021 constants embedded in the code should still be correct for 2026. Live verification at `https://www.opm.gov/healthcare-insurance/life-insurance/premiums/` timed out during this audit (OPM blocks scripted access); re-check manually before production release.

---

## Accuracy verification — site-wide

Beyond the calculators, the following 2026 figures are baked into user-visible copy and data files. All were spot-checked.

| Figure | Value | Location | 2026 authoritative | Match? |
| --- | --- | --- | --- | --- |
| Medicare Part B standard premium | $202.90/mo | [systemPrompt.js:6](src/data/systemPrompt.js:6), [Calculator.jsx:30](src/pages/Calculator.jsx:30), Assessment.jsx × 3, refData.js × 4 | $202.90 (CMS) | ✅ |
| SS pre-FRA earnings limit | $24,480 | [Calculator.jsx:783](src/pages/Calculator.jsx:783), refData.js:78, systemPrompt.js:7 | $24,480 | ✅ |
| SS FRA-year earnings limit | $65,160 | systemPrompt.js:7, refData.js:567 | $65,160 | ✅ |
| TSP elective deferral | $24,500 | systemPrompt.js:3, refData.js:159 | $24,500 | ✅ |
| TSP catch-up age 50–59 / 64+ | +$8,000 | systemPrompt.js:3 | $8,000 | ✅ |
| TSP super catch-up age 60–63 | +$11,250 | systemPrompt.js:3, refData.js:164 | $11,250 | ✅ |
| HSA self / family | $4,400 / $8,750 | systemPrompt.js:4, refData.js:339 | ✅ | ✅ |
| FSAFEDS carryover | $680 | systemPrompt.js:4, refData.js:360 | $680 | ✅ |
| SS credit | $1,890 | systemPrompt.js:7 | $1,890 | ✅ |
| BEDB | $43,800.53 (Dec 2025 COLA-adjusted) | systemPrompt.js:9 | ✅ | ✅ |
| WEP/GPO | **REPEALED** (Social Security Fairness Act, Jan 2025) | systemPrompt.js:7, Assessment.jsx:477, Calculator.jsx:822 | Repealed | ✅ |
| FERS-RAE / FERS-FRAE employee contributions | 3.1% / 4.4% | systemPrompt.js:33 | ✅ | ✅ |
| VSIP statutory civilian cap | $25,000 | systemPrompt.js:8, VeraVsip.jsx:114 | $25,000 (5 U.S.C. § 3523) | ✅ |
| VERA eligibility | age 50+ & 20 YOS OR any age & 25 YOS | VeraVsip.jsx:72 | ✅ | ✅ |
| H.R. 7256 (119th Congress, Langworthy) | "advanced in committee, early 2026" | VeraVsip.jsx:229 | Accurate per committee markup | ✅ |

**Overall:** the *individual numbers* are solid across systemPrompt, refData, Assessment, and VeraVsip. The bugs live in Calculator.jsx (FERS Supplement division) and FEGLICalculator.jsx (Option B coverage display, post-65 Basic rates, stale rate labels), and in the `Part B → Part /` corruption in refData.js.

---

## Site-wide audit (routing, functions, auth, a11y, SEO)

### Netlify functions

All 6 functions in `netlify/functions/` audited. Full security report below — ranked worst to best:

1. **`calendly-webhook.js` — HIGHEST RISK.** [Lines 70-78](netlify/functions/calendly-webhook.js:70) fail-open if `CALENDLY_WEBHOOK_SIGNING_KEY` env var is missing: `console.warn('CALENDLY_WEBHOOK_SIGNING_KEY not set — accepting request without signature verification')`. An attacker who finds the endpoint can flood Airtable with fake consultation records. URLs at [:145-146](netlify/functions/calendly-webhook.js:145) are truncated to 500 chars but not validated as `https://calendly.com`. Fix: convert the warn to a hard `return 500` when the env var is missing, and add a Netlify build check.
2. **`chat.js`** — Unauthenticated Anthropic proxy. Rate-limited 20 req/min/IP ([chat.js:137-144](netlify/functions/chat.js:137)). Rotating IPs bypasses. Supabase JWT verification would be a 10-line addition matching the `get-leads.js` pattern. Also: user content is truncated to 2000 chars and control-char-stripped at [:206](netlify/functions/chat.js:206) but no prompt-injection hardening.
3. **`send-results-email.js`** — Unauthenticated Resend proxy, rate-limited 10/15min/IP. Subject is built with `escapeHtml()` at [:250](netlify/functions/send-results-email.js:250) — HTML-escaping on a plaintext subject inserts `&amp;` in inboxes. Should `.replace(/[\r\n]/g, '')` instead. No header injection risk — Resend API is JSON, not SMTP.
4. **`add-lead.js`** — Public (intentional, pre-auth signup). CORS locked to `https://fedbenefitsaid.com`. Rate-limited 50/15min/IP. In-memory Map rate limit is per-container — cold starts reset it. `sanitizeString` at [:40-43](netlify/functions/add-lead.js:40) is **defined but never called** on `name`/`phone` fields before they hit Airtable.
5. **`update-lead.js`** — JWT-gated with same `email === 'jhf17@icloud.com'` pattern. Fields are passed directly to Airtable PATCH with **no field allowlist** ([:105](netlify/functions/update-lead.js:105)). Acceptable because admin is trusted, but defense-in-depth would be a good addition.
6. **`get-leads.js`** — JWT-gated ([:34-42](netlify/functions/get-leads.js:34)), single-email allowlist, read-only. Only flaw is the missing `OPTIONS` handler (the function returns 405 for any non-GET). The admin dashboard works because simple GETs with only `Authorization` don't always trigger preflight.

**#1 fix before any outbound push:** enforce `CALENDLY_WEBHOOK_SIGNING_KEY`. Check it's set in the Netlify environment via `netlify env:get`. If set and the signature header is sent, the function already verifies correctly at [:53-65](netlify/functions/calendly-webhook.js:53) (wrapped in try/catch, uses `timingSafeEqual`). If not set, it fails open.

### Navbar vs. routes vs. sitemap

Navbar links ([Navbar.jsx:46-64](src/components/Navbar.jsx:46)): Assessment, Calculators, Reference, Resources, VERA/VSIP, Chat, Meeting (→ /consultation), Admin (conditional on admin email). Every link resolves to a real route.

Footer links ([Footer.jsx:37-54](src/components/Footer.jsx:37)): Retirement Calculator → `/calculators`, Readiness Assessment → `/assessment`, AI Benefits Chat → `/chat`, Reference Guide → `/reference`, Resources and Forms → `/resources`, Book a Consultation (Calendly external), Disclaimer, Privacy Policy, Terms of Service. All resolve.

**Sitemap drift** — `public/sitemap.xml` lists 10 URLs; the site has 18 real routes (15 public + 3 auth-protected). Missing indexable routes:

- `/calculators` (hub)
- `/calculators/fegli`
- `/vera-vsip`

Also missing but probably intentional:
- `/training`, `/training/quiz/:topicId` (auth-gated — could still be indexed as login gates)

Correctly excluded:
- `/admin`, `/login`, `/signup` (disallowed in robots.txt)

Every sitemap entry has `lastmod = 2026-04-08`. Today is 2026-04-15 — one week stale. Auto-generating sitemap.xml from routes at build time would fix drift permanently.

### Auth flow

- `/signup` → Supabase `auth.signUp` + fire-and-forget `/.netlify/functions/add-lead` → Airtable. CRM writes can silently drop if the user closes the tab before the retry completes.
- Login flash-message support via `location.state.message` from `ProtectedRoute` redirects.
- Admin dashboard client-side gate is advisory; real gate is server-side in `get-leads.js` + `update-lead.js`.
- Training + Quiz routes use `ProtectedRoute` wrapper which redirects unauthed users to `/login`.
- Chat is open to guests with a client-side 3-message limit.

### Accessibility quick pass

- `index.html` has **two redundant skip-nav links** (`.skip-nav` and `.skip-to-content`) plus a **third** skip-nav inside `Navbar.jsx:33`. Three skip links is unusual and could confuse screen readers.
- `:focus-visible` rules are defined in both `index.html` (inline styles, lines 105-110 and 164-181) and effectively duplicated. One copy, one place.
- Navbar has `aria-label`, `aria-current`, `aria-expanded`, `aria-controls`, `aria-labelledby` correctly set.
- `ErrorBoundary` has no `role="alert"` / `aria-live` on the fallback UI.
- No obvious image `alt` gaps in what I read (all `<img>` tags in Consultation/Landing have alt text or role).
- Color contrast: maroon `#7b1c2e` on `#faf9f6` is fine. `rgba(255,255,255,0.75)` footer text on `#0f172a` navy is likely around 10:1 — fine.

### SEO basics

- `index.html` meta `description`, `keywords`, `canonical`, Open Graph (url/title/description/image/site_name), Twitter Card (summary_large_image) — all present.
- **`og-image.png` file does not exist.** A HEAD request to `https://fedbenefitsaid.com/og-image.png` returns `content-type: text/html, content-length: 7293` — that's the Netlify SPA catch-all serving `index.html`. Social shares will show no preview image. `public/` contains only `favicon.svg`, `fma-logo.png`, `robots.txt`, `sitemap.xml`. **High-priority fix.**
- JSON-LD structured data: WebSite, Organization, FAQPage (3 questions). Good.
- `robots.txt` correctly disallows `/admin`, `/login`, `/signup` and points at `/sitemap.xml`.
- Per-page `document.title` is set via `useEffect` in most pages (Disclaimer, Privacy, Terms, VeraVsip, Reference, etc.) — good for SPA discoverability. Landing.jsx uses the `index.html` default.
- Per-page meta description is **not** injected dynamically (no `react-helmet` equivalent). Every route shows the homepage description in search results.

### Performance / Lighthouse

I did not run a live Lighthouse report (no Lighthouse CLI in this session). Code-level signals:

- **Bundle splitting**: `App.jsx` lazy-loads every non-critical route (Calculator, Tools, FEGLICalculator, Assessment, Chat, Quiz, Course, Reference, Resources, Admin, VeraVsip). Landing, Auth, Disclaimer, Terms, Privacy, Consultation, Navbar, Footer, CookieConsent, ErrorBoundary, ProtectedRoute, ScrollToTop are eagerly bundled.
- **Fonts**: Google Fonts `Merriweather` (4 weights × 2 styles) + `Source Sans 3` (4 weights) loaded from `fonts.googleapis.com` with `preconnect`. This is the main non-critical blocker. Swap to `font-display: swap` at minimum (add `&display=swap` — already present on line 28 of index.html). ✅
- **Images**: Hero uses inline SVG (no network), `fma-logo.png` at 80 KB, `favicon.svg` minimal. `og-image.png` is missing (see SEO). No hero photograph.
- **No `manualChunks`** in `vite.config.js`. React + ReactDOM + Supabase are in the main chunk. Splitting `supabase-js` into its own chunk would save ~40 KB on the first load for non-authed visitors.
- **GA4**: Loaded async via `<script async>` — fine.
- **3rd-party CSS**: None beyond Google Fonts.

Expected Lighthouse mobile scores (estimated from structure + CDN latency): Performance **~75-85**, Accessibility **~95**, Best Practices **~100**, SEO **~90**. The FAQ JSON-LD, canonical URL, and meta description set should give SEO a head start. Real numbers would need a live run on PageSpeed Insights.

---

## Redundancy / dead code findings

### Unused files

- **`src/data/colors.js`** — 70 LOC of design tokens (navy, maroonMid, gold, heroGradient, textColors, borders, bgCard, success/warning/error/info). **Nothing in the codebase imports from this file.** Grep for `from '../data/colors'` → 0 matches. `from './data/colors'` → 0 matches. The "official" design tokens live in `src/constants/theme.js`, which is imported by `Footer.jsx` only. Every other page inlines its colors directly. **Delete colors.js.**

### Unused state, functions, parameters

- [Calculator.jsx:277](src/pages/Calculator.jsx:277) — `showFIA` state variable never read.
- [Calculator.jsx:329](src/pages/Calculator.jsx:329) — `includeSupp` state variable never gates any rendering.
- [Calculator.jsx:463-467](src/pages/Calculator.jsx:463) — `fiaPayouts` computed but never displayed.
- [Calculator.jsx:1084-1086](src/pages/Calculator.jsx:1084) — `yrsServiceLabel` function defined, never called.
- [Calculator.jsx:12-13](src/pages/Calculator.jsx:12) — `SS_BEND1` / `SS_BEND2` constants declared, never used in any formula.
- [FEGLICalculator.jsx:27](src/pages/FEGLICalculator.jsx:27) — `FEGLI_BASIC_ANNUITANT` constant declared, never used (line 80 uses an inline literal).
- [FEGLICalculator.jsx:53](src/pages/FEGLICalculator.jsx:53), [:171](src/pages/FEGLICalculator.jsx:171) — `retireAge`, `retirementStatus` are `calcFEGLI` parameters and user inputs but never consumed inside the function.
- [Assessment.jsx:966](src/pages/Assessment.jsx:966), [:1069-1113](src/pages/Assessment.jsx:1069) — `showChecklist`, `handleUnlockChecklist`, `handleUnlockForUser` all exist but no JSX reads them.
- [Assessment.jsx:194-200](src/pages/Assessment.jsx:194) — `CATEGORIES.icon` fields (mix of single-char strings and raw SVG) are never rendered.
- [add-lead.js:40](netlify/functions/add-lead.js:40) — `sanitizeString` helper defined, never called on `name`/`phone` before Airtable insert.
- [Course.jsx:95](src/pages/Course.jsx:95) — dead ternary `{chatAddon1 ? '.99' : '.99'}`.

### TODO / FIXME / lorem / placeholder

Grep across the entire worktree for `TODO|FIXME|XXX|HACK|PLACEHOLDER|Lorem|lorem|TBD|ComingSoon|coming soon` returned **zero matches**. No commented-out dead code blocks of note beyond `Course.jsx:95`.

### Overlap between pages

- **`/reference` vs `/resources`** — Both exist; neither is redundant. Reference = in-house topic explainers with numbers and rules. Resources = outbound directory of official government forms and links. Keep both. Consider adding cross-links: from each Reference topic detail → the relevant Resources form PDF; from Resources → the explanation on Reference.
- **`/training` vs `/assessment`** — Different audiences. Training is "learn the material" (course + quizzes). Assessment is "score yourself" (gap analysis → action plan). No merge needed. But Training is currently a vapor product (see bug #12 above), so the practical question is whether to pull it off the site until it's real.
- **`/calculator` vs `/calculators` vs `/calculators/fegli`** — `/calculator` (singular) is the FERS/CSRS/Special calculator. `/calculators` is a hub page. `/calculators/fegli` is the FEGLI calculator. The naming is inconsistent but the structure works. Rename file `Tools.jsx` → `Calculators.jsx` for clarity. Consider making `/calculator` a redirect to `/calculators/income` for URL consistency, or leaving it as-is.
- **`/consultation` vs Calendly CTA embedded elsewhere** — Consultation.jsx is a full-fledged landing page. The Calendly link is referenced 13 times across 10 files ([Calculator.jsx](src/pages/Calculator.jsx:1), [FEGLICalculator.jsx](src/pages/FEGLICalculator.jsx:1), [Consultation.jsx](src/pages/Consultation.jsx:1) × 2, [Disclaimer.jsx](src/pages/Disclaimer.jsx:2), [Terms.jsx](src/pages/Terms.jsx:2), [Assessment.jsx](src/pages/Assessment.jsx:1), [Landing.jsx](src/pages/Landing.jsx:2), [ConsultantCTA.jsx](src/components/ConsultantCTA.jsx:1), [Footer.jsx](src/components/Footer.jsx:1), [Tools.jsx](src/pages/Tools.jsx:1)). **Centralize** into a single constant file so a future Calendly URL change is one edit.

### Cross-file value drift

- **Assessment question count**: "14" on Assessment.jsx / Privacy.jsx / Landing.jsx, "12" on Terms.jsx:31.
- **Admin email**: hardcoded in 7 files (Terms, Privacy, Admin, Navbar, update-lead.js, get-leads.js, CLAUDE.md). Move to env var for backend, and to a build-time constant for frontend.
- **Calendly URL**: 13 occurrences — see above.

---

## Accessibility + SEO + performance (quick scorecards)

Since I can't run a live Lighthouse pass in this session, these are code-level scorecards. Numbers to be confirmed by running PageSpeed Insights on each route.

| Page | Perf (est.) | A11y | Best Prac. | SEO | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | 82 | 95 | 100 | 90 | No hero photo; lazy routes cached. JSON-LD present. |
| `/calculator` | 78 | 93 | 100 | 85 | Lazy chunk on first load; dense form. No page-specific meta description. |
| `/calculators/fegli` | 78 | 93 | 100 | 85 | Same. |
| `/assessment` | 75 | 93 | 100 | 85 | Biggest page (1,426 LOC) — largest lazy chunk. |
| `/reference` | 80 | 95 | 100 | 90 | `refData.js` is 903 LOC, 70 KB — loaded lazily. |
| `/consultation` | 85 | 95 | 100 | 85 | No inline Calendly embed hurts UX, helps perf. |
| `/vera-vsip` | 85 | 95 | 100 | 85 | Shortest page with most citations. |
| All legal pages | 90 | 95 | 100 | 80 | Not in sitemap fully; missing per-route meta description. |

**Material SEO misses site-wide:**
- og-image.png returns HTML fallback.
- Sitemap is missing 3 indexable routes and has frozen `lastmod`.
- Per-route meta description not injected — every page inherits the homepage description.
- No `<link rel="alternate">` or `hreflang` (US-only audience, probably fine).

---

## Recommended actions ranked by impact

### Ship-blocker fixes before any outbound push

1. **Calculator.jsx:266** — remove `/ 12` from `calcFERSSupplement`. **1-character change.** Restores correct FERS Supplement output (currently 12× too small for every affected retiree).
2. **FEGLICalculator.jsx:126** — change `(salary/1000)` to `salary` for Option B coverage display. Fixes the 1,000× coverage understatement.
3. **refData.js** — find-and-replace `Part /` → `Part B` (36 occurrences) and `FEH/` → `FEHB` (17). Verify there are no other B-to-slash corruptions with `grep -n 'B/' src/data/`.
4. **calendly-webhook.js:70-78** — fail-closed when `CALENDLY_WEBHOOK_SIGNING_KEY` is missing. Confirm env var is set in Netlify.
5. **public/og-image.png** — create and upload a real PNG (1200×630 social share image). Reference it at [index.html:17](index.html:17).

### Polish that raises trust

6. **FEGLICalculator.jsx:93, :95** — fix post-65 Basic reduction rates (0.75 → 0.94, 2.25 → 2.55 per OPM, or re-verify against OPM 2026 tables if they changed).
7. **FEGLICalculator.jsx:510, :545-555, :689** — replace hardcoded `$0.3250` / `$0.33` Basic rate text with template literal interpolation of `FEGLI_BASIC_EMPLOYEE`.
8. **Calculator.jsx:309-313** — expand MRA table to the full OPM 2-month phased schedule OR at minimum add 1948–1964 buckets.
9. **Calculator.jsx:298** — compute SS FRA from birth year instead of hardcoding 67.
10. **Assessment.jsx:1191** — destructure `defaultExpanded` in `DetailSection` so weakest categories auto-expand.
11. **Assessment.jsx:1051-1056** — fix `sendAssessmentEmail` to use `item.task` instead of `item.text || item.title`. Email checklist items currently render blank.
12. **Landing.jsx:473** — fix the 30.8% → 28% copy OR change the scenario YOS/age so the claim is correct.
13. **Landing.jsx:499** — "Six" → "Eight" comprehensive categories.
14. **Terms.jsx:31** — "12-question" → "14-question".
15. **Privacy.jsx** — add CCPA disclosure, retention period, "not affiliated with OPM" line, data transfer notice.
16. **Consultation.jsx:335** — substantiate or soften the "certified federal retirement specialist" claim. Add consultant name + photo.
17. **chat.js** — add Supabase JWT verification to stop unauthenticated Anthropic proxy abuse. Also worth capping `messages` array length server-side.

### Course-correcting product decisions

18. **Course.jsx / `/training`** — pull from nav OR ship the product. "Contact Sales" goes to `/signup`. 11 modules advertised, 9 exist. Bad smell.
19. **Quiz.jsx / `/training/quiz/:topicId`** — link it. Right now nobody can reach the quizzes except by typing URLs.
20. **Chat persistence** — decide whether to log conversations to the Supabase `conversations` / `messages` tables that already exist in `supabase_schema.sql`. They're currently ephemeral.

### Cleanup (do anytime)

21. Delete `src/data/colors.js` (70 LOC of dead code). Verify no imports first.
22. Delete `Calculator.jsx` dead state (`showFIA`, `includeSupp`, `fiaPayouts`, `yrsServiceLabel`, `SS_BEND1`, `SS_BEND2`).
23. Delete `FEGLICalculator.jsx:27` dead constant, wire or delete `fegliRetireAge` / `fegliRetirementStatus` inputs.
24. Delete `Assessment.jsx` dead paths (`showChecklist`, `handleUnlockChecklist`, `handleUnlockForUser`, unused `CATEGORIES.icon` fields).
25. Delete `Course.jsx:95` dead ternary.
26. Wire `add-lead.js:40` `sanitizeString` into the field assignments at `:218-220`, or delete it.
27. Centralize the Calendly URL constant — 13 duplications → 1.
28. Rename `src/pages/Tools.jsx` → `src/pages/Calculators.jsx`.
29. Auto-generate `sitemap.xml` from route list at build time.
30. Move `ADMIN_EMAIL` out of the client bundle into an env var (requires inlining via `import.meta.env` at build time).

---

## Data for the strategist

### Route inventory (confirmed live)
```
/                          Landing              public       595 LOC
/login                     Auth(login)          public       557
/signup                    Auth(signup)         public       557 (shared)
/calculator                Calculator           public     1,132
/calculators               Tools (→Calculators) public       349
/calculators/fegli         FEGLICalculator      public       790
/assessment                Assessment           public     1,426
/reference                 Reference            public       639 (+ 903 refData.js)
/resources                 Resources            public       364
/chat                      Chat                 public       591 (incorrectly described as auth-req in CLAUDE.md)
/consultation              Consultation         public       696
/vera-vsip                 VeraVsip             public       277
/training                  Course               auth         307
/training/quiz/:topicId    Quiz                 auth         521 (+ 776 quizData.js)
/admin                     Admin                admin only 1,097
/disclaimer                Disclaimer           public       148
/terms                     Terms                public       280
/privacy                   Privacy              public       407
```

### All tools / calculators / interactive widgets
```
/calculator         — FERS/CSRS/Special retirement income calculator (3 tabs)
/calculators/fegli  — FEGLI premium + coverage calculator
/assessment         — 14-question readiness assessment with weighted scoring
/chat               — Claude Haiku 4.5 federal benefits Q&A chat
/reference          — Searchable in-house benefit topic directory
/training           — Course landing (vapor product)
/training/quiz/:id  — Interactive quiz runner (9 topics, orphaned — no links in)
```

### All Netlify functions
```
add-lead.js            public   269 LOC  Airtable lead upsert; in-memory rate limit; unsanitized name/phone
calendly-webhook.js    public   357      Calendly invitee.created/canceled; FAIL-OPEN if signing key missing
chat.js                public   274      Anthropic proxy + Airtable rule lookup; NO auth; 20 req/min
get-leads.js           admin    90       Supabase JWT + email allowlist; read-only; missing OPTIONS
send-results-email.js  public   297      Resend proxy; NO auth; 10/15min
update-lead.js         admin    166      Supabase JWT + email allowlist; no field allowlist
```

### LOC totals
```
src/pages/           ~10,959  (17 files)
src/components/          781  (7 files)
src/App.jsx + main.jsx   135
src/data/              1,725  (colors.js 70 DEAD + refData 903 + quizData 776 + systemPrompt 46)
src/constants/            58  (theme.js — only used by Footer)
netlify/functions/     1,453  (6 files)
TOTAL                 15,111  (excluding node_modules, CSS, HTML)
```

### Dependency concerns (package.json)
```
react ^18.3.1
react-dom ^18.3.1
react-router-dom ^6.24.1
@supabase/supabase-js ^2.43.4
vite ^5.3.4
@vitejs/plugin-react ^4.3.1
```
**What's missing**: no ESLint, no Prettier, no TypeScript, no Vitest/Jest, no Lighthouse CI, no Husky/lint-staged, no @testing-library, no `react-helmet` for per-route meta, no Sentry. Zero build/test guardrails. Every commit ships straight to prod with no automated verification. Given the recent calculator bugs, this is the biggest latent risk — a test suite for the calculator math would have caught the FERS Supplement `/12` regression and the Option B coverage bug before they ever shipped.

### External services in production
```
Supabase       https://zmmidbkfdlmptegnrhjb.supabase.co  (auth + schema.sql tables)
Airtable       base appnihKPbDBxVQK4c (leads/campaigns/consultations)
Anthropic      claude-haiku-4-5-20251001 via chat.js
Resend         transactional email (results, notifications)
Calendly       calendly.com/jhf17/30min (booking)
Google Analytics G-6K0NHQ5WSK (hardcoded in index.html + CookieConsent.jsx)
Netlify        hosting + functions
Cloudflare     CDN in front of Netlify (per CLAUDE.md)
```

### Visual evidence

Headless Chrome screenshots (1280×900 viewport, live production) were written to `/tmp/fba-screenshots/`. They are not committed to the repo per the audit's "no file modifications beyond the report + primer" constraint. To view them:
```
ls -la /tmp/fba-screenshots/
```
If you want them attached as audit artifacts, run a separate turn to copy them into a `screenshots/` directory in the repo and commit.

---

## Conflicts surfaced during this audit

| Source | Claim | Reality |
| --- | --- | --- |
| CLAUDE.md | "Chat: auth required" | Public; client-side 3-msg limit (Chat.jsx:15-21) |
| CLAUDE.md | "Landing has 4-card grid and 4 how-it-works steps" | 8 sections, 8-card reference grid, calculator + assessment + chat previews |
| CLAUDE.md | "Calculator is a FERS calculator" | FERS + CSRS + Special Provisions (3 tabs) |
| Terms.jsx:31 | "12-question quiz" | Assessment is 14 questions |
| Landing.jsx:473 | "30.8% of high-3" @ 28 YOS, age 56 | 28% (and not eligible for immediate unreduced anyway) |
| Landing.jsx:499 | "Six comprehensive categories" | 8 cards rendered |
| Course.jsx:20 | "11 Benefit Modules" | quizData.js has 9 modules |
| FEGLICalculator.jsx:510 | "$0.3250 per $1,000 biweekly" | Constant in use is $0.1600 |
| Calculator.jsx:266 | `calcFERSSupplement = (yrs/40) × ss / 12` | Should be `(yrs/40) × ss_monthly`, no division |
| refData.js × 53 | `Part /`, `FEH/` | Should be `Part B`, `FEHB` |
| index.html meta og:image | `/og-image.png` | File does not exist |
| sitemap.xml | 10 URLs | 18 real routes (missing /calculators, /calculators/fegli, /vera-vsip) |
| calendly-webhook.js:76-78 | "not set — accepting request" | Should fail closed |

Rule applied: **current code wins**. All of the above are flagged as bugs in the recommended actions list.

---

End of audit. Total compilation time: 1 pass, 6 parallel subagents, 1 main thread, ~45 minutes wall-clock. No source code modified. Two files written in this run: this audit report and `primer.md` (creating, since it did not previously exist).
