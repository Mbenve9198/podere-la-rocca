import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    // Connessione al database
    await dbConnect();
    
    // Recupera i parametri dalla query string
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Crea il filtro in base ai parametri
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    
    // Recupera i prodotti dal database
    const products = await Product.find(filter).sort({ order: 1 });
    
    // Restituisce i prodotti come risposta JSON
    return NextResponse.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error("Errore durante il recupero dei prodotti:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Errore durante il recupero dei prodotti" 
    }, { status: 500 });
  }
} 