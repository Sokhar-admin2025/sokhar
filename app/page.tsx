import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: listings } = await supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(10)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white p-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sök här!</h1>
        <Link href="/dashboard/create" className="bg-blue-600 text-white px-4 py-2 rounded">Sälj något</Link>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Senaste annonserna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings?.map((ad: any) => (
            <div key={ad.id} className="bg-white p-4 rounded shadow">
              {ad.images?.[0] && (
                <img src={ad.images[0]} alt={ad.title} className="w-full h-48 object-cover rounded mb-4"/>
              )}
              <h3 className="font-bold text-lg">{ad.title}</h3>
              <p className="text-green-700 font-bold">{ad.price} kr</p>
              <p className="text-gray-500 text-sm">{ad.location}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}