import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'podere-la-rocca-secret-key';
const JWT_EXPIRY = '7d'; // Il token scade dopo 7 giorni

export async function POST(req: NextRequest) {
  try {
    // Connessione al database
    await dbConnect();
    
    // Estrazione delle credenziali dalla richiesta
    const { username, password } = await req.json();
    
    // Validazione delle credenziali
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Nome utente e password sono obbligatori' },
        { status: 400 }
      );
    }
    
    // Ricerca dell'admin nel database
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    // Verifica se l'admin esiste
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Credenziali non valide' },
        { status: 401 }
      );
    }
    
    // Verifica della password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Credenziali non valide' },
        { status: 401 }
      );
    }
    
    // Generazione del token JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    // Crea la risposta
    const response = NextResponse.json({
      success: true,
      message: 'Login effettuato con successo',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
      token // Invia anche il token nella risposta JSON
    });
    
    // Imposta il cookie
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 giorni in secondi
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Errore durante il login:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il login' },
      { status: 500 }
    );
  }
} 