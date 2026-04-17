const crypto = require('crypto');
/**
 * Calendly Webhook Handler
 *
 * Receives webhook events from Calendly when consultations are booked/cancelled.
 * Auto-creates or updates lead profiles in Airtable with "Consultation Booked" activity.
 *
 * Calendly webhook setup:
 *   URL: https://fedbenefitsaid.com/.netlify/functions/calendly-webhook
 *   Events: invitee.created, invitee.canceled
 *   Signing key: REQUIRED in CALENDLY_WEBHOOK_SIGNING_KEY env var.
 *
 * T2.14 — fail-closed: if the signing key env var is missing, or the signature
 * header is missing/invalid, the function rejects the request and does NOT
 * touch Airtable. Previously it logged a warning and accepted unsigned POSTs,
 * which was a security hole (anyone who found the URL could create leads).
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://calendly.com',
  'Access-Control-Allow-Headers': 'Content-Type, Calendly-Webhook-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// T2.14: startup log — runs once per cold start. Makes missing env var visible in Netlify logs.
if (!process.env.CALENDLY_WEBHOOK_SIGNING_KEY) {
  console.warn('[calendly-webhook] CALENDLY_WEBHOOK_SIGNING_KEY is NOT set. Webhook will fail-closed on every POST until the env var is configured in Netlify.')
} else {
  console.log('[calendly-webhook] Signing key loaded — signature verification is active.')
}


// === SECURITY: Rate Limiting ===
const rateLimitMap = new Map();
function checkRateLimit(ip, max = 30, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now - rec.start > windowMs) { rateLimitMap.set(ip, { start: now, count: 1 }); return true; }
  rec.count++;
  return rec.count <= max;
}

// === SECURITY: Webhook Signature Verification ===
function verifyCalendlySignature(body, signatureHeader, signingKey) {
  if (!signatureHeader || !signingKey) return false;
  try {
    // Calendly sends signature in format: t=timestamp,v1=signature
    const parts = {};
    signatureHeader.split(',').forEach(part => {
      const [key, val] = part.split('=');
      parts[key] = val;
    });
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;
    
    // Verify timestamp is within 5 minutes
    const tolerance = 5 * 60 * 1000;
    if (Math.abs(Date.now() - parseInt(timestamp) * 1000) > tolerance) return false;
    
    // Compute expected signature
    const payload = timestamp + '.' + body;
    const expected = crypto.createHmac('sha256', signingKey).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (e) {
    console.error('Signature verification error:', e.message);
    return false;
  }
}

exports.handler = async (event) => {
  // Rate limit
  const clientIp = event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Too many requests' }) };
  }
  
  // T2.14: fail-closed signature verification. Both branches return the same
  // 500 response so external observers can't distinguish "missing key" from
  // "bad signature" (no info leak). Airtable is never touched on failure.
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (event.httpMethod === 'POST') {
    if (!signingKey) {
      console.error('[calendly-webhook] Rejecting POST — CALENDLY_WEBHOOK_SIGNING_KEY env var is not set');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Webhook signature verification unavailable' }),
      };
    }
    const signature = event.headers['calendly-webhook-signature'];
    if (!verifyCalendlySignature(event.body, signature, signingKey)) {
      console.error('[calendly-webhook] Rejecting POST — signature header missing or invalid');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Webhook signature verification unavailable' }),
      };
    }
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const BASE_ID = 'appnihKPbDBxVQK4c'
  const LEADS_TABLE = 'tblXc7syn4pXZNhon'
  const CONSULTATIONS_TABLE = 'tblRKlgXnO3MoSGOs'

  if (!AIRTABLE_API_KEY) {
    console.error('Missing AIRTABLE_API_KEY')
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Server configuration error' }),
    }
  }

  let payload
  try {
    payload = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    }
  }

  // Calendly sends { event: "invitee.created", payload: { ... } }
  const eventType = payload.event
  const data = payload.payload

  if (!data) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing payload data' }),
    }
  }

  console.log(`Calendly webhook received: ${eventType}`)

  try {
    if (eventType === 'invitee.created') {
      // Extract invitee info
      const invitee = data.invitee || data
      const scheduledEvent = data.scheduled_event || data.event || {}

      const name = sanitizeString(invitee.name || '')
      const email = sanitizeEmail(invitee.email || '')
      const phone = sanitizeString(extractPhone(invitee.questions_and_answers || []))
      const scheduledTime = sanitizeString(scheduledEvent.start_time || '')
      const eventName = sanitizeString(scheduledEvent.name || 'Free Consultation')
      const cancelUrl = (invitee.cancel_url || '').substring(0, 500)
      const rescheduleUrl = (invitee.reschedule_url || '').substring(0, 500)

      if (!email) {
        console.error('No email in Calendly webhook payload')
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'No email provided' }),
        }
      }

      // 1. Add/update lead in Leads table
      await upsertLead({
        apiKey: AIRTABLE_API_KEY,
        baseId: BASE_ID,
        tableId: LEADS_TABLE,
        name,
        email,
        phone,
        source: 'Calendly Booking',
        activity: 'Consultation Booked',
      })

      // 2. Create consultation record
      await createConsultation({
        apiKey: AIRTABLE_API_KEY,
        baseId: BASE_ID,
        tableId: CONSULTATIONS_TABLE,
        name,
        email,
        phone,
        scheduledTime,
        eventName,
        cancelUrl,
        rescheduleUrl,
      })

      console.log(`Lead upserted and consultation created for ${email}`)

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, action: 'consultation_booked', email }),
      }
    }

    if (eventType === 'invitee.canceled') {
      const invitee = data.invitee || data
      const email = invitee.email || ''

      if (email) {
        console.log(`Consultation canceled for ${email}`)
        // Optionally update the lead status — but don't remove them
        // They're still a warm lead even if they cancel
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, action: 'cancellation_noted' }),
      }
    }

    // Unknown event type — acknowledge but do nothing
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, action: 'ignored', event: eventType }),
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

/**
 * Sanitize a string for safe Airtable insertion — strips injection characters
 */
function sanitizeString(val) {
  if (!val || typeof val !== 'string') return ''
  return val.replace(/[<>"';\\/\[\]{}]/g, '').trim().substring(0, 200)
}

/**
 * Sanitize an email for Airtable formula (escape single quotes to prevent injection)
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return ''
  return email.replace(/'/g, "\\'").replace(/[<>";\\/\[\]{}]/g, '').trim().substring(0, 254)
}

/**
 * Extract phone number from Calendly custom questions
 */
function extractPhone(questionsAndAnswers) {
  if (!Array.isArray(questionsAndAnswers)) return ''
  const phoneQ = questionsAndAnswers.find(
    (q) => q.question && q.question.toLowerCase().includes('phone')
  )
  return phoneQ ? phoneQ.answer || '' : ''
}

/**
 * Upsert a lead in Airtable (search by email, update if exists, create if not)
 */
async function upsertLead({ apiKey, baseId, tableId, name, email, phone, source, activity }) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  // Search for existing lead
  const safeEmail = email.replace(/'/g, "\\'")
  const encodedFormula = encodeURIComponent(`{Email}='${safeEmail}'`)
  const searchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${encodedFormula}`

  const searchRes = await fetch(searchUrl, { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` } })
  if (!searchRes.ok) {
    console.error('Airtable search failed:', await searchRes.text())
    throw new Error('Failed to search Airtable')
  }

  const searchData = await searchRes.json()
  const existing = searchData.records && searchData.records[0]

  if (existing) {
    // Update existing lead — add activity, update status
    const currentFields = existing.fields
    let activities = currentFields.Activities || []
    if (Array.isArray(activities)) {
      if (!activities.includes(activity)) {
        activities = [...activities, activity]
      }
    } else {
      activities = [activity]
    }

    const updateFields = {
      Activities: activities,
      Status: 'Consultation Booked',
    }

    // Fill in name/phone if empty
    if (!currentFields.Name && name) updateFields.Name = name
    if (!currentFields.Phone && phone) updateFields.Phone = phone

    await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}/${existing.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: updateFields }),
    })
  } else {
    // Create new lead
    const createFields = {
      Name: name,
      Email: email,
      Phone: phone || '',
      Source: 'Calendly Booking',
      Status: 'Consultation Booked',
      'Signed Up': new Date().toISOString(),
      Activities: [activity],
    }

    await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: createFields }),
    })
  }
}

/**
 * Create a record in the Consultations table
 */
async function createConsultation({ apiKey, baseId, tableId, name, email, phone, scheduledTime, eventName, cancelUrl, rescheduleUrl }) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  const fields = {
    Name: name,
    Email: email,
  }

  // Only add fields that have values (avoids Airtable field-not-found errors for optional fields)
  if (phone) fields.Phone = phone
  if (scheduledTime) fields['Scheduled Time'] = scheduledTime
  if (eventName) fields['Event Type'] = eventName
  if (cancelUrl) fields['Cancel URL'] = cancelUrl
  if (rescheduleUrl) fields['Reschedule URL'] = rescheduleUrl
  fields['Created At'] = new Date().toISOString()

  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields }),
    })

    if (!res.ok) {
      // Non-critical — lead was still upserted even if consultation record fails
      console.error('Consultation record creation failed:', await res.text())
    }
  } catch (err) {
    console.error('Consultation record error:', err)
  }
}
