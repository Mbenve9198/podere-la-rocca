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
    
    // Crea il filtro in base ai parametri
    const filter: any = {};
    if (category) {
      // Verifica se l'ID è valido e lo converte in ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = new mongoose.Types.ObjectId(category);
        console.log(`[API Products] Filtro impostato per categoria (convertito in ObjectId): ${category}`);
      } else {
        // Fallback: prova a usare la stringa originale
        filter.category = category;
        console.log(`[API Products] Filtro impostato per categoria (stringa): ${category}`);
      }
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
        // Conta tutti i prodotti per verificare se ne esistono
        const totalProducts = await Product.countDocuments({});
        console.log(`[API Products] Totale prodotti nel database: ${totalProducts}`);
        
        // Mostra un esempio di prodotto per debug
        if (totalProducts > 0) {
          const sampleProduct = await Product.findOne({}).lean();
          console.log(`[API Products] Esempio di prodotto nel database:`, JSON.stringify(sampleProduct));
          
          // Verifica esplicitamente il tipo di categoria nel sample
          if (sampleProduct && 'category' in sampleProduct) {
            console.log(`[API Products] Tipo di categoria nel sample: ${typeof sampleProduct.category}`);
            
            // Prova una query con l'approccio opposto per debug
            if (category && mongoose.Types.ObjectId.isValid(category)) {
              const testQueryWithString = await Product.find({ category: category }).lean();
              console.log(`[API Products] Test query con stringa: ${testQueryWithString.length} risultati`);
            } else {
              console.log(`[API Products] ID categoria non valido o null, skip test query`);
            }
          }
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