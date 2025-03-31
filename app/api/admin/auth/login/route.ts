import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Durata del token: 7 giorni
const TOKEN_EXPIRY = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera le credenziali dalla richiesta
    const { username, password } = await req.json();
    
    // Verifica che siano state fornite entrambe le credenziali
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username e password sono obbligatori' 
        },
        { status: 400 }
      );
    }
    
    // Cerca l'admin con l'username fornito
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    // Se non trova l'admin o la password non corrisponde
    if (!admin || !(await admin.comparePassword(password))) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenziali non valide' 
        },
        { status: 401 }
      );
    }
    
    // Genera un token JWT
    const token = jwt.sign(
      { 
        id: admin._id,
        username: admin.username,
        role: admin.role 
      },
      process.env.JWT_SECRET || 'secret-fallback-key', // Usa una chiave di fallback se non configurata
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Crea la risposta con i dati dell'admin
    const response = NextResponse.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
    
    // Imposta un cookie HTTP-only con il token
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      maxAge: TOKEN_EXPIRY,
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS in produzione
      sameSite: 'strict',
    });
    
    return response;
  } catch (error: any) {
    console.error('Errore durante il login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante il login' 
      },
      { status: 500 }
    );
  }
} 