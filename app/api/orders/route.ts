import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Estrai i dati dell'ordine dalla richiesta
    const data = await req.json();
    
    // Verifica che i dati necessari siano presenti
    if (!data.customerName || !data.location || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dati mancanti per l\'ordine' },
        { status: 400 }
      );
    }
    
    // Calcola il totale dell'ordine
    const total = data.items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    
    // Crea un nuovo ordine
    const newOrder = new Order({
      customerName: data.customerName,
      location: data.location,
      locationDetail: data.locationDetail || null,
      items: data.items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: total,
      status: 'waiting',
      notes: data.notes || '',
    });
    
    // Salva l'ordine nel database
    await newOrder.save();
    
    return NextResponse.json({
      success: true,
      message: 'Ordine creato con successo',
      data: {
        id: newOrder._id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Errore durante la creazione dell\'ordine:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante la creazione dell\'ordine' },
      { status: 500 }
    );
  }
} 