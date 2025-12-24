'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

import { DASHBOARD_TEXTS } from '../../lib/content'
import Button from '../../components/atoms/Button'
import { messageService } from '../../services/messageService' // <--- Ny import!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function ListingDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id
  const t = DASHBOARD_TEXTS.details

  // State
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // State för kontakt-knappen
  const [contacting, setContacting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Vem är inloggad?
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // 2. Hämta annonsen
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
      } else {
        setAd(data)
      }
      setLoading(false)
    }

    if (id) fetchData()
  }, [id])

  // --- NY FUNKTION: HANTERA KONTAKT ---
  const handleContact = async () => {
    // 1. Är man inloggad?
    if (!currentUser) {
      alert(DASHBOARD_TEXTS.messages.actions.loginToChat) // "Logga in för att chatta"
      router.push('/login')
      return
    }

    // 2. Är man ägaren? (Får inte chatta med sig själv)
    if (currentUser.id === ad.user_id) {
      alert("Du kan inte chatta på din egen annons! 😅")
      return
    }

    setContacting(true)

    try {
      // 3. Anropa vår Service för att skapa/hämta rummet
      const conversationId = await messageService.createConversation(
        ad.id,
        currentUser.id, // Köpare (Du)
        ad.user_id      // Säljare (Den som äger annonsen)
      )

      // 4. Skicka iväg användaren till Inkorgen
      router.push('/dashboard/messages')
      
    } catch (error) {
      console.error(error)
      alert("Kunde inte starta chatten just nu.")
    } finally {
      setContacting(false)
    }
  }

  if (loading) return <div className="p-10 text-center">{t.loading}</div>
  
  if (!ad) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold mb-4">{t.notFound.title}</h2>
      <Link href="/" className="text-blue-600 underline">{t.notFound.link}</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Tillbaka-länk */}
        <Link href="/" className="inline-block mb-6 text-sm font-medium text-gray-500 hover:text-black transition">
          {t.backToHome}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Vänster: Bild */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-square relative">
            {ad.images && ad.images[0] ? (
              <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                {t.noImage}
              </div>
            )}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              {ad.category}
            </div>
          </div>

          {/* Höger: Info */}
          <div className="flex flex-col h-full">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex-1">
              
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{ad.title}</h1>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-2">📍</span>
                  {ad.location}
                  <span className="mx-2">•</span>
                  {new Date(ad.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-8">
                {ad.price} kr
              </div>

              <div className="prose prose-sm text-gray-600 mb-8">
                <h3 className="text-gray-900 font-semibold mb-2">{t.sections.description}</h3>
                <p className="whitespace-pre-line">{ad.description}</p>
              </div>

              {/* KONTAKT-KNAPP (Nu inkopplad!) */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                {ad.status === 'active' ? (
                  <Button 
                    onClick={handleContact} 
                    className="w-full py-4 text-lg font-bold shadow-lg shadow-blue-500/20"
                    disabled={contacting}
                  >
                    {contacting ? 'Öppnar chatt...' : t.contact.button}
                  </Button>
                ) : (
                   <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500 font-medium">
                     Denna vara är inte längre till salu.
                   </div>
                )}
                
                {/* Info om att chatten är säker */}
                <p className="text-xs text-center text-gray-400 mt-4">
                  🔒 Handla tryggt. All kommunikation sker via Sokhar.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}