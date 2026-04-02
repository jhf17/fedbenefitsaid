/**
 * Netlify Serverless Function: /api/chat proxy
 * ------------------------------------------------
 * Receives chat messages from the frontend, calls the
 * Anthropic API with the secret key stored as a Netlify
 * environment variable, and returns the response.
 *
 * The Anthropic API key is NEVER exposed to the browser.
 *
 * Environment variables required (set in Netlify dashboard):
 *   ANTHROPIC_API_KEY  — your Anthropic API key (sk-ant-...)
 *
 * Optional:
 *   ALLOWED_ORIGIN     — restrict CORS to your domain (e.g. https://fedbenefitsaid.com)
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // Check API key is configured
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is not set')
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI service is not configured. Please contact support.' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    }
  }

  const { messages, department, systemPrompt } = body

  // Validate
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'messages array is required' }),
    }
  }

  // Sanitize — only pass role/content, filter out system messages
  const sanitizedMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role,
      content: String(m.content).slice(0, 4000), // cap per message
    }))
    .slice(-30) // keep last 30 messages max

  if (sanitizedMessages.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'No valid messages provided' }),
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt || ('You are a knowledgeable federal benefits assistant helping users understand FERS, FEHB, TSP, FEGLI, and other federal employee benefits.' + (department ? ' The user works at ' + department + '. Tailor your answers to their agency when relevant.' : '')),
        messages: sanitizedMessages,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Anthropic API error:', response.status, errBody)

      if (response.status === 429) {
        return {
          statusCode: 429,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
        }
      }

      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }),
      }
    }

    const data = await response.json()
    const content = data?.content?.[0]?.text || ''

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }
  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
    }
  }
}
