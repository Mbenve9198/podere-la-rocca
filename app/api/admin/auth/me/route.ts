import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'podere-la-rocca-secret-key';

export async function GET(req: NextRequest) {
  try {
    console.log('API /me: Ricevuta richiesta')
    
    // Prova a ottenere il token dal cookie
    const cookieStore = cookies();
    let token = cookieStore.get('admin_token')?.value;

    // Se non c'è un token nei cookie, controlla l'header Authorization
    const authHeader = req.headers.get('Authorization');
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('API /me: Token recuperato dall\'header Authorization')
    }

    // Se il token non esiste, l'utente non è autenticato
    if (!token) {
      console.log('API /me: Nessun token trovato')
      return NextResponse.json(
        { success: false, message: 'Utente non autenticato' },
        { status: 401 }
      );
    }

    try {
      // Verifica il token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
      console.log('API /me: Token JWT valido', { id: decoded.id, username: decoded.username })
      
      // Connessione al database
      await dbConnect();
      
      // Recupera i dati dell'admin dal database (opzionale, ma utile per verificare se l'admin esiste ancora)
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        console.log('API /me: Admin non trovato nel database')
        return NextResponse.json(
          { success: false, message: 'Utente non trovato' },
          { status: 401 }
        );
      }
      
      console.log('API /me: Admin trovato, autenticazione riuscita')
      
      // Restituisci le informazioni dell'admin
      return NextResponse.json({
        success: true,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      // Token non valido o scaduto
      console.error('API /me: Token non valido o scaduto', error)
      return NextResponse.json(
        { success: false, message: 'Token non valido o scaduto' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('API /me: Errore durante la verifica dell\'autenticazione:', error);
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 