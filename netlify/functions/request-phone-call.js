/**
 * Phone-call request handler.
 *
 * Visitor fills out the phone-call form on /consultation. We:
 *   1. Validate the submission (server-side; do not trust the client).
 *   2. Add a lead to Airtable with source = "Phone Call Request".
 *   3. Send a notification email to the FRC at FRC_NOTIFICATION_EMAIL.
 *
 * Env vars required:
 *   - AIRTABLE_API_KEY        Airtable PAT (already configured for add-lead).
 *   - RESEND_API_KEY          Resend API key (already configured for old email-results function).
 *   - FRC_NOTIFICATION_EMAIL  Optional. Where to send the booking notification.
 *                             Defaults to jhf17@icloud.com if not set.
 *
 * Wire-up: posted to from src/pages/Consultation.jsx PhoneCallForm component.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://fedbenefitsaid.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Allow localhost during dev when running `netlify dev`.
function corsHeadersFor(event) {
  const origin = event.headers && (event.headers.origin || event.headers.Origin)
  if (origin && /^http:\/\/localhost(:[0-9]+)?$/.test(origin)) {
    return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin }
  }
  return CORS_HEADERS
}

// === SECURITY: Rate Limiting ===
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 min
const RATE_LIMIT_MAX = 10                 // 10 requests per IP per window

function checkRateLimit(ip) {
  const now = Date.now()
  const rec = rateLimitMap.get(ip)
  if (!rec || now - rec.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 })
    return true
  }
  rec.count++
  return rec.count <= RATE_LIMIT_MAX
}

// === Input validation ===
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  // Accept digits, spaces, +, -, (, ), . — strip them and require 7-15 digits.
  const digits = phone.replace(/[^\d]/g, '')
  return digits.length >= 7 && digits.length <= 15
}

function sanitize(str, maxLen = 500) {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[<>"';\\]/g, '').trim().substring(0, maxLen)
}

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// === Airtable insert ===
async function addToAirtable(payload) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  if (!AIRTABLE_API_KEY) return { ok: false, error: 'Missing Airtable API key' }

  const BASE_ID = 'appnihKPbDBxVQK4c'
  const TABLE_ID = 'tblXc7syn4pXZNhon' // Leads table

  const notesParts = [
    payload.employer && `Employer/Dept: ${payload.employer}`,
    payload.preferredDate && `Preferred date: ${payload.preferredDate}`,
    payload.preferredTimeWindow && `Time window: ${payload.preferredTimeWindow}`,
    payload.message && `Message: ${payload.message}`,
  ].filter(Boolean)

  const fields = {
    Name: payload.name,
    Email: payload.email,
    Phone: payload.phone,
    State: payload.state,
    Source: 'Phone Call Request',
    Status: 'New',
    Notes: notesParts.join(' | '),
  }

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('[request-phone-call] Airtable error:', res.status, text)
      return { ok: false, error: `Airtable ${res.status}` }
    }
    const data = await res.json()
    return { ok: true, recordId: data.records?.[0]?.id }
  } catch (err) {
    console.error('[request-phone-call] Airtable fetch threw:', err)
    return { ok: false, error: err.message }
  }
}

// === FRC notification email (via Resend) ===
async function notifyFrc(payload) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FRC_EMAIL = process.env.FRC_NOTIFICATION_EMAIL || 'jhf17@icloud.com'

  if (!RESEND_API_KEY) {
    console.warn('[request-phone-call] RESEND_API_KEY not set; skipping FRC notification email.')
    return { ok: false, skipped: true }
  }

  const subjectLine = `New phone-call request — ${escapeHtml(payload.name)} (${escapeHtml(payload.state)})`

  const html = `
    <!DOCTYPE html>
    <html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.5; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h2 style="font-family: Georgia, serif; color: #1f3d2c; margin: 0 0 16px;">New phone-call request</h2>
      <p style="font-size: 14px; color: #475569; margin: 0 0 24px;">
        Submitted via fedbenefitsaid.com/consultation. Reply directly to this email to follow up with the lead.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; width: 180px;">Name</td><td style="padding: 8px 12px; background: #f8fafc;">${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(payload.email)}" style="color: #b08d5a;">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding: 8px 12px; background: #f8fafc; font-weight: 600;">Phone</td><td style="padding: 8px 12px; background: #f8fafc;"><a href="tel:${escapeHtml(payload.phone)}" style="color: #b08d5a;">${escapeHtml(payload.phone)}</a></td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600;">State</td><td style="padding: 8px 12px;">${escapeHtml(payload.state)}</td></tr>
        ${payload.employer ? `<tr><td style="padding: 8px 12px; background: #f8fafc; font-weight: 600;">Employer / Dept</td><td style="padding: 8px 12px; background: #f8fafc;">${escapeHtml(payload.employer)}</td></tr>` : ''}
        ${payload.preferredDate ? `<tr><td style="padding: 8px 12px; font-weight: 600;">Preferred date</td><td style="padding: 8px 12px;">${escapeHtml(payload.preferredDate)}</td></tr>` : ''}
        ${payload.preferredTimeWindow ? `<tr><td style="padding: 8px 12px; background: #f8fafc; font-weight: 600;">Time window</td><td style="padding: 8px 12px; background: #f8fafc;">${escapeHtml(payload.preferredTimeWindow)}</td></tr>` : ''}
        ${payload.message ? `<tr><td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Message</td><td style="padding: 8px 12px; white-space: pre-wrap;">${escapeHtml(payload.message)}</td></tr>` : ''}
      </table>
      <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0;">
        Lead also captured in Airtable (Leads table) with source "Phone Call Request".
      </p>
    </body></html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FedBenefitsAid <noreply@fedbenefitsaid.com>',
        to: [FRC_EMAIL],
        reply_to: payload.email,
        subject: subjectLine,
        html,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('[request-phone-call] Resend error:', res.status, text)
      return { ok: false, error: `Resend ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    console.error('[request-phone-call] Resend fetch threw:', err)
    return { ok: false, error: err.message }
  }
}

exports.handler = async (event) => {
  const headers = corsHeadersFor(event)

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: { ...headers, 'Retry-After': '900' }, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const payload = {
    name: sanitize(body.name, 100),
    email: sanitize(body.email, 254),
    phone: sanitize(body.phone, 30),
    state: sanitize(body.state, 50),
    employer: sanitize(body.employer, 150),
    preferredDate: sanitize(body.preferredDate, 30),
    preferredTimeWindow: sanitize(body.preferredTimeWindow, 50),
    message: sanitize(body.message, 1000),
  }

  if (!payload.name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name is required.' }) }
  if (!validateEmail(payload.email)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email is required.' }) }
  if (!validatePhone(payload.phone)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid phone number is required.' }) }
  if (!payload.state) return { statusCode: 400, headers, body: JSON.stringify({ error: 'State is required.' }) }

  // Block bookings from product-unavailable states with a polite message.
  if (['CA', 'NY', 'AR'].includes(payload.state)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        error: 'For regulatory reasons we cannot currently book consultations for residents of California, New York, or Arkansas. The free calculators and library remain fully available.',
      }),
    }
  }

  const [airtable, email] = await Promise.all([
    addToAirtable(payload),
    notifyFrc(payload),
  ])

  if (!airtable.ok && !email.ok) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to record your request. Please try again or use the video-call option.' }) }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      airtable: airtable.ok,
      emailNotified: email.ok,
    }),
  }
}
