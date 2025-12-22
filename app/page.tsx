'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAds = async () => {
      // Hämta ALLA annonser som är aktiva, nyast först
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active') // Visa bara aktiva
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fel vid hämtning:', error)
      } else {
        setAds(data || [])
      }
      setLoading(false)
    }

    fetchAds()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER / MENY */}
      <nav className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">🛒 Min Marknadsplats</h1>
          
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Min sida
            </Link>
            <Link 
              href="/dashboard/create" 
              className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition"
            >
              Sälj något
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Välkomst-banner) */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Hitta fynd eller sälj det du inte behöver</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          En enkel och smidig marknadsplats för allt från elektronik till gamla möbler.
        </p>
        <button 
          onClick={() => router.push('/dashboard/create')}
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition"
        >
          Lägg in en annons gratis
        </button>
      </div>

      {/* ANNONS-GALLERI */}
      <main className="max-w-6xl mx-auto p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Senaste annonserna</h3>

        {loading ? (
          <div className="text-center py-20">Laddar annonser...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
            <p className="text-gray-500">Inga annonser upplagda än. Bli den första!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <Link 
                href={`/annons/${ad.id}`} 
                key={ad.id}
                className="group bg-white rounded-lg border hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {/* Bild */}
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {ad.images && ad.images[0] ? (
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Ingen bild
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {ad.location}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 truncate pr-2">{ad.title}</h4>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">{ad.category}</p>
                  <div className="mt-auto pt-3 border-t flex justify-between items-center">
                    <span className="font-bold text-green-700">{ad.price} kr</span>
                    <span className="text-xs text-gray-400">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t mt-12 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Min Marknadsplats. Byggt med Next.js & Supabase.</p>
      </footer>
    </div>
  )
}