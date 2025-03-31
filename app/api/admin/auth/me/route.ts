import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Ottieni il token dai cookie
    const token = req.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nessun token fornito' 
        },
        { status: 401 }
      );
    }
    
    try {
      // Verifica il token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret-fallback-key'
      ) as { id: string; username: string; role: string };
      
      // Ottieni i dati dell'admin dal database (senza la password)
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admin non trovato' 
          },
          { status: 404 }
        );
      }
      
      // Restituisci i dati dell'admin
      return NextResponse.json({
        success: true,
        data: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      // Se il token non è valido
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token non valido o scaduto' 
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Errore durante la verifica dell\'autenticazione:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante la verifica dell\'autenticazione' 
      },
      { status: 500 }
    );
  }
} 