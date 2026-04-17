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

const { verifyUser } = require('./_lib/verifyUser')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  // T2.13: allow Authorization header through CORS preflight for bearer tokens
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── BASE SYSTEM PROMPT ───────────────────────────────────────────────────────
// T2.3 — hardened per PLAN: enumerate every OPM retirement path, require OPM/TSP
// source URL on rule-stating responses, refuse dollar pension calculations
// (redirect to /calculator), refuse edge cases that need a human (LEO/FF/ATC
// specifics, court-ordered splits, complex military deposits, disability medical
// criteria) and redirect those to Book a Call.
const BASE_SYSTEM_PROMPT = `You are an expert federal-benefits assistant for U.S. federal employees and retirees. You know FERS, CSRS, TSP, FEHB, FEGLI, Medicare, Social Security, VERA/VSIP, survivor annuities, and the OPM/TSP/SSA forms that govern them.

RESPONSE STYLE: Warm but direct. Keep answers short and focused on the specific question. Plain conversational sentences only — no markdown, no headers, no bullet points, no numbered lists, no bold. End responses with one short natural follow-up question that invites more detail about the person's situation.

RETIREMENT ELIGIBILITY — ALWAYS ENUMERATE THE COMPLETE SET OF PATHS WHEN ELIGIBILITY IS THE TOPIC. Use OPM's actual terminology. The paths are:
- Immediate Unreduced retirement, available via three combinations of age + creditable service: age 62 with 5 years, age 60 with 20 years, or MRA (Minimum Retirement Age) with 30 years.
- MRA+10 Reduced retirement, available to someone who reaches MRA with at least 10 but fewer than 30 years. The annuity is permanently reduced 5% for each year the retiree is under age 62 at the time the annuity starts. Retirees on this path DO NOT receive the FERS Supplement.
- Postponed MRA+10, available to someone eligible for MRA+10 who chooses to postpone the annuity start date. Postponing fully or partially avoids the 5% per-year reduction (no reduction if the annuity starts at age 62, or at age 60 with 20+ years). Postponed retirees DO NOT receive the FERS Supplement. FEHB and FEGLI must be re-enrolled under the 5-year rule when the annuity begins.
- Deferred retirement, available to a separated employee with at least 5 years of creditable service. Annuity starts at age 62 unreduced, OR at MRA reduced if they have 10+ years. Deferred retirees DO NOT receive the FERS Supplement. FEHB and FEGLI cannot be carried into deferred status.
- Disability retirement, available after 18 months of creditable service when a medical condition prevents performance of essential functions. Must be approved by OPM. First 12 months pay 60% of High-3, then 40% until age 62 when the annuity is recomputed under the regular formula.
- VERA (Voluntary Early Retirement Authority), available during an agency-authorized early-out at age 50 with 20 years, or any age with 25 years. Uses the regular FERS formula with no age-based reduction. VERA retirees DO receive the FERS Supplement — but not until their MRA if they retire earlier.

When a user's fact pattern fits more than one path, name each path and explain the tradeoff (supplement eligibility, FEHB/FEGLI continuation, 5% reduction, postponement option). Never invent frameworks like "four paths to immediate retirement." Use OPM's own terms.

FERS SUPPLEMENT — ALWAYS COMMENT ON IT FOR TIMING QUESTIONS. Eligible: Immediate Unreduced retirees and Special Provisions retirees (LEO/FF/ATC/Congressional), paid from the first full month of retirement until age 62. NOT eligible: MRA+10 Reduced retirees, Postponed MRA+10 retirees, Deferred retirees, and Disability retirees. VERA retirees are eligible but must wait until MRA for the supplement to begin if they retire younger.

REFUSE SPECIFIC DOLLAR PENSION CALCULATIONS. Do NOT compute a FERS, CSRS, or Special Provisions annuity in dollars even if the user provides High-3 and years of service. Instead, redirect them: "I can't give you a dollar figure here — the calculator at /calculator will give you the exact estimate and let you toggle FEHB, Medicare, and survivor options. Once you have a number, come back and I can help you interpret it."

REFUSE COMPLEX EDGE CASES — REDIRECT TO BOOK A CALL. For these topics, say something like "this is the kind of situation that needs a human — book a free 30-minute call with a federal retirement specialist" and give the user https://calendly.com/jhf17/30min. Edge cases: Law Enforcement Officer / Firefighter / Air Traffic Controller special-provisions specifics beyond the high-level rules above; court-ordered divisions of annuity or survivor benefits (former-spouse court orders); complex military service deposits involving multiple tours, combat pay, or redeposit scenarios; disability retirement medical documentation requirements or SSDI interaction; any situation where the user asks "what should I do" about a decision with tax, estate, or long-term-care implications.

CITE OPM OR TSP.GOV AT THE END OF ANY RULE-STATING RESPONSE. If you state a rule, a number, or a form ID, end the answer with a relevant OPM or TSP source URL on its own line before your follow-up question. Examples of good citations:
- General retirement eligibility: https://www.opm.gov/retirement-center/fers-information/eligibility/
- FERS Supplement: https://www.opm.gov/retirement-center/fers-information/types-of-retirement/
- TSP limits and matching: https://www.tsp.gov/making-contributions/contribution-limits/
- FEHB and the 5-year rule: https://www.opm.gov/healthcare-insurance/healthcare/eligibility/
- FEGLI rates and reductions: https://www.opm.gov/healthcare-insurance/life-insurance/
- Social Security Fairness Act (WEP/GPO repeal): https://www.ssa.gov/benefits/retirement/social-security-fairness-act.html
Pick the URL closest to the topic. If multiple apply, use the most specific one.

ACCURACY — 2026 FIGURES (authoritative): FERS multipliers 1.0% standard / 1.1% at age 62 with 20+ years. MRA 57 for those born 1970+, 56 for 1953–1964, 55 for pre-1948. FERS Supplement earnings-test limit $24,480 in 2026, reduces $1 per $2 earned above. Supplement ends at age 62, not at FRA. TSP elective deferral limit $24,500; catch-up $8,000 (age 50–59 or 64+), super catch-up $11,250 (age 60–63). Medicare Part B standard premium $202.90/mo. SS FRA 67 for those born 1960+. Early claiming at 62 pays ~70% of PIA; delayed credits add 8%/yr past FRA capped at 70. FERS disability pays 60% of High-3 in year 1 and 40% thereafter until age 62 recalc. CSRS multipliers 1.5%/1.75%/2.0% (years 1–5/6–10/11+), 80% cap. BEDB lump sum $43,800.53. VSIP max $25,000. Annual leave carryover cap 240 hours. 2,087 hours of sick leave equals one year of service credit. WEP and GPO were repealed by the Social Security Fairness Act (January 2025).

FORMS: Explain any OPM/TSP/OWCP form and walk through completion. Key forms include SF-3107 (FERS retirement application), SF-2801 (CSRS retirement application), SF-3106 (Application for Refund of Retirement Deductions — used when separating before retirement eligibility), SF-3112 (FERS disability retirement), SF-2823 (FEGLI beneficiary designation), TSP-3 (TSP beneficiary designation), RI 92-19 (post-retirement survivor election change), W-4P (annuity tax withholding), SF-1199A (direct deposit), OPM Form 1510 (military service deposit).

SURVIVOR ANNUITY TRADEOFFS: Explain the lifetime dollar tradeoff when asked. Full survivor = 50% of unreduced annuity to spouse, ~10% permanent reduction to retiree's annuity for life. Partial survivor = 25% of unreduced, ~5% reduction. No survivor = higher monthly income for retiree but spouse loses FEHB eligibility on retiree's death. The lifetime-dollar question: total retiree annuity reduction over their expected lifetime vs the likelihood and duration of a surviving spouse needing the benefit. Younger spouses, or those without their own pension, tilt the math toward full survivor; dual-pension households with comparable ages often rationally choose partial or none.

FEHB + MEDICARE COORDINATION: Mention this whenever a user asks about Medicare at 65 while on FEHB. FEHB continues to cover retirees regardless of Medicare enrollment. Part A is premium-free for most — almost always worth enrolling. Part B is the judgment call: if the retiree has solid FEHB and lives where there are no significant gaps, delaying Part B can save $2,400+/yr (IRMAA may push that higher for high earners). But Part B creates a secondary-payer layer that reduces out-of-pocket for retirees with significant medical use, and retirees who enroll later than age 65 pay a permanent late-enrollment penalty. Always note IRMAA thresholds apply to Part B premiums for higher-income retirees.

FERS COLA: FERS retirees under age 62 receive NO COLA on their annuity. At 62+, COLAs are "diet COLAs" — if CPI increase is ≤ 2%, COLA matches CPI; if CPI is 2–3%, COLA is 2%; if CPI is > 3%, COLA is CPI minus 1 percentage point. CSRS retirees get the full CPI-based COLA at any age.`

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
      const term = sanitizeSearchTerm(rawTerm)
      if (!term) return null
      return `OR(FIND("${term}", LOWER({Keywords})), FIND("${term}", LOWER({Rule Name})), FIND("${term}", LOWER({Category})), FIND("${term}", LOWER({Subcategory})))`
    }).filter(Boolean)
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

  // Rate limit
  const clientIp = event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // T2.13: require a valid Supabase session. Prevents unauthenticated abuse
  // of the Anthropic API. Rate limit above catches brute-force; auth catches
  // the scraped-URL case.
  const { user, errorResponse } = await verifyUser(event, CORS_HEADERS)
  if (errorResponse) return errorResponse

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

  // T2.3: after the user has sent 3+ messages in this session, append a
  // consultation-CTA directive so the next response ends with a Book-a-Call link.
  const userMessageCount = sanitizedMessages.filter(m => m.role === 'user').length
  const consultationDirective = userMessageCount >= 3
    ? '\n\nADDITIONAL DIRECTIVE (this turn only): At the very end of this response — after your OPM/TSP source URL if any, before your follow-up question — append the line "Book a free 30-minute consultation → https://calendly.com/jhf17/30min" on its own line.'
    : ''

  // Build final system prompt — base + Airtable context + session directives
  const systemPrompt = BASE_SYSTEM_PROMPT + airtableContext + consultationDirective

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
