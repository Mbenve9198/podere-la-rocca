"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import Link from "next/link"
import { toast } from "react-hot-toast"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  
  const { login, isLoading } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Inserisci username e password")
      return
    }

    const result = await login(username, password)

    if (result.success) {
      toast.success("Login effettuato con successo")
      router.push(callbackUrl)
    } else {
      setError(result.message || "Errore durante il login")
      toast.error(result.message || "Errore durante il login")
    }
  }

  return (
    <div className="flex min-h-screen bg-amber-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="mb-6"
            />
            <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Accesso Area Admin
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Inserisci le tue credenziali per accedere
            </p>
          </div>

          <div className="mt-10">
            <div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex w-full justify-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Accesso in corso...' : 'Accedi'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-amber-50 px-6 text-gray-500">Podere La Rocca</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                  Torna al sito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/background.jpg')" }}
        />
      </div>
    </div>
  )
} 