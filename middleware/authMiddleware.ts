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
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  // Se il token non esiste e l'autenticazione è richiesta
  if (!token && config.required) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Autenticazione richiesta' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verifica il token
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Aggiungi i dati dell'admin alla richiesta
      return NextResponse.next();
    }

    // Se l'autenticazione non è richiesta, permetti l'accesso anche senza token
    if (!config.required) {
      return NextResponse.next();
    }

    // Non dovremmo arrivare qui se config.required è true, ma per sicurezza
    throw new Error('Token non valido');
  } catch (error) {
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
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

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