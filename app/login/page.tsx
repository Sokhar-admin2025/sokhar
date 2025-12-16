'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Hantera inloggning
  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Fel: ' + error.message)
      setLoading(false)
    } else {
      // Om inloggning lyckas, skicka användaren till startsidan
      router.push('/')
      router.refresh()
    }
  }

  // Hantera nyregistrering
  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage('Kunde inte skapa konto: ' + error.message)
      setLoading(false)
    } else {
      setMessage('Konto skapat! Du loggas nu in...')
      // Ofta loggas man in direkt om "Email Confirm" är avstängt
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-lg bg-white text-black">
        <h1 className="text-2xl font-bold text-center">Välkommen</h1>
        
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="din@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p className="text-sm text-red-500 text-center">{message}</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Laddar...' : 'Logga in'}
          </button>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Skapa nytt konto
          </button>
        </div>
      </div>
    </div>
  )
}