'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([]) // Här sparar vi annonserna
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      // 1. Hämta användaren
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // 2. Hämta användarens annonser
      const { data: userAds, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id) // Bara mina egna
        .order('created_at', { ascending: false }) // Nyast först

      if (userAds) {
        setAds(userAds)
      }
      
      setLoading(false)
    }

    getData()
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
        
        {/* Handlings-kort */}
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

        {/* Mina Annonser-lista */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mina Annonser ({ads.length})</h2>
          
          {ads.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
              <p>Du har inte skapat några annonser än.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                // Byt ut biten inuti {ads.map((ad) => ( ... ))} mot detta:

<div 
  key={ad.id} 
  // Här lägger vi till klick-funktionen:
  onClick={() => router.push(`/annons/${ad.id}`)}
  className="flex gap-4 p-4 border rounded hover:bg-gray-50 transition cursor-pointer" // cursor-pointer gör att musen blir en hand
>
  {/* Bild-delen (samma som förut) */}
  <div className="h-20 w-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
    {ad.images && ad.images[0] ? (
      <img src={ad.images[0]} alt={ad.title} className="h-full w-full object-cover" />
    ) : (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Ingen bild</div>
    )}
  </div>
  
  {/* Text-delen */}
  <div className="flex-1">
    <h3 className="font-bold text-lg">{ad.title}</h3>
    <p className="text-gray-600 text-sm mb-2">{ad.price} kr</p>
    <div className="flex gap-2">
      <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
        {ad.status === 'active' ? 'Aktiv' : 'Såld'}
      </span>
      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
        Klicka för att visa
      </span>
    </div>
  </div>
</div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}