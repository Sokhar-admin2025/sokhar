'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

import { DASHBOARD_TEXTS } from '../../lib/content'
import Button from '../../components/atoms/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function CreateListing() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Övrigt')
  const [images, setImages] = useState<string[]>([])
  
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const t = DASHBOARD_TEXTS.create

  // HÄR ÄR DEN NYA UPPDATERADE FUNKTIONEN
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return

      // SPÄRR 1: Max 5 bilder
      if (images.length >= 5) {
        alert(t.form.image.errorTooMany)
        return // Avbryt funktionen här
      }

      const file = e.target.files[0]

      // SPÄRR 2: Max 2MB (2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        alert(t.form.image.errorTooBig)
        return // Avbryt funktionen här
      }

      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Vi använder rätt bucket: listing-images
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)
      
      setImages([...images, data.publicUrl])

    } catch (error: any) {
      alert('Fel vid uppladdning: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Funktion för att ta bort en bild innan man publicerar
  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
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

      router.push('/dashboard')
      router.refresh()

    } catch (error: any) {
      alert('Kunde inte skapa annons: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t.header}</h1>
          <Button variant="link" onClick={() => router.push('/dashboard')}>
            {t.backLink}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.form.image.label}
              </label>
              <span className="text-xs text-gray-400">
                {images.length}/5 bilder
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-3">
              {/* Visa uppladdade bilder med en liten kryss-knapp för att ta bort */}
              {images.map((url, index) => (
                <div key={index} className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={url} alt="Uppladdad" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {/* Knapp för att ladda upp (Visas bara om man har färre än 5 bilder) */}
              {images.length < 5 && (
                <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="text-2xl text-gray-400">+</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            {uploading && <p className="text-sm text-blue-600 animate-pulse">{t.form.image.uploading}</p>}
          </div>

          <hr className="border-gray-100" />

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