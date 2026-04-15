# primer.md — FedBenefitsAid live-state truth

> **Note on file creation:** This file was created during the 2026-04-15 site audit. Prior to that audit there was no primer.md in the repo — the audit prompt referenced one as "Jack's canonical source of live-state truth with a §10 bug list," but no such file existed in either the worktree or the main repo. This is now the canonical primer going forward. Append new sections in reverse chronological order (newest at top).

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
