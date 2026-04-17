const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://fedbenefitsaid.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const SOURCE_TO_ACTIVITY = {
  'Website Signup': 'Account Created',
  'Retirement Checklist': 'Assessment Completed',
  'Calendly Booking': 'Consultation Booked',
  'Assessment': 'Assessment Completed',
  'Calculator': 'Calculator Completed',
}

// === SECURITY: Rate Limiting ===
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 50; // max requests per window

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  record.count++;
  if (record.count > RATE_LIMIT_MAX) return false;
  return true;
}

// === SECURITY: Input Validation ===
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str, maxLen = 200) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[<>"';\\/]/g, '').trim().substring(0, maxLen);
}

function sanitizeForAirtable(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/['"\\/(){}\[\]]/g, '').trim().substring(0, 200);
}

exports.handler = async (event) => {
  // Rate limit check
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers: { ...CORS_HEADERS, 'Retry-After': '900' },
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    }
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
  const TABLE_ID = 'tblXc7syn4pXZNhon'

  if (!AIRTABLE_API_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing Airtable API key' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    }
  }

  // T2.4: `notes` optional — used by calculator captures to log the full
  // inputs+outputs payload so admin can review context without re-running.
  const { name, email, phone, source = 'Website Signup', assessmentScore, notes } = body

  if (!email) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Email is required' }),
    }
  }

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid email format' }),
    }
  }

  try {
    // Search for existing record by email
    const escapedEmail = sanitizeForAirtable(email).replace(/'/g, "\\'")
    const encodedFormula = encodeURIComponent(`{Email}='${escapedEmail}'`)
    const searchUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${encodedFormula}`

    const searchRes = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!searchRes.ok) {
      const err = await searchRes.text()
      console.error('Airtable search error:', err)
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to search for existing lead' }),
      }
    }

    const searchData = await searchRes.json()
    const existingRecord = searchData.records && searchData.records[0]

    if (existingRecord) {
      // Update existing record
      const recordId = existingRecord.id
      const currentFields = existingRecord.fields

      // Map source to activity
      const newActivity = SOURCE_TO_ACTIVITY[source] || source

      // Get current Activities or empty array
      let activities = currentFields.Activities || []
      if (Array.isArray(activities)) {
        // Add new activity if not already present
        if (!activities.includes(newActivity)) {
          activities = [...activities, newActivity]
        }
      } else {
        activities = [newActivity]
      }

      // Prepare update fields
      const updateFields = {
        Activities: activities,
      }

      // Update name and phone only if they were empty and are now provided
      if (!currentFields.Name && name) {
        updateFields.Name = name
      }
      if (!currentFields.Phone && phone) {
        updateFields.Phone = phone
      }

      // Update assessment score if provided
      if (assessmentScore !== undefined && assessmentScore !== null) {
        updateFields['Assessment Score'] = assessmentScore
      }

      // T2.4: append notes to Airtable Notes field (sanitize + cap length).
      // Uses typecast:true below so string coercion is automatic. If the
      // Airtable table doesn't yet have a Notes field the whole PATCH 422s;
      // retry logic below strips Notes on failure.
      if (notes && typeof notes === 'string') {
        updateFields.Notes = sanitizeForAirtable(notes).slice(0, 10000)
      }

      // T2.4: 422 retry without Notes — same safety net as the create path
      const tryPatch = async (fieldsToSend) => fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: fieldsToSend, typecast: true }),
        }
      )

      let patchRes = await tryPatch(updateFields)
      if (!patchRes.ok && patchRes.status === 422 && updateFields.Notes) {
        const err422 = await patchRes.text()
        console.warn('[add-lead] 422 on patch WITH Notes — retrying without. Original error:', err422)
        const { Notes, ...withoutNotes } = updateFields
        patchRes = await tryPatch(withoutNotes)
      }

      if (!patchRes.ok) {
        const err = await patchRes.text()
        console.error('Airtable patch error:', err)
        return {
          statusCode: 502,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Failed to update lead in CRM' }),
        }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, action: 'updated', recordId }),
      }
    } else {
      // Create new record
      const newActivity = SOURCE_TO_ACTIVITY[source] || source
      const activities = [newActivity]

      const createFields = {
        Name: name || '',
        Email: email,
        Phone: phone || '',
        Source: source,
        Status: 'New',
        'Signed Up': new Date().toISOString(),
        Activities: activities,
      }

      // Add assessment score if provided
      if (assessmentScore !== undefined && assessmentScore !== null) {
        createFields['Assessment Score'] = assessmentScore
      }

      // T2.4: append notes if provided
      if (notes && typeof notes === 'string') {
        createFields.Notes = sanitizeForAirtable(notes).slice(0, 10000)
      }

      // Helper: attempt create; if 422 (likely due to unknown Notes field),
      // retry WITHOUT Notes so the lead is still captured.
      const tryCreate = async (fieldsToSend) => fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: [{ fields: fieldsToSend }], typecast: true }),
        }
      )

      let createRes = await tryCreate(createFields)
      if (!createRes.ok && createRes.status === 422 && createFields.Notes) {
        const err422 = await createRes.text()
        console.warn('[add-lead] 422 on create WITH Notes — retrying without. Original error:', err422)
        const { Notes, ...withoutNotes } = createFields
        createRes = await tryCreate(withoutNotes)
      }

      if (!createRes.ok) {
        const err = await createRes.text()
        console.error('Airtable create error:', err)
        return {
          statusCode: 502,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Failed to add lead to CRM' }),
        }
      }

      const createData = await createRes.json()
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, action: 'created', recordId: createData.records[0].id }),
      }
    }
  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
