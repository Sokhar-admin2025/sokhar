'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

import { DASHBOARD_TEXTS } from '../../../lib/content'
import Button from '../../../components/atoms/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function EditListing() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id // Hämta ID från URL:en

  // State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Övrigt')
  const [images, setImages] = useState<string[]>([])
  
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Texter (Vi lånar labels från 'create' men rubriker från 'edit')
  const tEdit = DASHBOARD_TEXTS.edit
  const tForm = DASHBOARD_TEXTS.create.form

  // 1. Hämta befintlig data
  useEffect(() => {
    const fetchAd = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Hämta annonsen och kolla att man äger den
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Säkerhet: Bara ägaren får redigera
        .single()

      if (error || !data) {
        alert('Kunde inte hitta annonsen eller så har du inte behörighet.')
        router.push('/dashboard')
        return
      }

      // Fyll i formuläret med datan från databasen
      setTitle(data.title)
      setDescription(data.description)
      setPrice(data.price.toString())
      setLocation(data.location)
      setCategory(data.category)
      setImages(data.images || [])
      setFetching(false)
    }

    fetchAd()
  }, [id, router])

  // 2. Hantera bild-uppladdning (Samma som i Create)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return

      if (images.length >= 5) {
        alert(tForm.image.errorTooMany)
        return
      }
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        alert(tForm.image.errorTooBig)
        return
      }

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

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

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
  }

  // 3. Spara ändringar (UPDATE istället för INSERT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title,
          description,
          price: parseInt(price),
          location,
          category,
          images,
          // Vi uppdaterar INTE user_id eller created_at
        })
        .eq('id', id)

      if (error) throw error

      router.push('/dashboard')
      router.refresh()

    } catch (error: any) {
      alert('Kunde inte spara: ' + error.message)
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-10 text-center">{tEdit.loadingData}</div>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{tEdit.header}</h1>
          <Button variant="link" onClick={() => router.push('/dashboard')}>
            {tEdit.backLink}
          </Button>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tForm.title.label}</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tForm.category.label}</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {tForm.category.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tForm.price.label}</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tForm.location.label}</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tForm.description.label}</label>
            <textarea
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">{tForm.image.label}</label>
              <span className="text-xs text-gray-400">{images.length}/5 bilder</span>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-3">
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
              
              {images.length < 5 && (
                <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="text-2xl text-gray-400">+</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
              )}
            </div>
            {uploading && <p className="text-sm text-blue-600 animate-pulse">{tForm.image.uploading}</p>}
          </div>

          <hr className="border-gray-100" />

          <div className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4 text-lg font-bold"
              disabled={loading || uploading}
            >
              {loading ? tEdit.submit.loading : tEdit.submit.btn}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}