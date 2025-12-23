'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Importera text och komponenter
import { DASHBOARD_TEXTS } from '../../lib/content'
import Button from '../../components/atoms/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function CreateListing() {
  const router = useRouter()
  
  // State för formuläret
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Övrigt')
  const [images, setImages] = useState<string[]>([])
  
  // State för laddning
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Hämta texter
  const t = DASHBOARD_TEXTS.create

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      setUploading(true)
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // ÄNDRING HÄR: Vi använder 'listing-images' istället för 'images'
      const { error: uploadError } = await supabase.storage
        .from('listing-images') 
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // ÄNDRING HÄR OCKSÅ: Samma bucket-namn här
      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)
      
      // Lägg till bilden i listan
      setImages([...images, data.publicUrl])

    } catch (error: any) {
      alert('Fel vid uppladdning: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Ingen användare inloggad')

      const { error } = await supabase
        .from('listings')
        .insert({
          title,
          description,
          price: parseInt(price),
          location,
          category,
          images,
          user_id: user.id,
          status: 'active'
        })

      if (error) throw error

      // Skicka användaren tillbaka till dashboarden
      router.push('/dashboard')
      router.refresh() // Uppdatera så den nya annonsen syns direkt

    } catch (error: any) {
      alert('Kunde inte skapa annons: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header och Tillbaka-knapp */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t.header}</h1>
          <Button variant="link" onClick={() => router.push('/dashboard')}>
            {t.backLink}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          {/* RUBRIK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.form.title.label}
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={t.form.title.placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.form.category.label}
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {t.form.category.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* PRIS & PLATS (Två kolumner) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.price.label}
              </label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder={t.form.price.placeholder}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.location.label}
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder={t.form.location.placeholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* BESKRIVNING */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.form.description.label}
            </label>
            <textarea
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={t.form.description.placeholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* BILDER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.form.image.label}
            </label>
            
            <div className="flex flex-wrap gap-4 mb-3">
              {/* Visa uppladdade bilder */}
              {images.map((url, index) => (
                <div key={index} className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="Uppladdad" className="w-full h-full object-cover" />
                </div>
              ))}
              
              {/* Knapp för att ladda upp */}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                <span className="text-2xl text-gray-400">+</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="hidden" 
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-blue-600 animate-pulse">{t.form.image.uploading}</p>}
          </div>

          <hr className="border-gray-100" />

          {/* PUBLICERA-KNAPP */}
          <div className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4 text-lg font-bold"
              disabled={loading || uploading}
            >
              {loading ? t.submit.loading : t.submit.btn}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}