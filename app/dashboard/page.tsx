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
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State för Modal-fönstret (Soptunnan)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [adToDelete, setAdToDelete] = useState<any>(null)
  const [deleteReason, setDeleteReason] = useState('sold_here')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: userAds } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (userAds) setAds(userAds)
      setLoading(false)
    }
    getData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Öppna rutan och kom ihåg vilken annons vi pratar om
  const promptDelete = (e: any, ad: any) => {
    e.stopPropagation() // Så vi inte råkar klicka på annonsen och hamna på detaljsidan
    setAdToDelete(ad)
    setIsDeleteModalOpen(true)
  }

  // Den stora röda knappen - Utför raderingen
  const confirmDelete = async () => {
    if (!adToDelete) return
    setIsDeleting(true)

    try {
      // 1. Logga anledningen (Datainsamling)
      // Vi kör en "try" här ifall du inte skapat tabellen än, så kraschar det inte.
      try {
        await supabase.from('deletion_logs').insert({
          user_id: user.id,
          reason: deleteReason,
          ad_title: adToDelete.title
        })
      } catch (err) {
        console.log("Kunde inte spara logg (tabellen kanske saknas?), men fortsätter radera.")
      }

      // 2. Ta bort själva annonsen
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', adToDelete.id)

      if (error) throw error

      // 3. Uppdatera listan på skärmen så den försvinner direkt
      setAds(ads.filter(a => a.id !== adToDelete.id))
      setIsDeleteModalOpen(false)
      setAdToDelete(null)

    } catch (error: any) {
      alert('Hoppsan, den ville inte försvinna: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Laddar...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mina Annonser ({ads.length})</h2>
          
          {ads.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
              <p>Här ekar det tomt. Dags att rensa garaget?</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div 
                  key={ad.id} 
                  onClick={() => router.push(`/annons/${ad.id}`)}
                  className="group flex gap-4 p-4 border rounded hover:bg-gray-50 transition cursor-pointer relative"
                >
                  {/* Soptunnan - Syns bara när man hovrar (på dator) eller alltid (mobil) */}
                  <button
                    onClick={(e) => promptDelete(e, ad)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition z-10"
                    title="Radera annons"
                  >
                    {/* Trash icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>

                  <div className="h-20 w-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                    {ad.images && ad.images[0] ? (
                      <img src={ad.images[0]} alt={ad.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Ingen bild</div>
                    )}
                  </div>
                  
                  <div className="flex-1 pr-10"> {/* Padding right för att inte krocka med soptunnan */}
                    <h3 className="font-bold text-lg">{ad.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{ad.price} kr</p>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      {ad.status === 'active' ? 'Aktiv' : 'Såld'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL - SOPTUNNAN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Är du verkligen säker?? 💔</h3>
              <p className="text-gray-500 mt-2">
                Du är på väg att radera <strong>{adToDelete?.title}</strong>. 
                Går du vidare så försvinner den för gott. Poff! 💨
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 mb-3">Bara av nyfikenhet, varför lämnar du oss?</p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="sold_here" 
                    checked={deleteReason === 'sold_here'}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Såld här (Ni är bäst! ⭐)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="sold_elsewhere" 
                    checked={deleteReason === 'sold_elsewhere'}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Såld någon annanstans (Jag var otrogen...)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="just_delete" 
                    checked={deleteReason === 'just_delete'}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Vill bara ta bort den (Inga frågor, tack)</span>
                </label>

              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition"
                disabled={isDeleting}
              >
                Jag ångrar mig!
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg shadow-red-200"
              >
                {isDeleting ? 'Sopar...' : 'Radera nu'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}