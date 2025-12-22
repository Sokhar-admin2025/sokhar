'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js' // Standard-koppling
import { useRouter } from 'next/navigation'

// Koppla upp mot Supabase direkt i filen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function CreateAd() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFiles = (e: any) => {
    const selected = Array.from(e.target.files as FileList)
    if (selected.length + files.length > 5) {
      alert('Max 5 bilder!')
      return
    }
    setFiles([...files, ...selected])
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.target)

    // 1. Kolla vem som är inloggad
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Du verkar ha loggats ut. Logga in igen.')
      router.push('/login')
      return
    }

    try {
      // 2. Skapa själva annonsen i databasen
      const { data: ad, error } = await supabase.from('listings').insert({
        title: form.get('title'),
        description: form.get('description'),
        price: Number(form.get('price')), // Gör om text till siffra
        category: form.get('category'),
        location: form.get('location'),
        user_id: user.id,
        status: 'active'
      }).select().single()

      if (error) throw error

      // 3. Ladda upp bilder (Om några valdes)
      const imageUrls = []
      
      for (const file of files) {
        // Skapa ett unikt filnamn: annonsID / slumpnummer . filändelse
        const fileExt = file.name.split('.').pop()
        const fileName = `${ad.id}/${Math.random().toString(36).slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Hämta den publika länken till bilden
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)
          
        imageUrls.push(publicUrl)
      }

      // 4. Uppdatera annonsen med bildlänkarna
      if (imageUrls.length > 0) {
        await supabase
          .from('listings')
          .update({ images: imageUrls })
          .eq('id', ad.id)
      }

      // Klart! Skicka användaren till startsidan (eller dashboarden)
      alert('Annons skapad!')
      router.push('/dashboard')

    } catch (error: any) {
      console.error(error)
      alert('Något gick fel: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Skapa annons</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Vad vill du sälja?</label>
            <input name="title" required placeholder="T.ex. iPhone 12" className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beskrivning</label>
            <textarea name="description" required placeholder="Berätta om prylen..." className="w-full p-2 border rounded h-32" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pris (kr)</label>
              <input name="price" type="number" required placeholder="0" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stad / Plats</label>
              <input name="location" required placeholder="Stockholm" className="w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select name="category" className="w-full p-2 border rounded bg-white">
              <option value="Övrigt">Övrigt</option>
              <option value="Fordon">Fordon</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Kläder">Kläder</option>
              <option value="Möbler">Möbler</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center bg-gray-50 hover:bg-gray-100 transition">
            <input type="file" multiple onChange={handleFiles} accept="image/*" className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "/>
            <p className="text-sm text-gray-400 mt-2">{files.length} bilder valda</p>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Publicerar...' : 'Publicera nu'}
          </button>
        </form>
      </div>
    </div>
  )
}