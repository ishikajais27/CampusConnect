import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Campus Connect — Collegiate Gazette & Assemblages',
  description: 'Curated lectures, creative salons, research symposia, and athletic fixtures across collegiate societies and research foundations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="w-full pt-20 bg-surface min-h-[calc(100vh-220px)]">
            <div className="flex flex-col w-full">
              {children}
            </div>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
