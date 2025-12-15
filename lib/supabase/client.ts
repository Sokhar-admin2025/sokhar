import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Om variablerna saknas (t.ex. under bygget), använd en platshållare
  // så att koden inte kraschar.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createBrowserClient(supabaseUrl, supabaseKey)
}