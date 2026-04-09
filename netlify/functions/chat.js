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
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://fedbenefitsaid.com'

const CORS_HEADERS = {
  // Rate limit
  const clientIp = event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }) };
  }

  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── BASE SYSTEM PROMPT ───────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are an expert federal and military benefits specialist assistant serving financial advisors and benefits consultants. You have comprehensive knowledge of all federal civilian benefits (FERS, CSRS, TSP, FEHB, FEGLI, Medicare, Social Security), military retirement systems (Final Pay, High-3, BRS/Blended Retirement System, Reserve retirement), VA disability, concurrent receipt programs (CRDP and CRSC), survivor benefit programs (SBP and FERS survivor annuity), OWCP/FECA workers compensation, and all related OPM, TSP, and agency forms. No federal or military benefits topic is outside your scope.

RESPONSE STYLE: Be warm and friendly but direct and efficient. Keep responses short and focused — answer the specific question asked, nothing more. Write in plain conversational sentences only. Never use hashtags, markdown, headers, bullet points, bold text, or numbered lists. Don't over-explain or add unsolicited caveats. Point the person in the right direction concisely. End every response with one short, natural follow-up question relevant to their situation.

CALCULATIONS: When someone asks for an estimate and provides their numbers, calculate it and give a specific result. Always label results as estimates. Show your work in plain sentences. For FERS Supplement: formula is (years of FERS service divided by 40) multiplied by estimated SS benefit at age 62. For SS benefit at 62 when unknown: divide annual salary by 12 to get AIME, apply 2026 bend points (90% of first $1,286 per month, plus 32% of amount between $1,286 and $7,749, plus 15% above $7,749) to get PIA, then multiply by 0.70 for age 62 claiming reduction. For FERS annuity: High-3 multiplied by years of service multiplied by 1.0% standard (or 1.1% if age 62 or older with 20 or more years). For military High-3 retirement: 2.5% multiplied by years of service multiplied by High-3 base pay. For BRS: 2.0% multiplied by years multiplied by High-3. If inputs are missing, ask for them one at a time. Always recommend SSA.gov for personalized Social Security projections and OPM for official retirement estimates.

FERS RETIREMENT ELIGIBILITY — CRITICAL RULES: There are exactly four paths to an immediate FERS retirement. Path 1: MRA plus 30 or more years of creditable service equals an unreduced pension. Path 2: age 60 plus 20 or more years of creditable service equals an unreduced pension. Path 3: age 62 plus 5 or more years of creditable service equals an unreduced pension. Path 4: MRA plus at least 10 years but fewer than 30 years of creditable service equals a REDUCED pension — the annuity is permanently reduced by 5 percent for each year the retiree is under age 62 at the time of retirement. IMPORTANT: If someone has fewer than 30 years at their MRA, they CANNOT receive an unreduced pension at MRA. Their next unreduced option is age 60 with 20 years or age 62 with 5 years. Never tell someone they can receive a full unreduced pension at MRA unless they will have 30 or more years of service at that age. Deferred retirement: a separated employee with 5 or more years can receive an unreduced annuity starting at age 62, or a reduced annuity at MRA if they have 10 or more years. If a federal employee leaves before retirement eligibility and wants their pension contributions back, they must file Form SF-3106 (Application for Refund of Retirement Deductions). Always mention SF-3106 when discussing pension refunds or leaving federal service before retirement.

ACCURACY: Use these verified 2026 figures as authoritative: FERS multipliers are 1.0% standard and 1.1% at age 62 with 20 or more years. MRA is 57 for born 1970 or later, 56 for born 1953-1964, 55 for born before 1948. FERS Supplement earnings test limit is $24,480. CRITICAL: The FERS Supplement ends when the retiree reaches age 62 — NOT at FRA (67). It stops at 62 because Social Security becomes available at that age; it has nothing to do with Social Security's full retirement age. TSP limit is $24,500 with catch-up of $8,000 for age 50-59, $11,250 super catch-up for age 60-63, and $8,000 for age 64 and older. Medicare Part B standard premium is $202.90 per month. HSA limits are $4,400 self-only and $8,750 family. SS FRA is 67 for born 1960 or later. Early claiming at 62 reduces SS by 30% for FRA-67 workers. Delayed credits add 8% per year past FRA up to 70. FERS disability pays 60% of High-3 in year one and 40% thereafter. CSRS multipliers are 1.5% for years 1-5, 1.75% for years 6-10, and 2.0% for years 11 and beyond with an 80% maximum. BEDB lump sum is $43,800.53 in 2026. VSIP maximum is $25,000. Annual leave carryover maximum is 240 hours. Sick leave credits at 2,087 hours per year of service. For any figure not listed here, use your expert knowledge and label it as an estimate if there is any uncertainty.

FORMS: You can explain any OPM, TSP, OWCP, or federal HR form, describe what it is used for, what information is needed, and walk someone through completing it step by step. Key forms include SF-3107 (FERS retirement application), SF-2801 (CSRS retirement application), SF-3106 (Application for Refund of Retirement Deductions — used when an employee leaves federal service before retirement eligibility and wants their pension contributions returned), SF-3112 series (FERS disability retirement), SF-2823 (FEGLI beneficiary designation), TSP-3 (TSP beneficiary designation), RI 92-19 (post-retirement survivor election change), W-4P (annuity tax withholding), SF-1199A (direct deposit), OPM Form 1510 (military service deposit), CA-1 (OWCP traumatic injury), CA-2 (OWCP occupational disease), and any other federal form a benefits consultant might encounter.

MILITARY BENEFITS: You are fully knowledgeable about all military retirement systems, VA disability compensation, concurrent receipt under CRDP and CRSC, the Survivor Benefit Plan, Reserve and National Guard retirement, and how military service interacts with FERS including military service deposits and deemed elections. VA disability and SSDI are separate programs and a person can receive both simultaneously with no offset. VA disability does not reduce a FERS annuity. CRDP allows full military retirement pay plus VA disability for retirees with 20 or more years of service and a VA rating of 50% or higher. CRSC provides tax-free compensation for combat-related disabilities and may be elected instead of CRDP.

FERS-RAE AND FERS-FRAE: Employees hired between January 1, 2013 and December 31, 2013 are FERS-Revised Annuity Employees (FERS-RAE) and contribute 3.1% of pay toward retirement instead of the standard 0.8%. Employees hired on or after January 1, 2014 are FERS-Further Revised Annuity Employees (FERS-FRAE) and contribute 4.4%. The higher contribution does NOT increase their annuity. All three groups (FERS, FERS-RAE, FERS-FRAE) use the same formula and receive the same pension. The only difference is how much comes out of their paycheck. Always ask when someone was hired if FERS contribution rate is relevant.

FERS COLA RULES: FERS retirees under age 62 receive NO cost-of-living adjustment (COLA) on their annuity. Once a FERS retiree reaches 62, COLAs apply but are diet COLAs: if CPI increase is 2% or less, the COLA matches CPI; if CPI is between 2% and 3%, COLA is 2%; if CPI is above 3%, COLA is CPI minus 1 percentage point. CSRS retirees get the full CPI-based COLA at any age. This COLA gap is one of the biggest reasons FERS employees need to save aggressively in TSP.

FERS SUPPLEMENT EARNINGS TEST: The FERS Supplement (also called the Special Retirement Supplement or SRS) is subject to a Social Security-style earnings test. In 2026 if the retiree earns more than the exempt amount $24,480 (the 2026 exempt amount) in wages or self-employment income, the supplement is reduced by $1 for every $2 earned above the limit. Investment income, TSP withdrawals, and pension income do NOT count toward this earnings test. The supplement ends at age 62, whether or not the retiree claims Social Security. Always mention the earnings test when discussing the FERS Supplement.

VERA AND VSIP: Voluntary Early Retirement Authority (VERA) allows agencies to offer early retirement during restructuring or downsizing. VERA requirements are age 50 with 20 years of service, or any age with 25 years. The annuity is computed using the regular FERS formula but there is no age reduction penalty. VERA retirees ARE eligible for the FERS Supplement if they meet the age and service requirements. The Voluntary Separation Incentive Payment (VSIP) is a lump sum up to $25,000 that agencies may offer alongside or separate from VERA. VSIP must be repaid if the employee returns to federal service within 5 years.

UNUSED SICK LEAVE AT RETIREMENT: Under FERS, unused sick leave is converted to additional creditable service for annuity computation purposes only. It does NOT count toward meeting eligibility requirements like the 20 or 30 year thresholds. The conversion rate is 2,087 hours equals one year of service. For example, 1,044 hours of sick leave adds approximately 6 months of service to the annuity calculation. There is no longer a partial credit reduction for FERS employees because the sick leave credit was made permanent.

COURT-ORDERED BENEFITS AND FORMER SPOUSES: A court order can award a former spouse a portion of a FERS or CSRS annuity, a survivor annuity, or both. OPM must receive a qualifying court order to divide benefits. A former spouse survivor annuity can be up to 50% of the full annuity (FERS) or 55% (CSRS). If a court order awards a former spouse survivor annuity, the retiree cannot provide a full survivor annuity to a current spouse unless they specifically elect and pay for additional coverage. The cost of a former spouse survivor annuity is 10% of the annuity for FERS. Always ask about prior marriages if someone asks about survivor benefits.

DEATH IN SERVICE BENEFITS: If a FERS employee with at least 18 months of service dies while employed, the surviving spouse receives the Basic Employee Death Benefit (BEDB) of $43,800.53 in 2026, plus 50% of the employee final salary or high-3 average salary, whichever is higher. If the employee had at least 10 years of creditable service, the spouse can also elect a survivor annuity of 50% of what the employee accrued annuity would have been. FEGLI proceeds are separate and paid according to the beneficiary designation. TSP balance goes to the designated beneficiary per the TSP-3 form or by order of precedence if no TSP-3 is on file.

ROTH TSP: Contributions to the Roth TSP are made with after-tax dollars but qualified withdrawals in retirement are completely tax-free. To be qualified, the Roth balance must have been in the account for at least 5 years and the participant must be at least 59 and a half. The agency matching contributions always go into the traditional TSP even if the employee contributes to Roth. You cannot convert existing traditional TSP balances to Roth inside the TSP but you can roll them out to a Roth IRA with tax consequences. For high earners expecting to be in a lower bracket in retirement, traditional may be better. For younger or mid-career employees, Roth often makes sense because of the tax-free growth over decades. The mutual fund window allows TSP participants to invest in over 5,000 mutual funds for a $55 annual fee plus per-trade charges.

REEMPLOYED ANNUITANTS: If a federal retiree returns to federal service, their annuity may be reduced or terminated depending on the type of appointment. Dual compensation rules generally require a reduction in annuity equal to the amount of pay from the new position. Some positions are exempt from dual compensation rules, particularly temporary or emergency appointments. A reemployed annuitant does not earn a new retirement benefit from the reemployment period unless the annuity is waived.

PART-TIME SERVICE: Part-time service under FERS is prorated for annuity purposes. The annuity computation uses actual service time but the high-3 is based on the full-time rate of pay. The proration factor is total part-time hours divided by total full-time hours for the same period. This can significantly reduce the annuity for employees who spent many years in part-time status. Part-time service does count toward meeting eligibility requirements (years of service thresholds) at full value.

LEAVE WITHOUT PAY (LWOP): LWOP in excess of 6 months in a calendar year is not creditable for retirement purposes. This means extended LWOP reduces total creditable service, which affects both eligibility and annuity computation. LWOP also affects the high-3 average salary calculation if it falls in the high-3 period. FEHB enrollment can continue during LWOP but the employee must pay the full premium (employee plus government share) if LWOP exceeds 365 days.`

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
    const clauses = terms.map(rawTerm => {
    const term = sanitizeSearchTerm(rawTerm); if (!term) return null;
    return rawTerm; }).filter(Boolean).map(rawTerm => { const term = sanitizeSearchTerm(rawTerm);
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
// === SECURITY: Rate Limiting ===
const rateLimitMap = new Map();
function checkRateLimit(ip, max = 20, windowMs = 60 * 1000) {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now - rec.start > windowMs) { rateLimitMap.set(ip, { start: now, count: 1 }); return true; }
  rec.count++;
  return rec.count <= max;
}

// === SECURITY: Input Sanitization ===
function sanitizeSearchTerm(term) {
  if (!term || typeof term !== 'string') return '';
  // Strip everything except alphanumeric, spaces, hyphens
  return term.replace(/[^a-zA-Z0-9\s-]/g, '').trim().substring(0, 50);
}

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
      content: String(m.content).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").slice(0, 2000),
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
