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
  
  // Vi delar upp annonserna i två listor
  const [activeAds, setActiveAds] = useState<any[]>([])
  const [soldAds, setSoldAds] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // Modal-state
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

      if (userAds) {
        setActiveAds(userAds.filter(ad => ad.status === 'active'))
        setSoldAds(userAds.filter(ad => ad.status === 'sold'))
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

  const promptDelete = (e: any, ad: any) => {
    e.stopPropagation() 
    setAdToDelete(ad)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!adToDelete) return
    setIsDeleting(true)

    try {
      // Försök spara i loggboken
      try {
        await supabase.from('deletion_logs').insert({
          user_id: user.id,
          reason: deleteReason,
          ad_title: adToDelete.title
        })
      } catch (err) { console.log("Logg misslyckades men kör vidare") }

      // LOGIKEN: Spara som såld eller radera helt?
      
      if (deleteReason === 'sold_here') {
        // SCENARIO 1: Såld hos oss -> Spara i historiken (Soft Delete)
        const { error } = await supabase
          .from('listings')
          .update({ 
            status: 'sold', 
            deleted_at: new Date().toISOString() 
          })
          .eq('id', adToDelete.id)

        if (error) throw error

        // Flytta annonsen visuellt till "Mina sålda prylar"
        const updatedAd = { ...adToDelete, status: 'sold', deleted_at: new Date().toISOString() }
        setActiveAds(activeAds.filter(a => a.id !== adToDelete.id))
        setSoldAds([updatedAd, ...soldAds])

      } else {
        // SCENARIO 2: Annat skäl -> Radera helt (Hard Delete)
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', adToDelete.id)

        if (error) throw error

        // Ta bort visuellt
        setActiveAds(activeAds.filter(a => a.id !== adToDelete.id))
      }

      setIsDeleteModalOpen(false)
      setAdToDelete(null)
      setDeleteReason('sold_here') // Återställ till standardval

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

        {/* FLIKAR */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
              activeTab === 'active' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mina Annonser ({activeAds.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
              activeTab === 'history' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mina sålda prylar 💰 ({soldAds.length})
          </button>
        </div>

        {/* AKTIVA ANNONSER */}
        {activeTab === 'active' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {activeAds.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
                <p>Här ekar det tomt. Dags att rensa garaget?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    onClick={() => router.push(`/annons/${ad.id}`)}
                    className="group flex gap-4 p-4 border rounded hover:bg-gray-50 transition cursor-pointer relative"
                  >
                    <button
                      onClick={(e) => promptDelete(e, ad)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition z-10"
                      title="Radera annons"
                    >
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
                    
                    <div className="flex-1 pr-10">
                      <h3 className="font-bold text-lg">{ad.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{ad.price} kr</p>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        Aktiv
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORIK (SÅLDA) */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {soldAds.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p>Du har inte sålt något via oss än. Men vi tror på dig! 🚀</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Datum skapad</th>
                      <th className="px-6 py-3">Rubrik</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Pris</th>
                      <th className="px-6 py-3">Såld datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldAds.map((ad) => (
                      <tr key={ad.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{new Date(ad.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{ad.title}</td>
                        <td className="px-6 py-4">{ad.category}</td>
                        <td className="px-6 py-4">{ad.price} kr</td>
                        <td className="px-6 py-4 text-gray-500">
                          {ad.deleted_at ? new Date(ad.deleted_at).toLocaleDateString() : 'Okänt'}
                          <br/>
                          <span className="text-xs text-green-600 font-medium">Såld via oss ⭐</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL MED VIMLA-VIBE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💔</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Är du säker??</h3>
              <p className="text-gray-500 mt-2">
                Du är på väg att ta bort <strong>{adToDelete?.title}</strong>. 
                Sista chansen att ångra sig! Puff!💨
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 mb-3">Bara av nyfikenhet, varför tar du bort annonsen?</p>
              
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