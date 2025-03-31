import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/authMiddleware';

export const config = {
  // Applica il middleware solo alle rotte admin
  matcher: ['/admin/:path*'],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Consenti l'accesso alla pagina di login dell'admin
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }
  
  // Verifica l'autenticazione per tutte le altre rotte admin
  const authResponse = await authMiddleware(req);
  
  // Se non autenticato, reindirizza al login
  if (authResponse.status === 401) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    // Aggiungi il redirect_to per tornare alla pagina originale dopo il login
    url.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(url);
  }
  
  return authResponse;
} 