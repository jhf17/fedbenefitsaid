exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const BASE_ID = 'appnihKPbDBxVQK4c'
  const TABLE_ID = 'tblXc7syn4pXZNhon'

  if (!AIRTABLE_API_KEY) {
    return { statusCode: 500, body: 'Missing Airtable API key' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, phone, source = 'Website Signup' } = body

  if (!email) {
    return { statusCode: 400, body: 'Email is required' }
  }

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name: name || '',
            Email: email,
            Phone: phone || '',
            Source: source,
            Status: 'New',
            'Signed Up': new Date().toISOString(),
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Airtable error:', err)
      return { statusCode: 502, body: 'Failed to add lead to CRM' }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error('Function error:', err)
    return { statusCode: 500, body: 'Internal server error' }
  }
}
