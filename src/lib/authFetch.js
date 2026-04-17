import { supabase } from './supabase'

/**
 * T2.13 — fetch wrapper that attaches the current Supabase session's access
 * token as `Authorization: Bearer <token>`. Use for any call to a Netlify
 * function that enforces `verifyUser()` server-side.
 *
 * Usage:
 *
 *     const res = await authFetch('/.netlify/functions/chat', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ messages }),
 *     })
 *
 * If there's no active session, the request goes out without an Authorization
 * header — the function will return 401, which callers handle as "sign in to
 * continue." This is intentional: we always attempt the request so the user
 * sees the same flow whether their session expired or they never signed in.
 */
export async function authFetch(input, init = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
