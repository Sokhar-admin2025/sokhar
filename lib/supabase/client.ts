import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 1. STÄDA: Ta bort citattecken (") och mellanslag om de råkade följa med från Vercel
  if (supabaseUrl) supabaseUrl = supabaseUrl.replace(/["']/g, "").trim()
  if (supabaseKey) supabaseKey = supabaseKey.replace(/["']/g, "").trim()

  // 2. SÄKERHET: Om URL:en fortfarande är tom eller ogiltig, använd en "fejk-URL"
  // Detta gör att bygget (build) lyckas utan att krascha, även om variablerna saknas.
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('Varning: Ogiltig Supabase URL, använder placeholder för build.')
    supabaseUrl = 'https://placeholder.supabase.co'
  }
  if (!supabaseKey) {
    supabaseKey = 'placeholder-key'
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}