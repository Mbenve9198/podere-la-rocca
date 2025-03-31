import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  console.log('[API Products] Inizio richiesta GET /api/products');
  
  try {
    // Connessione al database
    console.log('[API Products] Tentativo di connessione al database...');
    await dbConnect();
    console.log('[API Products] Connessione al database riuscita');
    
    // Recupera i parametri dalla query string
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    console.log(`[API Products] Parametro category: ${category || 'non specificato'}`);
    
    let products = [];
    
    if (category) {
      console.log(`[API Products] Ricerca prodotti per categoria: ${category}`);
      
      // Utilizziamo un'aggregation pipeline per confrontare le categorie come stringhe
      products = await Product.aggregate([
        {
          $addFields: {
            // Converte campo category in stringa per confronto
            categoryStr: { $toString: "$category" }
          }
        },
        {
          $match: {
            // Confronta la stringa convertita con l'ID richiesto
            categoryStr: category
          }
        },
        {
          $sort: { order: 1 }
        }
      ]).exec();
      
      console.log(`[API Products] Trovati ${products.length} prodotti con aggregation`);
    } else {
      // Se non c'è categoria, recupera tutti i prodotti
      products = await Product.find({}).sort({ order: 1 }).lean();
      console.log(`[API Products] Trovati ${products.length} prodotti totali`);
    }
    
    // Restituisce i prodotti come risposta JSON
    return NextResponse.json({ 
      success: true, 
      data: products 
    });
  } catch (error: any) {
    console.error("[API Products] ERRORE durante il recupero dei prodotti:", error);
    console.error('[API Products] Dettaglio errore:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json({ 
      success: false, 
      error: "Errore durante il recupero dei prodotti" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[API Products] Inizio richiesta POST /api/products');
  
  try {
    // Connessione al database
    console.log('[API Products] Tentativo di connessione al database...');
    await dbConnect();
    console.log('[API Products] Connessione al database riuscita');
    
    // Recupera i dati dal corpo della richiesta
    const data = await request.json();
    console.log('[API Products] Dati ricevuti per il nuovo prodotto:', data);
    
    // Crea un nuovo prodotto
    const newProduct = await Product.create(data);
    console.log('[API Products] Nuovo prodotto creato con ID:', newProduct._id);
    
    // Restituisce il nuovo prodotto come risposta JSON
    return NextResponse.json({ 
      success: true, 
      data: newProduct 
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API Products] ERRORE durante la creazione del prodotto:", error);
    console.error('[API Products] Dettaglio errore:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json({ 
      success: false, 
      error: "Errore durante la creazione del prodotto" 
    }, { status: 500 });
  }
} 