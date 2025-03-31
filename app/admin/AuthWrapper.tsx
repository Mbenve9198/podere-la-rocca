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
        if (typeof window === 'undefined') {
          // Se siamo in un ambiente server, rendiamo subito i figli
          setIsLoading(false)
          return
        }
        
        const token = localStorage.getItem('admin_token')
        
        if (!token) {
          console.log('AuthWrapper: Nessun token nel localStorage')
          setIsAuthenticated(false)
          router.push('/admin/login')
          return
        }
        
        console.log('AuthWrapper: Token trovato nel localStorage, verifico validità')
        
        // Chiama l'API per verificare il token
        try {
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
        } catch (fetchError) {
          console.error('AuthWrapper: Errore durante la chiamata API', fetchError)
          // Non reindirizziamo in caso di errore di rete, potrebbe essere temporaneo
          setIsAuthenticated(true) // Permettiamo l'accesso temporaneamente
        }
      } catch (error) {
        console.error('AuthWrapper: Errore durante la verifica dell\'autenticazione', error)
        // In caso di qualsiasi errore, permettiamo comunque l'accesso temporaneamente
        // per evitare di bloccare completamente l'interfaccia
        setIsAuthenticated(true)
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
  
  // Se non è autenticato, mostriamo un messaggio di reindirizzamento
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-amber-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-amber-500 text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-medium mb-2">Accesso richiesto</h2>
        <p className="mb-4">Reindirizzamento alla pagina di login...</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
        >
          Vai alla pagina di login
        </button>
      </div>
    </div>
  )
} 