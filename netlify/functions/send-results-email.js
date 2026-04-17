const { verifyUser } = require('./_lib/verifyUser')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://fedbenefitsaid.com',
  // T2.13: allow Authorization header through CORS preflight for bearer tokens
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// === SECURITY: Rate Limiting ===
const rateLimitMap = new Map();
function checkRateLimit(ip, max = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now - rec.start > windowMs) { rateLimitMap.set(ip, { start: now, count: 1 }); return true; }
  rec.count++;
  return rec.count <= max;
}

// === SECURITY: HTML Escaping ===
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Assessment email template (HTML)
function buildAssessmentEmail(data) {
  const { score, categories, actionItems } = data
  const name = escapeHtml(data.name)

  // Build category rows
  const categoryColors = {
    income: { bg: '#dbeafe', text: '#1e40af' },
    healthcare: { bg: '#d1fae5', text: '#065f46' },
    insurance: { bg: '#fce7f3', text: '#831843' },
    tsp: { bg: '#e0e7ff', text: '#3730a3' },
    social_security: { bg: '#fef3c7', text: '#92400e' },
    survivor: { bg: '#fee2e2', text: '#991b1b' },
    financial: { bg: '#fef3c7', text: '#92400e' },
  }

  let categoryRows = ''
  if (categories && Array.isArray(categories)) {
    categories.forEach((cat, i) => {
      const colors = categoryColors[cat.key] || { bg: '#f1f5f9', text: '#475569' }
      const isLast = i === categories.length - 1
      categoryRows += `
        <tr>
          <td style="padding: 16px; border: 1px solid #e2e8f0; ${isLast ? '' : 'border-bottom: none;'} background-color: #ffffff;">
            <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px; font-weight: 700;">${escapeHtml(cat.label)}</p>
            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">${escapeHtml(cat.description || '')}</p>
          </td>
          <td style="padding: 16px; border: 1px solid #e2e8f0; ${isLast ? '' : 'border-bottom: none;'} text-align: right; background-color: #ffffff;">
            <span style="display: inline-block; background-color: ${colors.bg}; color: ${colors.text}; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">${escapeHtml(String(cat.score))}/${escapeHtml(String(cat.maxScore))}</span>
          </td>
        </tr>`
    })
  }

  // Build action item rows
  let actionItemRows = ''
  if (actionItems && Array.isArray(actionItems)) {
    actionItems.forEach((item, i) => {
      const isLast = i === actionItems.length - 1
      let iconBg, iconText, labelColor, label
      if (item.priority === 'high') {
        iconBg = '#dc2626'; iconText = '!'; labelColor = '#dc2626'; label = 'High Priority'
      } else if (item.priority === 'medium') {
        iconBg = '#f59e0b'; iconText = '-'; labelColor = '#d97706'; label = 'Medium Priority'
      } else {
        iconBg = '#22c55e'; iconText = '&#10003;'; labelColor = '#16a34a'; label = 'On Track'
      }
      actionItemRows += `
        <tr>
          <td style="padding: 16px; border: 1px solid #e2e8f0; ${isLast ? '' : 'border-bottom: none;'} background-color: #ffffff;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-right: 12px; vertical-align: top; width: 28px;">
                  <div style="width: 22px; height: 22px; border-radius: 4px; background-color: ${iconBg}; text-align: center; line-height: 22px; color: #fff; font-size: 12px; font-weight: 700;">${iconText}</div>
                </td>
                <td>
                  <p style="margin: 0 0 2px 0; color: ${labelColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(label)}</p>
                  <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${escapeHtml(item.title)}</p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">${escapeHtml(item.description)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Retirement Readiness Assessment Results</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; background-color: #f9fafb;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
  <tr><td align="center" style="padding: 20px 0;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
      <tr><td style="background-color: #1e3a5f; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">FedBenefitsAid</h1>
        <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px; font-weight: 500; letter-spacing: 0.3px;">Retirement Readiness Assessment</p>
      </td></tr>
      <tr><td style="padding: 40px;">
        <p style="margin: 0 0 24px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">Hi ${name || 'there'},</p>
        <p style="margin: 0 0 32px 0; color: #475569; font-size: 15px; line-height: 1.7;">Thank you for completing your Retirement Readiness Assessment. We've analyzed your responses across key areas of federal retirement planning to give you a comprehensive view of your retirement preparedness.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #7b1c2e; padding: 24px; border-radius: 6px; margin-bottom: 32px;">
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Readiness Score</p>
          <h2 style="margin: 0; color: #1e293b; font-size: 42px; font-weight: 700;">${score}<span style="font-size: 28px; color: #64748b;">/42</span></h2>
          <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Based on your assessment responses</p>
        </div>
        ${categoryRows ? `<h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 700;">Category Breakdown</h3><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">${categoryRows}</table>` : ''}
        ${actionItemRows ? `<h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 700;">Your Priority Action Items</h3><p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px;">Based on your answers, here's what to focus on first.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">${actionItemRows}</table>` : ''}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;"><tr><td align="center">
          <a href="https://calendly.com/jhf17/30min" style="display: inline-block; background-color: #7b1c2e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;">Book Free Consultation</a>
        </td></tr></table>
        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">Best regards,<br><strong>The FedBenefitsAid Team</strong></p>
      </td></tr>
      <tr><td style="background-color: #f1f5f9; padding: 32px 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px;"><a href="https://fedbenefitsaid.com" style="color: #1e40af; text-decoration: none; font-weight: 500;">fedbenefitsaid.com</a></p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">Federal Retirement Benefits, Simplified</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

// Calculator email template (HTML)
function buildCalculatorEmail(data) {
  const name = escapeHtml(data.name)
  const totalMonthly = escapeHtml(data.totalMonthly)
  const totalAnnual = escapeHtml(data.totalAnnual)
  const retirementSystem = escapeHtml(data.retirementSystem)
  const { breakdown } = data

  // Build income rows — conditionally hide N/A items
  let incomeRows = ''
  if (breakdown && Array.isArray(breakdown)) {
    breakdown.forEach((item, i) => {
      // Skip items that are N/A, $0, or explicitly hidden
      if (item.hidden || item.value === 'N/A' || item.value === '$0' || item.value === '$0/mo') return
      const isLast = i === breakdown.length - 1
      const isDeduction = item.type === 'deduction'
      const valueColor = isDeduction ? '#dc2626' : '#059669'
      const prefix = isDeduction ? '-' : '+'
      incomeRows += `
        <tr>
          <td style="padding: 14px 16px; ${isLast ? '' : 'border-bottom: 1px solid #f1f5f9;'}">
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${escapeHtml(item.label)}</p>
            ${item.subtitle ? `<p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">${escapeHtml(item.subtitle)}</p>` : ''}
          </td>
          <td style="padding: 14px 16px; ${isLast ? '' : 'border-bottom: 1px solid #f1f5f9;'} text-align: right;">
            <span style="color: ${valueColor}; font-size: 15px; font-weight: 700;">${prefix}${escapeHtml(item.value)}</span>
            <span style="color: #94a3b8; font-size: 12px;">/mo</span>
          </td>
        </tr>`
    })
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your FERS Calculator Results</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; background-color: #f9fafb;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
  <tr><td align="center" style="padding: 20px 0;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
      <tr><td style="background-color: #1e3a5f; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">FedBenefitsAid</h1>
        <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px; font-weight: 500; letter-spacing: 0.3px;">Your Retirement Calculator Results</p>
      </td></tr>
      <tr><td style="padding: 40px;">
        <p style="margin: 0 0 24px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">Hi ${name || 'there'},</p>
        <p style="margin: 0 0 32px 0; color: #475569; font-size: 15px; line-height: 1.7;">Here's a summary of the retirement estimate you ran on FedBenefitsAid. Keep this as a reference as you plan your next steps.</p>
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 12px; padding: 32px; margin-bottom: 28px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Monthly Retirement Income</p>
          <h2 style="margin: 0 0 4px 0; color: #ffffff; font-size: 48px; font-weight: 700;">${totalMonthly}</h2>
          <p style="margin: 0; color: #94a3b8; font-size: 14px;">${totalAnnual} per year &nbsp;&middot;&nbsp; ${retirementSystem || 'FERS'}</p>
        </div>
        ${incomeRows ? `<h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 700;">Income Breakdown</h3><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; border-collapse: collapse;">${incomeRows}</table>` : ''}
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin-bottom: 28px;">
          <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Keep in mind</p>
          <p style="margin: 0; color: #78716c; font-size: 13px; line-height: 1.6;">This estimate is based on the information you entered and current OPM rates. Your actual benefits may vary. Run the calculator again anytime at fedbenefitsaid.com/calculator as your situation changes.</p>
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
          <p style="margin: 0 0 16px 0; color: #1e293b; font-size: 15px; font-weight: 600;">Want to walk through these numbers with an expert?</p>
          <a href="https://calendly.com/jhf17/30min" style="display: inline-block; background-color: #7b1c2e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;">Book Free Consultation</a>
        </div>
        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">Best regards,<br><strong>The FedBenefitsAid Team</strong></p>
      </td></tr>
      <tr><td style="background-color: #f1f5f9; padding: 32px 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px;"><a href="https://fedbenefitsaid.com" style="color: #1e40af; text-decoration: none; font-weight: 500;">fedbenefitsaid.com</a></p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">Federal Retirement Benefits, Simplified</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  // Rate limit: 10 emails per 15 minutes per IP
  const clientIp = event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: { ...CORS_HEADERS, 'Retry-After': '900' }, body: JSON.stringify({ error: 'Too many requests. Please wait before sending another email.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  // T2.13: require a valid Supabase session. Prevents unauthenticated abuse
  // of the Resend API (bill-pump risk).
  const { user, errorResponse } = await verifyUser(event, CORS_HEADERS)
  if (errorResponse) return errorResponse

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable')
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Email service not configured' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { type, email, data } = body

  if (!email || !type) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Email and type are required' }) }
  }

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid email format' }) }
  }

  let html, subject
  if (type === 'assessment') {
    html = buildAssessmentEmail(data)
    subject = `Your Retirement Readiness Score: ${escapeHtml(String(data.score || ''))}/42 — FedBenefitsAid`
  } else if (type === 'calculator') {
    html = buildCalculatorEmail(data)
    subject = `Your Retirement Estimate: ${escapeHtml(String(data.totalMonthly || ''))}/mo — FedBenefitsAid`
  } else {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid type. Use "assessment" or "calculator".' }) }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FedBenefitsAid <results@fedbenefitsaid.com>',
        to: [email],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Resend API error:', errText)
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to send email' }),
      }
    }

    const result = await res.json()
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, emailId: result.id }),
    }
  } catch (err) {
    console.error('Email send error:', err)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
