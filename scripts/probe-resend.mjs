#!/usr/bin/env node
/**
 * T2.15 — Resend domain-verification probe
 *
 * Run locally with the same RESEND_API_KEY that Netlify uses:
 *
 *   RESEND_API_KEY=re_xxx node scripts/probe-resend.mjs
 *
 * Lists every domain the Resend account has configured and its verification
 * status. If "fedbenefitsaid.com" is present with status="verified", the
 * lead-capture email flow (T2.4) can deliver to any recipient. If it's
 * missing or status !== "verified", Resend is effectively in sandbox mode
 * and only delivers to the account owner's verified email.
 *
 * Expected output when verified:
 *   ✓ fedbenefitsaid.com                verified  (us-east-1)
 *
 * Expected output when sandbox:
 *   ✗ fedbenefitsaid.com is NOT VERIFIED
 *     OR
 *   ⚠ no domains found — sandbox mode, deliveries only reach account owner
 */

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('RESEND_API_KEY not set in env. Aborting.')
  process.exit(2)
}

const r = await fetch('https://api.resend.com/domains', {
  headers: { Authorization: `Bearer ${apiKey}` },
})
if (!r.ok) {
  console.error(`Resend API returned ${r.status}: ${await r.text()}`)
  process.exit(1)
}

const { data } = await r.json()
const domains = Array.isArray(data) ? data : []

console.log(`Found ${domains.length} domain${domains.length === 1 ? '' : 's'} on this Resend account.\n`)

let verifiedSite = false
for (const d of domains) {
  const mark = d.status === 'verified' ? '✓' : '✗'
  console.log(`${mark} ${d.name.padEnd(32)} ${d.status}  (${d.region || 'n/a'})`)
  if (d.name === 'fedbenefitsaid.com' && d.status === 'verified') verifiedSite = true
}

console.log()
if (verifiedSite) {
  console.log('RESULT: fedbenefitsaid.com is VERIFIED — lead-capture email can deliver to any recipient.')
  process.exit(0)
} else if (domains.length === 0) {
  console.log('RESULT: no domains configured — Resend is in SANDBOX. Only the account owner receives email.')
  process.exit(3)
} else {
  console.log('RESULT: fedbenefitsaid.com is NOT verified — add it at https://resend.com/domains and complete the DNS steps.')
  process.exit(3)
}
