import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  !!url && !!key && url !== 'https://xrcolqrxxprffvunqwnh.supabase.co'

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a dummy client during build / when not configured
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder')
  }

  return createBrowserClient(url!, key!)
}
