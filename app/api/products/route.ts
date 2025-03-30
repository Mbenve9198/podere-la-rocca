import { NextRequest, NextResponse } from 'next/server';
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
    
    // Crea il filtro in base ai parametri
    const filter: any = {};
    if (category) {
      filter.category = category;
      console.log(`[API Products] Filtro impostato per categoria: ${category}`);
    }

    console.log(`[API Products] Esecuzione query con filtro:`, JSON.stringify(filter));
    
    // Recupera i prodotti dal database
    const products = await Product.find(filter)
      .sort({ order: 1 })
      .lean()
      .maxTimeMS(3000);
    
    console.log(`[API Products] Query completata, trovati ${products.length} prodotti`);
    
    if (products.length === 0) {
      console.log(`[API Products] ATTENZIONE: Nessun prodotto trovato per la categoria ${category}`);
      
      // Controlla se la categoria esiste nel database
      try {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(category)) {
          console.log(`[API Products] ID categoria valido in formato ObjectID`);
          
          // Conta tutti i prodotti per verificare se ne esistono
          const totalProducts = await Product.countDocuments({});
          console.log(`[API Products] Totale prodotti nel database: ${totalProducts}`);
          
          // Mostra un esempio di prodotto per debug
          if (totalProducts > 0) {
            const sampleProduct = await Product.findOne({}).lean();
            console.log(`[API Products] Esempio di prodotto nel database:`, JSON.stringify(sampleProduct));
          }
        } else {
          console.log(`[API Products] ID categoria NON valido in formato ObjectID`);
        }
      } catch (err) {
        console.error(`[API Products] Errore durante il controllo di debug:`, err);
      }
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