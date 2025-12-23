'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Importera text och komponenter
import { DASHBOARD_TEXTS } from '../../lib/content'
import Button from '../../components/atoms/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function AdPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State för att hålla koll på vilken bild som visas just nu
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const t = DASHBOARD_TEXTS.details

  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Fel:', error)
      } else {
        setAd(data)
        // Sätt första bilden som vald direkt när vi laddar
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0])
        }
      }
      setLoading(false)
    }

    fetchAd()
  }, [id])

  if (loading) return <div className="p-20 text-center text-gray-500">{t.loading}</div>
  
  if (!ad) return (
    <div className="p-20 text-center">
      <h1 className="text-xl font-bold mb-4">{t.notFound.title}</h1>
      <Button variant="link" onClick={() => router.push('/')}>
        {t.notFound.link}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Tillbaka-länk */}
        <div className="mb-6">
          <Button variant="link" onClick={() => router.push('/')}>
            {t.backToHome}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden md:flex min-h-[500px]">
          
          {/* --- VÄNSTER SIDA: BILDGALLERI --- */}
          <div className="md:w-3/5 bg-gray-100 p-4 flex flex-col">
            
            {/* Stora bilden */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center mb-4 relative aspect-video md:aspect-auto">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={ad.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">{t.noImage}</div>
              )}
            </div>

            {/* Tumnaglar (Småbilder) */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ad.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${
                      selectedImage === img 
                        ? 'border-blue-600 ring-2 ring-blue-100' // Markerad bild
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Bild ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- HÖGER SIDA: INFO --- */}
          <div className="md:w-2/5 p-8 flex flex-col">
            
            <div className="mb-auto">
              {/* Topp-info */}
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                  {ad.category}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(ad.created_at).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{ad.title}</h1>
              <p className="text-3xl font-bold text-green-700 mb-8">{ad.price} kr</p>
              
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.sections.description}</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-base">
                  {ad.description}
                </p>
              </div>

              <div className="flex items-center text-gray-600 mb-8 p-3 bg-gray-50 rounded-lg">
                <span className="font-bold mr-2 text-gray-800">{t.sections.location}</span> 
                {ad.location}
              </div>
            </div>

            {/* Kontaktknapp */}
            <div className="mt-6">
              <Button 
                variant="secondary" 
                className="w-full py-4 text-lg" 
                onClick={() => alert(t.contact.alert)}
              >
                {t.contact.button}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}