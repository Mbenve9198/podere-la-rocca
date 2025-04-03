import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// Endpoint per aggiornare lo stato di un ordine
export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log(`API PUT /orders/${params.orderId}/status: Ricevuta richiesta di aggiornamento stato ordine`);
    
    // Connessione al database
    await dbConnect();
    
    // Estrai i dati dalla richiesta
    const { status } = await req.json();
    
    // Valida lo stato
    if (!['waiting', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Stato non valido' },
        { status: 400 }
      );
    }
    
    // Aggiorna lo stato dell'ordine
    const updatedOrder = await Order.findByIdAndUpdate(
      params.orderId,
      { status },
      { new: true } // Restituisce il documento aggiornato
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Stato dell'ordine aggiornato a "${status}"`,
      data: updatedOrder
    });
  } catch (error: any) {
    console.error(`API PUT /orders/${params.orderId}/status: Errore durante l'aggiornamento dello stato:`, error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante l\'aggiornamento dello stato dell\'ordine',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 