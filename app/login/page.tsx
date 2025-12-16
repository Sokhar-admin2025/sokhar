'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Vi skapar kopplingen manuellt här
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    // .trim() tar bort osynliga mellanslag före och efter
    const cleanEmail = email.trim()

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage('Fel: ' + error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')

    // .trim() tar bort osynliga mellanslag
    const cleanEmail = email.trim()
    
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage('Kunde inte skapa konto: ' + error.message)
      setLoading(false)
    } else {
      setMessage('Konto skapat! Eftersom email-bekräftelse är avstängt borde du kunna logga in nu.')
      setLoading(false)
      // Vi provar att logga in användaren direkt eller be dem logga in
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-8 shadow-lg bg-white text-black">
        <h1 className="text-2xl font-bold text-center mb-6">Logga in / Skapa konto</h1>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">E-post</label>
          <input
            className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            type="email"
            placeholder="din@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Lösenord</label>
          <input
            className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            type="password"
            placeholder="Minst 6 tecken"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {message && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full rounded bg-black p-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Arbetar...' : 'Logga in'}
          </button>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded border border-gray-300 p-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Skapa nytt konto
          </button>
        </div>
      </div>
    </div>
  )
}