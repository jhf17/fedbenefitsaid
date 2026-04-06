# FedBenefitsAid — Project Context

**Site**: fedbenefitsaid.com | **Repo**: jhf17/fedbenefitsaid | **Owner**: jhf17@icloud.com

## Stack
React 18 + Vite, Supabase auth/DB, Netlify (auto-deploy from main ~2min), Cloudflare CDN

## Key Files
- `src/pages/Landing.jsx` — hero, features (4-card grid), how it works (4 steps), footer
- `src/pages/Auth.jsx` — login/signup (name, phone, email, password)
- `src/pages/Calculator.jsx` — FERS retirement calculator
- `src/pages/Chat.jsx` — AI chat (auth required)
- `netlify/functions/add-lead.js` — logs signups to Airtable CRM

## Airtable CRM (Base: appnihKPbDBxVQK4c)
- Leads: tblXc7syn4pXZNhon (inbound + outbound)
- Consultations: tblRKlgXnO3MoSGOs
- Outbound Campaigns: tblPCwKffWuzpP6gn

## Design System
- Navy hero: `linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)`
- Accent maroon: `#7b1c2e` (buttons, accents)
- Inline styles throughout — match this pattern

## CRITICAL: File Encoding
Always use TextDecoder to read, TextEncoder to write via GitHub API.
Never use btoa(unescape(encodeURIComponent())) — causes garbled special chars.

## Active Plugins
Apollo (outbound prospecting), Marketing, Sales, Productivity, Airtable

## Business Context
Free tools (calculator, AI chat) capture leads. Paid product = consultations via Calendly.
Future: outbound Apollo campaigns targeting federal employees by agency.
