import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Importera din nya Footer
// OBS: Kontrollera att sökvägen stämmer. 
// Om du lade filen i 'components/organisms/Footer.tsx' så är detta rätt.
import Footer from './components/organisms/Footer' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Min Marknadsplats',
  description: 'Köp och sälj enkelt och tryggt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        
        {/* Huvudinnehållet (växer för att fylla skärmen) */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Footern hamnar alltid längst ner */}
        <Footer />
        
      </body>
    </html>
  )
}