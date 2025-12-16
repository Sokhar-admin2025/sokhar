'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { processImage } from '@/lib/image-utils'
import { AD_CONFIG } from '@/lib/constants'

export default function CreateAd() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleFiles = (e: any) => {
    const selected = Array.from(e.target.files as FileList)
    if (selected.length + files.length > AD_CONFIG.MAX_IMAGES) {
      alert('Max 5 bilder!')
      return
    }
    setFiles([...files, ...selected])
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.target)

    // 1. Logga in (Anonymt för demo/MVP, eller kräver inloggad user)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // För MVP demo: Vi omdirigerar till login om man inte är inloggad
      alert('Du måste logga in först! (Implementera login-sidan)')
      setLoading(false)
      return
    }

    try {
      // 2. Skapa annonsraden
      const { data: ad, error } = await supabase.from('listings').insert({
        title: form.get('title'),
        description: form.get('description'),
        price: form.get('price'),
        category: form.get('category'),
        location: form.get('location'),
        user_id: user.id,
        status: 'active'
      }).select().single()

      if (error) throw error

      // 3. Ladda upp bilder
      const urls = []
      for (const file of files) {
        const blob = await processImage(file)
        const path = `${ad.id}/${Math.random().toString(36).slice(2)}.jpg`
        await supabase.storage.from('listing-images').upload(path, blob)
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }

      // 4. Spara bildlänkar
      if (urls.length > 0) {
        await supabase.from('listings').update({ images: urls }).eq('id', ad.id)
      }

      router.push('/')
    } catch (error: any) {
      alert('Fel: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Skapa annons</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" required placeholder="Vad vill du sälja?" className="w-full p-2 border rounded" />
        <textarea name="description" required placeholder="Beskrivning" className="w-full p-2 border rounded h-32" />
        <div className="grid grid-cols-2 gap-4">
          <input name="price" type="number" required placeholder="Pris" className="w-full p-2 border rounded" />
          <input name="location" required placeholder="Stad" className="w-full p-2 border rounded" />
        </div>
        <select name="category" className="w-full p-2 border rounded">
          <option>Övrigt</option><option>Fordon</option><option>Elektronik</option><option>Kläder</option>
        </select>

        <div className="border-2 border-dashed p-4 rounded text-center">
          <input type="file" multiple onChange={handleFiles} accept="image/*" />
          <p className="text-sm text-gray-500 mt-2">{files.length} bilder valda</p>
        </div>

        <button disabled={loading} className="w-full bg-green-600 text-white p-3 rounded font-bold">
          {loading ? 'Publicerar...' : 'Publicera nu'}
        </button>
      </form>
    </div>
  )
}