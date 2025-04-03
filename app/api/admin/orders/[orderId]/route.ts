import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// Endpoint per recuperare i dettagli di un ordine specifico
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log(`API GET /orders/${params.orderId}: Ricevuta richiesta di recupero ordine`);
    
    // Connessione al database
    await dbConnect();
    
    // Recupera l'ordine dal database
    const order = await Order.findById(params.orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error(`API GET /orders/${params.orderId}: Errore durante il recupero dell'ordine:`, error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante il recupero dell\'ordine',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 