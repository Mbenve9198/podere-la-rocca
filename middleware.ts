import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/authMiddleware';

export const config = {
  // Applica il middleware solo alle rotte admin
  matcher: ['/admin/:path*'],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log('Middleware: Accesso a path:', pathname);
  
  // Debug cookie
  const adminToken = req.cookies.get('admin_token');
  console.log('Middleware: Cookie admin_token presente:', !!adminToken);
  
  // Consenti l'accesso alla pagina di login dell'admin
  if (pathname === '/admin/login') {
    console.log('Middleware: Accesso alla pagina di login consentito');
    return NextResponse.next();
  }
  
  // Verifica l'autenticazione per tutte le altre rotte admin
  console.log('Middleware: Verifica autenticazione');
  const authResponse = await authMiddleware(req);
  
  // Se non autenticato, reindirizza al login
  if (authResponse.status === 401) {
    console.log('Middleware: Autenticazione fallita, reindirizzamento al login');
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    // Aggiungi il redirect_to per tornare alla pagina originale dopo il login
    url.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(url);
  }
  
  console.log('Middleware: Autenticazione riuscita');
  return authResponse;
} 