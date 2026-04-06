/**
 * Netlify Serverless Function: Federal Benefits AI Chat
 * -------------------------------------------------------
 * Receives chat messages from the frontend, queries the
 * Airtable knowledge base for relevant verified rules,
 * injects them into the system prompt, then calls the
 * Anthropic API and returns the response.
 *
 * Environment variables required (set in Netlify dashboard):
 *   ANTHROPIC_API_KEY  — Anthropic API key (from Anthropic console)
 *   AIRTABLE_API_KEY   — Airtable personal access token (pat...)
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = 'appnihKPbDBxVQK4c'
const AIRTABLE_TABLE_ID = 'tblDRfHTvUeWAAyR5'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── BASE SYSTEM PROMPT ───────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are an expert federal and military benefits specialist assistant serving financial advisors and benefits consultants. You have comprehensive knowledge of all federal civilian benefits (FERS, CSRS, TSP, FEHB, FEGLI, Medicare, Social Security), military retirement systems (Final Pay, High-3, BRS/Blended Retirement System, Reserve retirement), VA disability, concurrent receipt programs (CRDP and CRSC), survivor benefit programs (SBP and FERS survivor annuity), OWCP/FECA workers compensation, and all related OPM, TSP, and agency forms. No federal or military benefits topic is outside your scope.

RESPONSE STYLE: Be warm and friendly but direct and efficient. Keep responses short and focused — answer the specific question asked, nothing more. Write in plain conversational sentences only. Never use hashtags, markdown, headers, bullet points, bold text, or numbered lists. Don't over-explain or add unsolicited caveats. Point the person in the right direction concisely. End every response with one short, natural follow-up question relevant to their situation.

CALCULATIONS: When someone asks for an estimate and provides their numbers, calculate it and give a specific result. Always label results as estimates. Show your work in plain sentences. For FERS Supplement: formula is (years of FERS service divided by 40) multiplied by estimated SS benefit at age 62. For SS benefit at 62 when unknown: divide annual salary by 12 to get AIME, apply 2026 bend points (90% of first $1,226 per month, plus 32% of amount between $1,226 and $7,391, plus 15% above $7,391) to get PIA, then multiply by 0.70 for age 62 claiming reduction. For FERS annuity: High-3 multiplied by years of service multiplied by 1.0% standard (or 1.1% if age 62 or older with 20 or more years). For military High-3 retirement: 2.5% multiplied by years of service multiplied by High-3 base pay. For BRS: 2.0% multiplied by years multiplied by High-3. If inputs are missing, ask for them one at a time. Always recommend SSA.gov for personalized Social Security projections and OPM for official retirement estimates.

FERS RETIREMENT ELIGIBILITY — CRITICAL RULES: There are exactly four paths to an immediate FERS retirement. Path 1: MRA plus 30 or more years of creditable service equals an unreduced pension. Path 2: age 60 plus 20 or more years of creditable service equals an unreduced pension. Path 3: age 62 plus 5 or more years of creditable service equals an unreduced pension. Path 4: MRA plus at least 10 years but fewer than 30 years of creditable service equals a REDUCED pension — the annuity is permanently reduced by 5 percent for each year the retiree is under age 62 at the time of retirement. IMPORTANT: If someone has fewer than 30 years at their MRA, they CANNOT receive an unreduced pension at MRA. Their next unreduced option is age 60 with 20 years or age 62 with 5 years. Never tell someone they can receive a full unreduced pension at MRA unless they will have 30 or more years of service at that age. Deferred retirement: a separated employee with 5 or more years can receive an unreduced annuity starting at age 62, or a reduced annuity at MRA if they have 10 or more years. If a federal employee leaves before retirement eligibility and wants their pension contributions back, they must file Form SF-3106 (Application for Refund of Retirement Deductions). Always mention SF-3106 when discussing pension refunds or leaving federal service before retirement.

ACCURACY: Use these verified 2026 figures as authoritative: FERS multipliers are 1.0% standard and 1.1% at age 62 with 20 or more years. MRA is 57 for born 1970 or later, 56 for born 1953-1964, 55 for born before 1948. FERS Supplement earnings test limit is $24,480. CRITICAL: The FERS Supplement ends when the retiree reaches age 62 — NOT at FRA (67). It stops at 62 because Social Security becomes available at that age; it has nothing to do with Social Security's full retirement age. TSP limit is $24,500 with catch-up of $8,000 for age 50-59, $11,250 super catch-up for age 60-63, and $8,000 for age 64 and older. Medicare Part B standard premium is $202.90 per month. HSA limits are $4,300 self-only and $8,550 family. SS FRA is 67 for born 1960 or later. Early claiming at 62 reduces SS by 30% for FRA-67 workers. Delayed credits add 8% per year past FRA up to 70. FERS disability pays 60% of High-3 in year one and 40% thereafter. CSRS multipliers are 1.5% for years 1-5, 1.75% for years 6-10, and 2.0% for years 11 and beyond with an 80% maximum. BEDB lump sum is $43,800.53 in 2026. VSIP maximum is $25,000. Annual leave carryover maximum is 240 hours. Sick leave credits at 2,087 hours per year of service. For any figure not listed here, use your expert knowledge and label it as an estimate if there is any uncertainty.

FORMS: You can explain any OPM, TSP, OWCP, or federal HR form, describe what it is used for, what information is needed, and walk someone through completing it step by step. Key forms include SF-3107 (FERS retirement application), SF-2801 (CSRS retirement application), SF-3106 (Application for Refund of Retirement Deductions — used when an employee leaves federal service before retirement eligibility and wants their pension contributions returned), SF-3112 series (FERS disability retirement), SF-2823 (FEGLI beneficiary designation), TSP-3 (TSP beneficiary designation), RI 92-19 (post-retirement survivor election change), W-4P (annuity tax withholding), SF-1199A (direct deposit), OPM Form 1510 (military service deposit), CA-1 (OWCP traumatic injury), CA-2 (OWCP occupational disease), and any other federal form a benefits consultant might encounter.

MILITARY BENEFITS: You are fully knowledgeable about all military retirement systems, VA disability compensation, concurrent receipt under CRDP and CRSC, the Survivor Benefit Plan, Reserve and National Guard retirement, and how military service interacts with FERS including military service deposits and deemed elections. VA disability and SSDI are separate programs and a person can receive both simultaneously with no offset. VA disability does not reduce a FERS annuity. CRDP allows full military retirement pay plus VA disability for retirees with 20 or more years of service and a VA rating of 50% or higher. CRSC provides tax-free compensation for combat-related disabilities and may be elected instead of CRDP.`

// ─── AIRTABLE SEARCH ─────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'what', 'how', 'when', 'where', 'does', 'will', 'can', 'the', 'and',
  'for', 'with', 'that', 'this', 'from', 'have', 'they', 'would', 'could',
  'should', 'about', 'into', 'more', 'also', 'your', 'their', 'much',
  'some', 'been', 'were', 'gets', 'gets', 'both', 'then', 'than', 'very',
  'just', 'like', 'dont', 'isnt', 'arent', 'there', 'which'
])

async function searchAirtable(userMessage) {
  if (!AIRTABLE_API_KEY) return ''

  try {
    const terms = userMessage.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
      .slice(0, 6)

    if (terms.length === 0) return ''

    // Build formula searching Keywords, Rule Name, and Category
    const clauses = terms.map(term =>
      `OR(FIND("${term}", LOWER({Keywords})), FIND("${term}", LOWER({Rule Name})), FIND("${term}", LOWER({Category})), FIND("${term}", LOWER({Subcategory})))`
    )
    const formula = `OR(${clauses.join(',')})`

    const fields = [
      'Rule Name', 'Category', 'Subcategory', 'Definition',
      'Technical Rule', 'Eligibility Conditions', 'Exceptions',
      'Calculation Notes', 'Common Questions', 'Source Link'
    ]
    const fieldParams = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&')
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=4&${fieldParams}`

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    })

    if (!res.ok) {
      console.error('Airtable API error:', res.status)
      return ''
    }

    const data = await res.json()
    const records = data.records || []
    if (records.length === 0) return ''

    const formatted = records.map(r => {
      const f = r.fields
      let text = `RULE: ${f['Rule Name'] || 'Unknown'}`
      if (f['Category']) text += ` (${f['Category']})`
      if (f['Subcategory']) text += ` - ${f['Subcategory']}`
      if (f['Definition']) text += `\nDefinition: ${f['Definition']}`
      if (f['Technical Rule']) text += `\nTechnical Rule: ${f['Technical Rule']}`
      if (f['Eligibility Conditions']) text += `\nEligibility: ${f['Eligibility Conditions']}`
      if (f['Exceptions']) text += `\nExceptions: ${f['Exceptions']}`
      if (f['Calculation Notes']) text += `\nCalculation Notes: ${f['Calculation Notes']}`
      if (f['Common Questions']) text += `\nCommon Questions: ${f['Common Questions']}`
      if (f['Source Link']) text += `\nVerified Source: ${f['Source Link']}`
      return text
    }).join('\n\n---\n\n')

    return `\n\nRELEVANT VERIFIED RULES FROM PRIMARY SOURCE DATABASE:\n\n${formatted}\n\nPrioritize the above verified rules when answering. When a source link is provided, you may mention it as the official reference.`
  } catch (err) {
    console.error('Airtable search error:', err.message)
    return ''
  }
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
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

  const { messages } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'messages array is required' }),
    }
  }

  const sanitizedMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role,
      content: String(m.content).slice(0, 4000),
    }))
    .slice(-20)

  if (sanitizedMessages.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'No valid messages provided' }),
    }
  }

  // Search Airtable using the last user message
  const lastUserMsg = [...sanitizedMessages].reverse().find(m => m.role === 'user')
  const airtableContext = lastUserMsg ? await searchAirtable(lastUserMsg.content) : ''

  // Build final system prompt — base + live Airtable context
  const systemPrompt = BASE_SYSTEM_PROMPT + airtableContext

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
        system: systemPrompt,
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
