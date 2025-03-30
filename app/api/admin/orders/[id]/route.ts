import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { authMiddleware } from '@/middleware/authMiddleware';

interface Params {
  params: {
    id: string;
  };
}

// Ottieni un ordine specifico
export async function GET(req: NextRequest, { params }: Params) {
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
        { success: false, message: 'ID ordine non specificato' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero dell\'ordine:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero dell\'ordine' },
      { status: 500 }
    );
  }
}

// Aggiorna un ordine
export async function PATCH(req: NextRequest, { params }: Params) {
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
        { success: false, message: 'ID ordine non specificato' },
        { status: 400 }
      );
    }
    
    // Recupera i dati dell'aggiornamento
    const updates = await req.json();
    
    // Verifica che lo stato sia valido
    if (updates.status && !['waiting', 'processing', 'completed', 'cancelled'].includes(updates.status)) {
      return NextResponse.json(
        { success: false, message: 'Stato ordine non valido' },
        { status: 400 }
      );
    }
    
    // Aggiorna l'ordine nel database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ordine aggiornato con successo',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento dell\'ordine:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento dell\'ordine' },
      { status: 500 }
    );
  }
} 