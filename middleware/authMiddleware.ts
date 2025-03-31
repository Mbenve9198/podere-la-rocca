import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'podere-la-rocca-secret-key';

export type AuthMiddlewareConfig = {
  required?: boolean;
};

/**
 * Middleware per proteggere le rotte admin
 * Verifica il token JWT nei cookie e controlla l'autenticazione
 */
export async function authMiddleware(
  req: NextRequest,
  config: AuthMiddlewareConfig = { required: true }
) {
  console.log('AuthMiddleware: Verifica autenticazione, required:', config.required);
  
  // NOTA: Per un approccio più affidabile, meglio usare i cookie dalla req invece di cookies()
  // che è specifico per le API Routes Server-Side
  const token = req.cookies.get('admin_token')?.value;
  console.log('AuthMiddleware: Token presente:', !!token);
  
  // Se il token non esiste e l'autenticazione è richiesta
  if (!token && config.required) {
    console.log('AuthMiddleware: Token mancante e autenticazione richiesta');
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Autenticazione richiesta' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verifica il token
    if (token) {
      console.log('AuthMiddleware: Verifica token');
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('AuthMiddleware: Token valido, autenticazione riuscita');
        // Aggiungi i dati dell'admin alla richiesta
        return NextResponse.next();
      } catch (jwtError) {
        console.error('AuthMiddleware: Errore verifica JWT:', jwtError);
        if (config.required) {
          return new NextResponse(
            JSON.stringify({ success: false, message: 'Token non valido o scaduto' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Se l'autenticazione non è richiesta, permetti l'accesso anche senza token
    if (!config.required) {
      console.log('AuthMiddleware: Autenticazione non richiesta, accesso consentito');
      return NextResponse.next();
    }

    // Non dovremmo arrivare qui se config.required è true, ma per sicurezza
    console.log('AuthMiddleware: Percorso inatteso nel flusso di autenticazione');
    throw new Error('Token non valido');
  } catch (error) {
    console.error('AuthMiddleware: Errore generale:', error);
    if (config.required) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Token non valido o scaduto' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Se l'autenticazione non è richiesta, permetti l'accesso
    return NextResponse.next();
  }
}

/**
 * Estrae le informazioni dell'admin dal token JWT nei cookie
 */
export function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
} 