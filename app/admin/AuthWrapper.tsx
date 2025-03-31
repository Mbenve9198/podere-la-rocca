"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthWrapperProps {
  children: ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Funzione per verificare l'autenticazione
    const checkAuth = async () => {
      try {
        // Ottieni il token dal localStorage
        const token = localStorage.getItem('admin_token')
        
        if (!token) {
          console.log('AuthWrapper: Nessun token nel localStorage')
          setIsAuthenticated(false)
          router.push('/admin/login')
          return
        }
        
        console.log('AuthWrapper: Token trovato nel localStorage, verifico validità')
        
        // Chiama l'API per verificare il token
        const response = await fetch('/api/admin/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          console.log('AuthWrapper: Token valido')
          setIsAuthenticated(true)
        } else {
          console.log('AuthWrapper: Token non valido')
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          setIsAuthenticated(false)
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('AuthWrapper: Errore durante la verifica dell\'autenticazione', error)
        setIsAuthenticated(false)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  // Se sta caricando, mostra un indicatore di caricamento
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-amber-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Verifica autenticazione...</h2>
        </div>
      </div>
    )
  }
  
  // Se è autenticato, mostra i figli
  if (isAuthenticated) {
    return <>{children}</>
  }
  
  // Se non è autenticato, non dovremmo arrivare qui (il router.push dovrebbe aver già reindirizzato)
  return null
} 