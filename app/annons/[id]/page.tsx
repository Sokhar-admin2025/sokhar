'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // Hämtar ID från URL:en
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function AdPage() {
  const { id } = useParams() // Här fångar vi "123" eller vad som står i adressen
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return

      // Hämta annonsen med matchande ID
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single() // Vi förväntar oss bara EN annons

      if (error) {
        console.error('Fel:', error)
      } else {
        setAd(data)
      }
      setLoading(false)
    }

    fetchAd()
  }, [id])

  if (loading) return <div className="p-10 text-center">Laddar annons...</div>
  
  if (!ad) return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold mb-4">Annonsen hittades inte</h1>
      <Link href="/" className="text-blue-600 underline">Gå till startsidan</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:flex">
        
        {/* Vänster sida: Bild */}
        <div className="md:w-1/2 bg-gray-200 min-h-[300px] md:min-h-full">
          {ad.images && ad.images[0] ? (
            <img 
              src={ad.images[0]} 
              alt={ad.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Ingen bild
            </div>
          )}
        </div>

        {/* Höger sida: Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold">
                {ad.category}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(ad.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
            <p className="text-2xl font-bold text-green-700 mb-6">{ad.price} kr</p>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Beskrivning</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {ad.description}
              </p>
            </div>

            <div className="flex items-center text-gray-600 mb-8">
              <span className="font-medium mr-2">📍 Plats:</span> 
              {ad.location}
            </div>
          </div>

          <div className="space-y-3">
            {/* Kontakt-knapp (Mailto-länk som MVP-lösning) */}
            <button 
              onClick={() => alert("Chatt-funktion kommer i nästa uppdatering! Just nu får du låtsas mejla säljaren.")}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-800 transition"
            >
              Kontakta säljaren
            </button>

            <Link href="/" className="block text-center text-gray-500 hover:text-black text-sm">
              ← Tillbaka till alla annonser
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}