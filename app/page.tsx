'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Importera text och komponenter
import { DASHBOARD_TEXTS } from './lib/content'
import Button from './components/atoms/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function HomePage() {
  const router = useRouter()
  
  // State för annonser
  const [ads, setAds] = useState<any[]>([])          // Alla annonser från databasen
  const [filteredAds, setFilteredAds] = useState<any[]>([]) // De vi visar just nu
  const [loading, setLoading] = useState(true)

  // State för sökning
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alla')

  // Hämta texter
  const t = DASHBOARD_TEXTS

  // 1. Hämta data vid start
  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active') // Visa bara aktiva
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fel vid hämtning:', error)
      } else {
        setAds(data || [])
        setFilteredAds(data || []) // Visa allt från början
      }
      setLoading(false)
    }

    fetchAds()
  }, [])

  // 2. Filtrera listan när man söker eller byter kategori
  useEffect(() => {
    let result = ads

    // Filtrera på text (Rubrik eller Beskrivning)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(lowerQuery) || 
        ad.description.toLowerCase().includes(lowerQuery)
      )
    }

    // Filtrera på kategori
    if (selectedCategory !== 'Alla') {
      result = result.filter(ad => ad.category === selectedCategory)
    }

    setFilteredAds(result)
  }, [searchQuery, selectedCategory, ads])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- HEADER --- */}
      <nav className="bg-white border-b p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            {t.navigation.brand}
          </h1>
          
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-sm font-medium hover:underline text-gray-700">
              {t.navigation.myPage}
            </Link>
            
            {/* ATOM: Sälj-knapp */}
            <Button onClick={() => router.push('/dashboard/create')}>
              {t.navigation.sellBtn}
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {t.landing.hero.title}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {t.landing.hero.subtitle}
          </p>
          
          <button 
            onClick={() => router.push('/dashboard/create')}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            {t.landing.hero.cta}
          </button>
        </div>
      </div>

      {/* --- SÖK & FILTER (NYTT) --- */}
      <div className="max-w-6xl mx-auto p-6 -mt-8 relative z-10 w-full">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          
          {/* Sökruta */}
          <div className="mb-6">
            <input 
              type="text"
              placeholder={t.landing.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Kategoriknappar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              {t.landing.search.filterTitle}
            </span>
            <div className="flex flex-wrap gap-2">
              {t.landing.search.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-black text-white shadow-md' // Aktiv
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200' // Inaktiv
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- ANNONS-GALLERI --- */}
      <main className="max-w-6xl mx-auto p-6 w-full flex-grow">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{t.landing.listings.header}</h3>
          <span className="text-sm text-gray-500">{filteredAds.length} träffar</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Laddar annonser...</div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">{t.landing.listings.empty}</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('Alla')}} 
              className="text-blue-600 underline mt-2"
            >
              Rensa sökning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAds.map((ad) => (
              <Link 
                href={`/annons/${ad.id}`} 
                key={ad.id}
                className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Bild */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {ad.images && ad.images[0] ? (
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-medium">
                      {t.listing.noImage}
                    </div>
                  )}
                  {/* Kategori-badge */}
                  <div className="absolute top-2 left-2 bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                    {ad.category}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-auto">
                    <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{ad.title}</h4>
                    <div className="flex items-center text-gray-500 text-xs mb-3">
                      <span className="mr-1">{t.landing.listings.locationPrefix}</span>
                      {ad.location}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-2">
                    <span className="font-extrabold text-lg text-green-700">{ad.price} kr</span>
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

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t mt-auto py-8 text-center text-gray-400 text-sm">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  )
}