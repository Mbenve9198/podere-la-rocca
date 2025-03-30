import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
  // Verifica l'autenticazione
  const authResponse = await authMiddleware(req);
  if (authResponse.status === 401) {
    return authResponse;
  }

  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Costruisci la query di filtro
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Esegue la query per ottenere gli ordini
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero degli ordini:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero degli ordini' },
      { status: 500 }
    );
  }
} 