# FedBenefitsAid — Claude Code Project Briefing

> This file is read automatically every Claude Code session. It contains everything you need to work on this project without re-explanation.

---

## Project Overview

**Site:** https://fedbenefitsaid.com
**Repo:** https://github.com/jhf17/fedbenefitsaid
**Owner:** Jack (jhf17@icloud.com)
**Stack:** React 18 + Vite, deployed on Netlify, auth via Supabase, GitHub for version control
**Purpose:** A paid SaaS platform for financial advisors, benefits consultants, and HR professionals who advise federal employees. Three core products: Reference Guide, AI Chat, and Training quizzes.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Auth | Supabase (email/password) |
| Deployment | Netlify (auto-deploys on push to main) |
| CDN/Proxy | Cloudflare (sits in front of Netlify) |
| AI Chat backend | Netlify Functions (netlify/functions/chat.js) |
| Styling | Inline styles (no CSS framework -- keep it this way) |
| Package manager | npm |

---

## Repository Structure

```
fedbenefitsaid/
├── src/
│   ├── App.jsx                  # Routes + AuthContext
│   ├── main.jsx                 # React entry point
│   ├── components/
│   │   └── Navbar.jsx           # Top nav -- desktop + mobile
│   └── pages/
│       ├── Reference.jsx        # Reference Guide (categories + search)
│       ├── Chat.jsx             # AI Chat page
│       ├── Course.jsx           # Training landing/pricing page
│       ├── Quiz.jsx             # Quiz player (protected route)
│       ├── Login.jsx            # Login page
│       └── Signup.jsx           # Signup page
├── netlify/
│   └── functions/
│       └── chat.js              # Serverless function -> Anthropic API
├── netlify.toml                 # Netlify build + functions config
├── package.json
├── vite.config.js
└── index.html
```

---

## Routing (App.jsx)

```
/                    -> Reference (public)
/chat                -> Chat (public -- 3 free questions, then paywall)
/training            -> Course (public -- marketing/pricing page)
/training/quiz/:topicId -> Quiz (PROTECTED -- requires login)
/login               -> Login
/signup              -> Signup
```

ProtectedRoute wraps only /training/quiz/:topicId. All other routes are public.

---

## Auth (Supabase)

- Client initialized in App.jsx with Supabase URL + anon key
- AuthContext provides { user, loading } to entire app
- **Admin account:** jhf17@icloud.com gets unlimited AI Chat access
- Admin detection in Chat.jsx:

```js
const ADMIN_EMAILS = ['jhf17@icloud.com']
const FREE_LIMIT = 3  // module-level constant
// Inside component:
const { user } = useAuth()
const isAdmin = user && ADMIN_EMAILS.includes(user.email)
```

CRITICAL: isAdmin must be computed INSIDE the component after useAuth(). Never at module scope -- it crashes React.

- **Known issue:** Supabase Site URL is currently set to localhost:3000 instead of https://fedbenefitsaid.com. Email confirmation links fail. Fix in Supabase Dashboard -> Authentication -> URL Configuration.

---

## Business Logic

### AI Chat (/chat)
- Users pick their agency/department first (required)
- 3 free questions per day (stored in localStorage with daily reset)
- Admin (jhf17@icloud.com) gets unlimited questions
- After 3 questions: paywall modal with two options:
  - AI Chat only: $9.99/mo
  - Training + AI Chat bundle: $29.99/mo
- Real AI responses via /.netlify/functions/chat (Anthropic claude-haiku-4-5-20251001)
- Env var required: ANTHROPIC_API_KEY (set in Netlify Dashboard -> Site config -> Env vars)

### Training (/training)
- Marketing landing page targeting financial advisors and benefits consultants (NOT federal employees themselves)
- Two pricing tiers:
  - Professional: $19.99/mo (individual advisors)
  - Agency: $149/mo (10 seats, firms/agencies)
  - Both have optional AI Chat add-on checkboxes
- Clicking "Start Free Trial" -> /training/quiz/fers-pension

### Quiz (/training/quiz/:topicId)
- Protected -- requires Supabase login
- Questions stored in the Quiz component or a data file
- Topic IDs match module slugs: fers-pension, tsp, fehb, fegli, etc.

### Reference Guide (/)
- Searchable/browsable federal benefits reference
- Category + subcategory navigation
- Back buttons must be visible on dark navy header (use color: 'white')

---

## Known Issues & Pending Work

### High Priority
1. Garbled characters on site -- emoji and special unicode in Chat.jsx and Course.jsx double-encoded during push. Fix: strip all emoji/unicode, use ASCII only in JSX.
2. Counter resets on refresh -- questionsUsed state in Chat.jsx must use localStorage.
3. Supabase redirect URL -- Admin account can't confirm email. Needs manual Supabase dashboard fix (not a code change).
4. Mock AI responses -- Chat.jsx still has mock response text. Real API call to /.netlify/functions/chat needed.

### Medium Priority
5. Quiz question bank expansion -- Target: ~350 questions across 11 modules. Batches planned:
   - Batch 1: Special Provisions (LEO/FF/ATC) -- 20 questions drafted, not yet pushed
   - Batch 2: FERS Disability + FERS Supplement
   - Batch 3: TSP RMDs/Roth/Withdrawals
   - Batch 4: FEHB edge cases/FEDVIP/FLTCIP
   - Batch 5: Federal Pay/GS scale

### Low Priority
6. Payment integration (Stripe) -- not yet built
7. User progress tracking -- not yet built

---

## Deployment Workflow

1. Push to main branch on GitHub
2. Netlify auto-detects push and runs npm run build (Vite)
3. Build output goes to dist/
4. Site live at fedbenefitsaid.com in ~60 seconds
5. Cloudflare sits in front -- if stale content appears, purge cache at Cloudflare Dashboard -> Caching -> Purge Everything

**Build command:** npm run build
**Publish dir:** dist
**Functions dir:** netlify/functions

---

## Code Style Rules

- Inline styles only -- no Tailwind, no CSS modules, no external CSS files
- ASCII only in JSX -- no emoji, no curly quotes, no special unicode. Use HTML entities like &mdash; &#10003; &amp; when needed in JSX
- No TypeScript -- plain JavaScript
- No component libraries -- build from scratch with inline styles
- All colors use navy blue palette: primary #1e3a5f, accent #2d5a8e, light text #7eb3e8

---

## Critical Lessons Learned (DO NOT REPEAT)

1. Never put user references at module scope. useAuth() only works inside React components. Module-level code runs before React mounts -- accessing user there throws ReferenceError and crashes the entire app silently.

2. Never use emoji or special unicode in JSX source files. They get double-encoded during GitHub API pushes (btoa/atob) and render as garbage like Ã¢Â€Â¢. Use only ASCII + HTML entities.

3. Regex replacements across large JSX blocks are dangerous. Greedy patterns can match across desktop AND mobile sections, corrupting both. Prefer full file rewrites over regex surgery.

4. Always verify file size after a push. If the file is dramatically smaller than expected, the push script cut off content. Healthy build = ~86 modules, ~526 KB bundle.

5. Cloudflare cache can serve stale broken bundles. If the site looks broken after a confirmed successful deploy, purge Cloudflare cache.

---

## Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| ANTHROPIC_API_KEY | Netlify env vars | sk-ant-... (from console.anthropic.com) |
| Supabase URL | Hardcoded in App.jsx | already in codebase |
| Supabase anon key | Hardcoded in App.jsx | already in codebase |

---

## Netlify Functions

netlify/functions/chat.js
- Receives: { messages: [...], department: "..." }
- Calls: Anthropic API with claude-haiku-4-5-20251001
- Returns: { content: "AI response text" }
- CORS: Allow-Origin * (public endpoint)
- Reads API key from process.env.ANTHROPIC_API_KEY

---

## Jack's Preferences

- Always ask clarifying questions before making multi-step changes
- Review content (quiz questions, copy) in batches before pushing
- Explain what each script does before running it
- Keep the user informed of what is happening and why
- The site targets financial professionals who advise federal employees -- not federal employees directly (especially on the Training page)
