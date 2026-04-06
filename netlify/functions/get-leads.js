exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const BASE_ID = 'appnihKPbDBxVQK4c'
  const LEADS_TABLE = 'tblXc7syn4pXZNhon'
  const CAMPAIGNS_TABLE = 'tblPCwKffWuzpP6gn'
  const CONSULTATIONS_TABLE = 'tblRKlgXnO3MoSGOs'

  if (!AIRTABLE_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API key' }) }
  }

  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    const [leadsRes, campaignsRes, consultationsRes] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${BASE_ID}/${LEADS_TABLE}?maxRecords=100&sort[0][field]=Signed+Up&sort[0][direction]=desc`, { headers }),
      fetch(`https://api.airtable.com/v0/${BASE_ID}/${CAMPAIGNS_TABLE}?maxRecords=50&sort[0][field]=Created&sort[0][direction]=desc`, { headers }),
      fetch(`https://api.airtable.com/v0/${BASE_ID}/${CONSULTATIONS_TABLE}?maxRecords=50`, { headers })
    ])

    const [leadsData, campaignsData, consultationsData] = await Promise.all([
      leadsRes.json(),
      campaignsRes.json(),
      consultationsRes.json()
    ])

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        leads: leadsData.records || [],
        campaigns: campaignsData.records || [],
        consultations: consultationsData.records || []
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
