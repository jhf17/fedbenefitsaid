/**
 * T2.13 — Supabase bearer-token verifier for Netlify functions.
 *
 * Any function that must not be abused by unauthenticated traffic imports
 * this helper and calls `verifyUser(event)` as its first real check. The
 * helper reads `Authorization: Bearer <token>` from the request headers,
 * verifies it against Supabase via `supabase.auth.getUser(token)`, and
 * returns either `{ user }` on success or `{ errorResponse }` on failure.
 *
 * The caller's pattern looks like:
 *
 *     const { user, errorResponse } = await verifyUser(event, CORS_HEADERS)
 *     if (errorResponse) return errorResponse
 *     // ...proceed, use `user.id`, `user.email`, etc.
 *
 * Env vars required (Netlify site settings):
 *   VITE_SUPABASE_URL        (also used at build time; safe to reuse here)
 *   VITE_SUPABASE_ANON_KEY   (anon key is sufficient for getUser — it verifies
 *                             the JWT's signature against Supabase JWKS)
 *
 * Either name may be provided without the VITE_ prefix (SUPABASE_URL,
 * SUPABASE_ANON_KEY) — the helper tries both so future functions can adopt
 * whichever convention Netlify env is set to.
 */
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

let cachedClient = null
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cachedClient
}

/**
 * @param {object} event — Netlify Functions event (Lambda-style)
 * @param {object} corsHeaders — the caller's CORS_HEADERS, merged into any 401 response
 * @returns {Promise<{user?: object, errorResponse?: object}>}
 */
async function verifyUser(event, corsHeaders = {}) {
  const supabase = getSupabase()
  if (!supabase) {
    console.error('[verifyUser] Supabase env vars not set — cannot verify bearer tokens. Denying request.')
    return {
      errorResponse: {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Auth service not configured' }),
      },
    }
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization || ''
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader)
  if (!match) {
    return {
      errorResponse: {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized — sign in to use this feature.' }),
      },
    }
  }

  const token = match[1]
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      return {
        errorResponse: {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized — session is invalid or expired.' }),
        },
      }
    }
    return { user: data.user }
  } catch (err) {
    console.error('[verifyUser] Unexpected error verifying bearer token:', err?.message || err)
    return {
      errorResponse: {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized — session could not be verified.' }),
      },
    }
  }
}

module.exports = { verifyUser }
