# PLAN_AMENDMENTS.md — Scope changes after initial PLAN.md

> `PLAN.md` is the authoritative, immutable original spec. This file holds all scope amendments made during execution. Newest at top, dated.

---

## 2026-04-17 — Five amendments at the start of Tier 2

### T2.13 — Auth layer on unauthenticated Netlify functions

Add Supabase session token verification in front of `chat.js` and `send-results-email.js`. Implementation: read the `Authorization: Bearer <token>` header, verify with the Supabase admin client using `supabase.auth.getUser(token)`, reject with 401 if invalid or missing. Update the frontend callers (`Chat.jsx`, `Calculator.jsx`, `FegliCalculator.jsx`) to attach the current session's access token to every request. Rationale: prevents unauthenticated abuse of Anthropic/Resend APIs. Supabase is already wired into the stack, so this is the cheapest path. Document the pattern in `PROGRESS.md` so future functions follow it.

### T2.14 — Harden calendly-webhook.js fail-closed

Currently fails open if `CALENDLY_WEBHOOK_SIGNING_KEY` env var is missing (processes the webhook without verification). Change to fail closed: if the env var is missing or the signature check fails, return HTTP 500 with error body `{error: "Webhook signature verification unavailable"}` and do not touch Airtable. Also add a startup log line that warns if the env var is unset so it's visible in Netlify function logs. Do this **FIRST** in Tier 2, before T2.1, because it's a security hole and takes 15 minutes.

### T2.14b — Provision and configure the Calendly webhook end-to-end

The user has requested that Code handle the Calendly webhook setup itself rather than requiring manual dashboard work. Execute this sequence:

1. Check for `CALENDLY_API_TOKEN` in the environment (Netlify env vars or local `.env`). If missing, stop and surface as a BLOCKING note in TIER2_REPORT with the instruction: *"User must generate a Personal Access Token at `https://calendly.com/integrations/api_webhooks` and add it to Netlify as `CALENDLY_API_TOKEN` — this is a one-time setup step that takes 2 minutes."* Do not proceed with T2.14b in that case, but continue with the rest of Tier 2.
2. If `CALENDLY_API_TOKEN` is present:
   1. Query Calendly API `GET /users/me` to get the user URI and organization URI.
   2. Query `GET /webhook_subscriptions?organization={org_uri}&scope=organization` to list existing webhooks.
   3. Identify any existing webhook pointing at `https://fedbenefitsaid.com/.netlify/functions/calendly-webhook` — log its state.
   4. Create a new webhook subscription via `POST /webhook_subscriptions` with: `url=https://fedbenefitsaid.com/.netlify/functions/calendly-webhook`, `events=["invitee.created", "invitee.canceled"]`, `organization={org_uri}`, `scope=organization`, `signing_key={generate a secure random 32-byte hex string}`. Calendly returns the webhook UUID in the response.
   5. Set the generated signing key as `CALENDLY_WEBHOOK_SIGNING_KEY` in Netlify env vars. Use the Netlify API if `NETLIFY_AUTH_TOKEN` is available, or the Netlify CLI (`netlify env:set`) if authenticated locally. If neither works, surface as a BLOCKING note in TIER2_REPORT with the exact key value and instruction: *"User must paste this key into Netlify dashboard → Site Settings → Environment Variables as `CALENDLY_WEBHOOK_SIGNING_KEY`."*
   6. If a duplicate old webhook exists pointing at the same URL, DELETE it via `DELETE /webhook_subscriptions/{uuid}` so only the new signed one remains.
   7. Trigger a Netlify rebuild so the new env var takes effect.
   8. Verify end-to-end: after Netlify redeploys, check Netlify function logs for the webhook startup log line — confirm it reads the env var successfully and does NOT log the "missing signing key" warning from T2.14.
3. Document everything in `PROGRESS.md`: whether the API token was present, the new webhook UUID created, whether any duplicate was deleted, whether the Netlify env var was set programmatically or requires manual input, and the verification result.

Do this immediately after T2.14 (since T2.14 hardens the function to fail closed, T2.14b ensures the legitimate Calendly webhook continues to work).

### T2.15 — Verify Resend domain configuration as step 0 of T2.4

Before building lead-capture emails in T2.4, run a probe against Resend: either call the Resend domains API with the existing API key to check domain verification status, or attempt a test send to an internal address. Determine whether `fedbenefitsaid.com` is verified in Resend or whether the account is still on Resend's sandbox (which only delivers to the account owner's verified email). Record findings in `PROGRESS.md`. If sandbox: (a) still build T2.4 end-to-end using the sandbox config, (b) surface a BLOCKING note at the top of TIER2_REPORT explaining what the user must do in the Resend dashboard to enable real-user delivery, (c) do NOT block Tier 2 completion on this — the code ships; the domain verification is a post-Tier-2 DNS task the user handles in ~10 minutes once they see the note.

### T2.16 — Generate placeholder og-image.png at build time

User has not hand-designed an og-image and shouldn't have to before launch. Create `public/og-image.png` as a 1200×630 PNG with:

- Navy background (`#0f172a` top, gradient to `#1e3a5f` bottom, matching hero gradient direction)
- "FedBenefitsAid" centered, serif font matching site's display font, white, ~96px
- Tagline "Retirement benefits, finally clear." below, serif italic, `#d4af37` gold accent, ~48px
- Subtle Capitol dome illustration or American flag accent in one corner using the site's existing navy/gold illustration style if feasible (skip if it adds complexity)
- Small "fedbenefitsaid.com" text in lower right corner, white, ~24px

Implementation options, in order of preference:
1. Create the PNG directly using a one-off Node script (`sharp` or `canvas` package) that runs at build time, commit the output PNG to `/public/`.
2. If that's complex, create an SVG version committed to `/public/og-image.svg` and use an online SVG-to-PNG converter output committed as PNG.
3. If both are complex, use a quick programmatic approach with Puppeteer screenshot of a styled HTML template.

Pick the simplest that ships in under 45 minutes. Do this after T2.14 but before T2.1 so the OG image is in place when SEO starts crawling. User can swap for a fancier version anytime.

---

## Updated Tier 2 execution order (supersedes PLAN.md ordering)

1. **T2.14** — fail-closed hardening (~15 min)
2. **T2.14b** — Calendly webhook provisioning (~20–30 min; may surface BLOCKING note)
3. **T2.16** — og-image placeholder (~30–45 min)
4. **T2.15** — Resend probe (as step 0 of T2.4)
5. **T2.13** — auth layer on chat.js + send-results-email.js
6. **T2.1** — FEGLI rebuild (the big one — largest task, likely usage-limit point)
7. **T2.2** — FERS Calculator results layout
8. **T2.3** — Chat system prompt
9. **T2.4** — lead capture on both calculators
10. **T2.5** — rename nav items
11. **T2.6** — /about page (stubs only; user supplies copy before Tier 2 ships)
12. **T2.7** — Assessment action plan
13. **T2.8** — "When can I retire?" widget
14. **T2.9** — Reference Ask AI button recolor
15. **T2.10** — JSON-LD (Organization + FAQPage)
16. **T2.11** — Lighthouse (folds in T1 bundle-size item)
17. **T2.12** — Admin counter logic

---

## Disposition of Tier 1 out-of-scope items

| # | Item | Handled by |
|---|---|---|
| 1 | FERS Supplement display | Already fixed in `a47116b` — no action |
| 2 | `e.target` vs `e.currentTarget` in Landing.jsx:114,117 | Opportunistic fix during T2.5 or T2.8 |
| 3 | calendly-webhook fail-open | T2.14 |
| 4 | chat.js / send-results-email.js no auth | T2.13 |
| 5 | Resend config unknown | T2.15 |
| 6 | Bundle size +7kB gzipped | Folded into T2.11 Lighthouse pass |
| 7 | Title race on slow connections | No action — expected Helmet behavior |

---

## Resume protocol (updated for Tier 2)

Next Code session reads `PLAN.md` + `PLAN_AMENDMENTS.md` + `PROGRESS.md` + `git log --oneline -30`, resumes from first unchecked `[ ]` in Tier 2 section of `PROGRESS.md`. Do not redo checked tasks.
