import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    console.log('API GET /orders: Ricevuta richiesta di recupero ordini');
    
    // Estrai i parametri dalla query
    const url = new URL(req.url);
    const customerName = url.searchParams.get('customerName');
    
    console.log(`API GET /orders: Parametri query - customerName: ${customerName}`);
    
    // Connessione al database
    console.log('API GET /orders: Tentativo di connessione al database...');
    await dbConnect();
    console.log('API GET /orders: Connessione al database riuscita');
    
    // Costruisci il filtro per la query
    const filter: any = {};
    if (customerName) {
      // Utilizzare una regex per trovare corrispondenze parziali
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    
    console.log('API GET /orders: Filtro query:', filter);
    
    // Recupera gli ordini filtrati, ordinati per data di creazione decrescente
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(20); // limita a 20 ordini più recenti per performance
    
    console.log(`API GET /orders: Recuperati ${orders.length} ordini`);
    
    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    console.error('API GET /orders: Errore durante il recupero degli ordini:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante il recupero degli ordini',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('API /orders: Ricevuta richiesta di creazione ordine');
    
    // Connessione al database
    console.log('API /orders: Tentativo di connessione al database...');
    await dbConnect();
    console.log('API /orders: Connessione al database riuscita');
    
    // Estrai i dati dell'ordine dalla richiesta
    const data = await req.json();
    console.log('API /orders: Dati ordine ricevuti:', JSON.stringify(data));
    
    // Verifica che i dati necessari siano presenti
    if (!data.customerName || !data.location || !data.items || data.items.length === 0) {
      console.log('API /orders: Dati mancanti per l\'ordine', data);
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
    console.log(`API /orders: Totale ordine calcolato: ${total}`);
    
    try {
      // Crea un nuovo ordine
      console.log('API /orders: Creazione nuovo ordine...');
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
      
      // Debug - verifichiamo i dati del nuovo ordine prima del salvataggio
      console.log('API /orders: Dati ordine prima del salvataggio:', {
        customer: newOrder.customerName,
        location: newOrder.location,
        locationDetail: newOrder.locationDetail,
        items: newOrder.items.length,
        total: newOrder.total,
        orderNumber: newOrder.orderNumber
      });
      
      // Salva l'ordine nel database
      console.log('API /orders: Tentativo di salvataggio ordine...');
      const savedOrder = await newOrder.save();
      console.log(`API /orders: Ordine salvato con ID: ${savedOrder._id} e numero ordine: ${savedOrder.orderNumber}`);
      
      return NextResponse.json({
        success: true,
        message: 'Ordine creato con successo',
        data: {
          id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          status: savedOrder.status,
          createdAt: savedOrder.createdAt,
        },
      });
    } catch (saveError: any) {
      // Errore specifico durante il salvataggio dell'ordine
      console.error('API /orders: Errore durante il salvataggio dell\'ordine:', saveError);
      
      // Fornisci un messaggio di errore più specifico in base al tipo di errore
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(field => 
          `${field}: ${saveError.errors[field].message}`
        ).join(', ');
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Errore di validazione: ${validationErrors}`,
            error: saveError.message 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Errore durante il salvataggio dell\'ordine', 
          error: saveError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API /orders: Errore generale durante la creazione dell\'ordine:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante la creazione dell\'ordine',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 