import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Podere La Rocca - Cocktail App',
  description: 'Applicazione per ordinare cocktail e bevande',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'