const AIRTABLE_BASE_ID = 'appnihKPbDBxVQK4c';
const AIRTABLE_TABLE_ID = 'tblXc7syn4pXZNhon';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.id) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required field: id' }),
      };
    }

    if (!body.fields || typeof body.fields !== 'object') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing or invalid fields object' }),
      };
    }

    // Validate API key is configured
    if (!AIRTABLE_API_KEY) {
      console.error('AIRTABLE_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Call Airtable API
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${body.id}`;

    const response = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: body.fields }),
    });

    const responseData = await response.json();

    // Handle Airtable API errors
    if (!response.ok) {
      console.error('Airtable API error:', responseData);

      if (response.status === 404) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Record not found' }),
        };
      }

      if (response.status === 422) {
        return {
          statusCode: 422,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Unprocessable Entity',
            details: responseData.error,
          }),
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      }

      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Failed to update record',
          details: responseData.error,
        }),
      };
    }

    // Success
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Function error:', error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
