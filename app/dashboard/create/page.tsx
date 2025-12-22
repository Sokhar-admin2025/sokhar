'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Vi använder samma säkra koppling som i inloggningen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Laddar...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mx-auto max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Min Sida</h1>
          <p className="text-gray-600">Inloggad som: <span className="font-semibold">{user?.email}</span></p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-800 underline">
          Logga ut
        </button>
      </header>

      <main className="mx-auto max-w-4xl space-y-6">
        
        {/* Handlings-kortet med länk till din create-sida */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Har du något nytt på gång?</h2>
            <p className="text-gray-500 text-sm">Lägg upp en ny annons direkt.</p>
          </div>
          
          <button 
            onClick={() => router.push('/dashboard/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Sälj något
          </button>
        </div>

        {/* Lista för annonser (Tom just nu) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mina Annonser</h2>
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
            <p>Du har inte skapat några annonser än.</p>
          </div>
        </div>

      </main>
    </div>
  )
}