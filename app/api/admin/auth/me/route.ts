import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'podere-la-rocca-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Ottieni il token dal cookie
    const token = req.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato' },
        { status: 401 }
      );
    }
    
    // Verifica il token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connessione al database
    await dbConnect();
    
    // Trova l'admin nel database
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin non trovato' },
        { status: 404 }
      );
    }
    
    // Risposta di successo
    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      }
    });
  } catch (error: any) {
    console.error('Errore durante il recupero dei dati admin:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      // Rimuovi il cookie se il token non è valido o è scaduto
      const response = NextResponse.json(
        { success: false, message: 'Token non valido o scaduto' },
        { status: 401 }
      );
      
      response.cookies.delete('admin_token');
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero dei dati admin' },
      { status: 500 }
    );
  }
} 