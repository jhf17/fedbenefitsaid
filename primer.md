# primer.md — FedBenefitsAid live-state truth

> **Note on file creation:** This file was created during the 2026-04-15 site audit. Prior to that audit there was no primer.md in the repo — the audit prompt referenced one as "Jack's canonical source of live-state truth with a §10 bug list," but no such file existed in either the worktree or the main repo. This is now the canonical primer going forward. Append new sections in reverse chronological order (newest at top).

---

## Workstream 0 Hotfix 2026-04-15

Four credibility-emergency fixes from the 2026-04-15 audit ship-blocker list were shipped to production in a single hotfix pass. All four are verified live on both `main--fedbenefitsaid.netlify.app` (direct) and `fedbenefitsaid.com` (apex through Cloudflare). The deployed bundle hashes are `index-DgPWiC8o.js` / `Reference-DEGGaWbO.js`.

### Commits (on main, all pushed to origin)

| Commit | File | Fix |
| --- | --- | --- |
| `4f79ddf` | [src/pages/Calculator.jsx:266](src/pages/Calculator.jsx:266) | Removed extra `/ 12` from `calcFERSSupplement` |
| `0ae9145` | [src/pages/FEGLICalculator.jsx:126, :131](src/pages/FEGLICalculator.jsx:126) | Changed `optBPerK * (salary/1000)` to `optBPerK * salary` on both the `optB` and `totalCoverage` fields in `calcFEGLI`'s return value |
| `dcec260` | [src/data/refData.js](src/data/refData.js) | Global replacements: `Part /` → `Part B` (36 hits) and `FEH/` → `FEHB` (17 hits) |
| `198f116` | [src/pages/Landing.jsx:472-475](src/pages/Landing.jsx:472) | Replaced the 56yo/28yo chat bubble scenario with a mathematically correct 60yo/25yo scenario eligible under the Age 60 + 20 years rule |
| `0c98331` | [src/data/refData.js:492](src/data/refData.js:492) | Follow-up: fixed `Parts /` (plural) in the IRMAA topic summary — a plural-form corruption the audit missed and that the initial Fix #3 didn't catch. Caught during post-deploy browser verification. |

### Verification tests that passed

End-to-end browser verification via Chrome MCP against `main--fedbenefitsaid.netlify.app`:

- **Fix #1 — Calculator /calculator (FERS Supplement)**: entered Years=30, High-3=$120,000, Current Age=57, Retire Age=57, SS at 62=$2,000/mo. The rendered FERS SUPPLEMENT value was **$1,500/mo** (matches `(30/40) × 2000`). Pre-fix would have shown $125. Sanity-check of surrounding numbers confirmed: Pension $2,700/mo (= $32,400 net annual / 12), Social Security $2,857/mo (= $2000 × 100/70 at age 67), Total $7,057/mo.
- **Fix #2 — FEGLI /calculators/fegli (Option B coverage)**: entered salary=$72,000, age=50, Option B multiples=5. The rendered TOTAL COVERAGE was **$444,000** (= BIA $74,000 + Option A $10,000 + Option B $360,000). Pre-fix would have shown $84,360. Monthly premium shown at $106 also matches the pre-$1,000 rate formula.
- **Fix #3 — Reference /reference (refData typos)**: navigated to Medicare category, then to the "Parts A, B, C, D Overview" topic detail. Body text contained "layers on top of **FEHB** in retirement", "2026 **Part B** standard premium", "**Part A** (Hospital)", "**Part B** (Medical)", and 8 clean `FEHB` + 2 clean `Part B` occurrences. Zero occurrences of `Part /`, `Parts /`, or `FEH/` anywhere on the page. IRMAA topic summary verified to read "Higher-income retirees pay more for **Parts B and D**".
- **Fix #4 — Landing / home (chat bubble)**: body text now reads `"I'm 60 with 25 years of service. Can I retire with a full pension?" → "Yes — you're eligible for an immediate, unreduced FERS retirement under the Age 60 + 20 years rule. Your pension would be 25% of your high-3 salary (1.0% × 25 years)…" → "…Your estimated FERS pension: $31,250/year ($2,604/month). You'd also qualify for the FERS Supplement until age 62."` Zero occurrences of the old "56 with 28 years", "30.8%", or "$38,500/year" strings.

Apex URL `https://fedbenefitsaid.com` serves the same bundle as Netlify direct (hash-matched `index-DgPWiC8o.js`), with all chunks returning HTTP 200. Cloudflare cache did not need purging — the HTML response has `cache-control: public, max-age=0, must-revalidate` so the SPA entry point always round-trips to Netlify, and asset filenames are content-hashed so the new chunks replace the old ones cleanly.

### Regression sweep results (clean)

- Footer links to `/disclaimer`, `/privacy`, `/terms` are intact (zero `href="#"` anywhere in `src/`)
- `role="alert"` preserved on Calculator.jsx:752 and FEGLICalculator.jsx:422
- `scope="col"` preserved on Calculator.jsx:913-915 and FEGLICalculator.jsx:539-543, :589-591
- Capitol dome SVG still in Landing.jsx (`.dome-group` class at L85, `<g className="dome-group">` at L153, flagpole, American flag all intact)
- Zero matches for `eagle` in Landing.jsx (no regression of removed animation code)
- `npm run build` succeeds (648ms, all chunks emit)

### Unrelated build warning flagged for next pass

`npm run build` emits a **pre-existing** warning:
`[plugin vite:esbuild] src/components/Navbar.jsx: Duplicate key "display" in object literal` at line 280.
This is not caused by the hotfix (I did not touch Navbar.jsx) — the `mobileLink` style object has `display: 'block'` at the top and `display: 'flex'` at the bottom, with the second winning silently. Out of scope for Workstream 0; worth addressing in a future cleanup pass.

### Ship-blockers cleared

Of the 5 ship-blockers listed in [site-audit-2026-04-15.md](site-audit-2026-04-15.md) and the "Ship-blocker bugs" section of this primer, **4 of 5 are now cleared**:

- [x] **#1 Calculator.jsx:266 FERS Supplement /12** — FIXED in `4f79ddf`, verified $1,500/mo live
- [x] **#2 FEGLICalculator.jsx:126 Option B coverage 1000×** — FIXED in `0ae9145`, verified $360,000 live
- [x] **#3 refData.js Part B / FEHB corruption** — FIXED in `dcec260` + follow-up `0c98331`, verified clean on live Reference page
- [ ] **#4 calendly-webhook.js fail-open on missing signing key** — NOT in Workstream 0 scope; still open. Verify `CALENDLY_WEBHOOK_SIGNING_KEY` is set in the Netlify environment before any outbound push.
- [ ] **#5 public/og-image.png missing** — NOT in Workstream 0 scope; still open. Social sharing will continue to show no preview image until a 1200×630 PNG is uploaded.

The Workstream 0 prompt explicitly included the Landing.jsx:473 marketing math error as a fourth fix (it was listed under "High-leverage polish" in the prior audit, not as a ship-blocker, but was elevated by the user). That is now also cleared in `198f116`.

### Surprises / notes for Jack

1. **`claude/busy-lovelace` branch has overlapping work.** I discovered at the start of Workstream 0 that the `claude/busy-lovelace` worktree had 3 unpushed commits dated Apr 13 that contained 3 of the 4 fixes already (Calculator FERS Supplement, FEGLI Option B, refData Part B/FEHB), plus 4 additional real bug fixes (FEGLI Option A rate bracket bug, TSP 0% growth division-by-zero guard, SS_BEND removal, retirement-age label clarification) and a deletion of the vapor `Course.jsx`/`Quiz.jsx`/`quizData.js`. Option A (strict hotfix) was chosen: I used busy-lovelace as a reference but wrote my own edits to stay in Workstream 0 scope. `claude/busy-lovelace` is still a live local branch (unpushed) and should be harvested for the Option A rate bracket fix and TSP 0% guard in a future workstream — those are real bugs the audit missed.
2. **`dreamy-varahamihira` worktree is empty/abandoned** (commit d8f3f16, no unique commits). Safe to delete anytime.
3. **The audit's enumeration of the refData.js B → / corruption was incomplete.** The audit found 36 "Part /" and 17 "FEH/" but missed the plural form "Parts /". Caught only because post-deploy browser verification drilled into the actual /reference Medicare view. Lesson: always test the page *body* after a mass find/replace, not just grep counts.
4. **Vite production build strips comments**, which caused my initial plain-text bundle grep to miss the Fix #1/#2 marker strings I added as inline source comments. Browser-based functional testing via Chrome MCP closed the loop.
5. **No Cloudflare purge was required**, because the SPA index is served with `max-age=0, must-revalidate` and asset chunks are content-hashed. Saves a step on future deploys as long as that cache-control header stays in place.

---

## Site Audit 2026-04-15

A full read-only audit was run on 2026-04-15 against worktree `funny-tesla` at commit `d8f3f16`. Full report at [site-audit-2026-04-15.md](site-audit-2026-04-15.md). This section summarizes the findings and corrects anything that was stale in other reference files (CLAUDE.md, etc.).

### Ship-blocker bugs (fix before any outbound push)

1. **`Calculator.jsx:266`** — `calcFERSSupplement` divides by 12 when it shouldn't. Output is 12× too small for every affected retiree. One-character fix.
2. **`FEGLICalculator.jsx:126`** — Option B coverage display is 1,000× too small. Shows $360 for what should be $360,000. Premiums are still correct; only the displayed coverage total is wrong.
3. **`src/data/refData.js`** — `Part B` → `Part /` corruption (36 hits) and `FEHB` → `FEH/` corruption (17 hits). Visible to every user who opens Reference → Medicare / FEHB. Looks like a bad find/replace.
4. **`netlify/functions/calendly-webhook.js:70-78`** — fails open if `CALENDLY_WEBHOOK_SIGNING_KEY` env var is missing. Should fail closed. Verify env var is set in Netlify before any outbound push.
5. **`public/og-image.png`** — file doesn't exist. Meta tags reference it; HEAD request returns SPA HTML fallback. Social sharing will have no preview image. Create a 1200×630 PNG.

### High-leverage polish

- **`Course.jsx` / `/training`** — sells 11 modules; quizData.js has 9. "Contact Sales" links to `/signup`. Pricing is mock. Pull from nav or ship the product.
- **`chat.js`** — no auth in front of Anthropic proxy. Add Supabase JWT verification (same pattern as `get-leads.js:34-42`).
- **`send-results-email.js`** — no auth in front of Resend. Bill-pump risk.
- **Assessment question count drift** — Terms.jsx:31 says "12", every other page says "14". Fix Terms.
- **Landing.jsx:473** — "approximately 30.8% of your high-3" at 28 YOS + age 56 is wrong (should be 28%, and the user isn't eligible for immediate unreduced retirement at that age/service anyway).
- **Landing.jsx:499** — "Six comprehensive categories" above an 8-card grid.
- **Assessment.jsx:1191** — `defaultExpanded` prop is passed but `DetailSection` never destructures it. Weakest-category auto-expand is silently broken.
- **Assessment.jsx:1051-1056** — `sendAssessmentEmail` maps checklist items to the wrong shape (`item.text` / `item.title` / `item.desc`) vs. the actual `getChecklist` shape (`item.task`). Emailed action items render blank.
- **Consultation.jsx:335** — "Your consultant is a certified federal retirement specialist" has no name or credential. Either substantiate or soften.
- **Privacy.jsx** — missing CCPA "Do Not Sell" line, retention period, GDPR legal basis, "not affiliated with OPM" line. All small copy fixes.
- **FEGLICalculator.jsx:93, :95** — Post-65 Basic 50%/no-reduction rates (`0.75` / `2.25`) don't match OPM's published values (`0.94` / `2.55`).
- **FEGLICalculator.jsx:510, :545-555, :689** — hardcoded help text shows `$0.3250` / `$0.33` Basic rate but the constant used in math is `$0.1600`. Two different rates visible on one page.
- **Calculator.jsx:309-313** — MRA table oversimplified to 3 buckets; OPM has 10 phased buckets.
- **Calculator.jsx:298** — SS FRA hardcoded to 67; should vary by birth year 1955-1959.

### Reference file corrections (things CLAUDE.md had wrong)

| CLAUDE.md said | Reality as of 2026-04-15 |
| --- | --- |
| "Chat (auth required)" | `/chat` is public. Guests get 3 messages via client-side localStorage gate that is trivially bypassable. |
| "Landing: hero, features (4-card grid), how it works (4 steps), footer" | Landing has 8 sections: hero → 3-card value prop → calculator preview (tabs) → assessment preview → chat preview → 8-card reference grid → resources list → final CTA |
| "Calculator.jsx — FERS retirement calculator" | Calculator.jsx supports FERS, CSRS, and Special Provisions (LEO/firefighter/ATC/congressional) via tabs |

### Dead code to remove

- `src/data/colors.js` (70 LOC) — 0 imports anywhere in the codebase. Design tokens live in `src/constants/theme.js` (imported only by Footer.jsx).
- `Calculator.jsx` dead state: `showFIA`, `includeSupp`, `fiaPayouts`, `yrsServiceLabel`, `SS_BEND1`, `SS_BEND2`.
- `FEGLICalculator.jsx` dead: `FEGLI_BASIC_ANNUITANT` constant; `fegliRetireAge` and `fegliRetirementStatus` inputs/parameters that are never read.
- `Assessment.jsx` dead: `showChecklist`, `handleUnlockChecklist`, `handleUnlockForUser`, unused `CATEGORIES.icon` fields.
- `Course.jsx:95` — dead ternary `{chatAddon1 ? '.99' : '.99'}`.
- `add-lead.js:40` — `sanitizeString` helper defined but never called on name/phone before Airtable insert.

### Orphaned route

- `/training/quiz/:topicId` (Quiz.jsx) — no page in `src/pages/` currently links to it. Add entry points from Course.jsx or from Reference.jsx topic detail pages.

### Tooling / dependency gap (latent risk)

`package.json` has **no testing framework, no linter, no type checker, no Lighthouse CI**. Just Vite + React + React Router + Supabase. A Vitest suite covering `calcFERSPension`, `calcFERSSupplement`, `calcCSRSPension`, `calcSpecialPension`, `calcFEGLI` would have caught the two top ship-blocker bugs (FERS Supplement /12 and Option B /1000) before they ever hit prod. Every commit currently goes straight to production with zero automated verification.

### Sitemap / SEO drift

- `public/sitemap.xml` lists 10 URLs. Real site has 18 routes (15 public + 3 auth-protected). Missing indexable routes: `/calculators`, `/calculators/fegli`, `/vera-vsip`. `lastmod` frozen at `2026-04-08` for every entry.
- Per-route `meta description` is not injected. Every route shows the homepage description in search results.
- `og-image.png` referenced but absent (see ship-blocker #5).

### Security posture (net)

- **Strong**: `get-leads.js` + `update-lead.js` enforce `user.email === 'jhf17@icloud.com'` server-side via Supabase JWT. Admin data is properly locked down.
- **Strong**: Netlify HTTP headers (HSTS, X-Frame-Options, CSP, nosniff, Referrer-Policy, Permissions-Policy).
- **Weak**: `calendly-webhook.js` fail-open on missing signing key (see ship-blocker #4).
- **Weak**: `chat.js` + `send-results-email.js` — no auth, rate-limited per IP only (rotatable).
- **Advisory-only**: Admin.jsx client-side email gate + hardcoded `ADMIN_EMAIL` in client bundle (real gate is server-side, but the bundle leaks the owner's email to anyone who inspects it).

### What's genuinely solid

- **`/vera-vsip`** — gold-standard page for citation style. Every factual claim has an inline source comment. Use this as the template for tightening Calculator and Assessment trust signals.
- **Core pension math** (Calculator.jsx FERS / CSRS / Special formulas and constants, excluding the Supplement bug) — correct and well-sourced against OPM for 2026.
- **`systemPrompt.js`** — every 2026 figure quoted in the AI system prompt matches authoritative sources (Part B $202.90, TSP $24,500, WEP/GPO repealed, VSIP $25K cap, etc.).
- **`/reference`** content model — search + categories + topic detail is well-designed (when the typos are fixed).
- **Accessibility foundations** — skip nav, focus indicators, aria labels all present.

---

## How to use this file going forward

- Append new audit sections at the top, dated.
- When a reference file (CLAUDE.md, README, docs) drifts from reality, note the correction here rather than silently rewriting the reference file.
- When a bug is fixed, move its line out of the "ship-blocker" / "polish" list and into a "Fixed as of <date>" subsection — don't delete the record, so regressions can be caught.
- Keep this file under 500 lines. When it grows too long, archive older audit sections into `audit-history/` and keep only the most recent + any open action items at the top.
