import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Campus Connect',
  description: 'Find and register for events happening on campus.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-canvas-cream font-body-md text-on-surface antialiased selection:bg-secondary-container selection:text-primary">
        <AuthProvider>
          <Navbar />
          <main className="w-full pt-20 min-h-screen">
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
