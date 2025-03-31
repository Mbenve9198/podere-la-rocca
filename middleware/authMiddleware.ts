import { NextRequest, NextResponse } from 'next/server';
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
  
  // Ottieni il token dal cookie oppure dall'header Authorization
  let token = req.cookies.get('admin_token')?.value;
  const authHeader = req.headers.get('Authorization');
  
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    console.log('AuthMiddleware: Token recuperato dall\'header Authorization');
  }
  
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
        console.log('AuthMiddleware: Token valido, autenticazione riuscita', decoded);
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
 * Estrae le informazioni dell'admin dal token JWT nei cookie o header
 */
export function getAdminFromRequest(req: NextRequest) {
  // Prova a ottenere il token dal cookie
  let token = req.cookies.get('admin_token')?.value;
  
  // Se non c'è nel cookie, controlla l'header Authorization
  if (!token) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

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