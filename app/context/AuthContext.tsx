"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Definisci l'interfaccia per l'admin
interface Admin {
  id: string
  username: string
  name: string
  role: string
}

// Definisci l'interfaccia per il contesto di autenticazione
interface AuthContextType {
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

// Crea il contesto con un valore di default
const AuthContext = createContext<AuthContextType>({
  admin: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
})

// Hook personalizzato per usare il contesto di autenticazione
export const useAuth = () => useContext(AuthContext)

// Provider di autenticazione
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica lo stato di autenticazione al caricamento del componente
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/me')
        const data = await response.json()

        if (data.success) {
          setAdmin(data.data)
        } else {
          setAdmin(null)
        }
      } catch (error) {
        console.error('Errore durante la verifica dell\'autenticazione:', error)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Funzione per eseguire il login
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setAdmin(data.data)
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Errore durante il login' }
      }
    } catch (error) {
      console.error('Errore durante il login:', error)
      return { success: false, message: 'Errore di connessione al server' }
    } finally {
      setIsLoading(false)
    }
  }

  // Funzione per eseguire il logout
  const logout = async () => {
    try {
      setIsLoading(true)
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })
      
      setAdmin(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 