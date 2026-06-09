// Supabase client for FMA.
//
// Real per-user FRC auth (email + password) activates ONLY when the project keys
// are present — VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, set in a local `.env`
// (dev) and in the Netlify environment variables (production). Until then,
// `isSupabaseConfigured` is false and the app falls back to the interim
// access-code gate so the Retirement Summary builder keeps working.
//
// To enable real per-user auth later: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
// in the Netlify environment (and add the Supabase domain to the netlify.toml CSP
// connect-src), then create the FRC users. Until those env vars exist the app uses
// the interim access-code gate, so /advisor works with zero external setup.
// NEVER commit the service_role / secret key.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
