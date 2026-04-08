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

  const { name, email, phone, source = 'Website Signup', assessmentScore } = body

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

      // Patch the record
      const patchRes = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: updateFields, typecast: true }),
        }
      )

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

      const createRes = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: [{ fields: createFields }], typecast: true }),
        }
      )

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
