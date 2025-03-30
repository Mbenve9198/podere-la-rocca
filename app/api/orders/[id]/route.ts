import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'ID ordine non fornito' },
        { status: 400 }
      );
    }
    
    // Trova l'ordine nel database
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Ordine non trovato' },
        { status: 404 }
      );
    }
    
    // Restituisci solo le informazioni essenziali dell'ordine
    return NextResponse.json({
      success: true,
      data: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Errore durante il recupero dell\'ordine:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero dell\'ordine' },
      { status: 500 }
    );
  }
} 