import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica l'autenticazione
  const authResponse = await authMiddleware(req);
  if (authResponse.status === 401) {
    return authResponse;
  }

  try {
    await dbConnect();
    
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'ID ordine non fornito' },
        { status: 400 }
      );
    }
    
    // Estrai i dati dalla richiesta
    const { status } = await req.json();
    
    if (!status || !['waiting', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Stato non valido' },
        { status: 400 }
      );
    }
    
    // Trova e aggiorna l'ordine
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Stato dell\'ordine aggiornato con successo',
      data: {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento dello stato dell\'ordine:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento dello stato dell\'ordine' },
      { status: 500 }
    );
  }
} 