import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  // Verifica se la richiesta è per una rotta admin
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  // Se non è una rotta admin, lascia passare la richiesta
  if (!isAdminRoute) {
    return NextResponse.next()
  }
  
  // La pagina di login è esclusa dal middleware
  if (request.nextUrl.pathname === '/auth/login') {
    return NextResponse.next()
  }
  
  // Ottieni il token dai cookie
  const token = request.cookies.get('admin_token')?.value
  
  // Se non c'è token, reindirizza alla pagina di login
  if (!token) {
    // Salva l'URL originale per reindirizzare l'utente dopo il login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  // Se c'è un token, verifica che sia valido
  try {
    // Qui puoi fare una verifica più approfondita, ad esempio chiamando un'API
    // Per ora controllo solo che il token esista
    return NextResponse.next()
  } catch (error) {
    // Se il token non è valido, reindirizza alla pagina di login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
}

// Configurazione del middleware per eseguirsi solo su determinate rotte
export const config = {
  matcher: [
    // Proteggi tutte le rotte della dashboard admin
    '/admin/:path*',
  ],
} 