import { createClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    __VULPLINK_CONFIG__?: { url?: string; anonKey?: string }
  }
}

const runtimeConfig = typeof window !== 'undefined' ? window.__VULPLINK_CONFIG__ : undefined
const url = import.meta.env.VITE_SUPABASE_URL || runtimeConfig?.url || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || runtimeConfig?.anonKey || ''

export const supabaseConfigured = Boolean(url && key)
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } },
)
