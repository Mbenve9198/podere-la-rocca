import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(req: NextRequest) {
  console.log('[API] Inizio richiesta /api/locations');
  
  try {
    console.log('[API] Tentativo di connessione al database...');
    await dbConnect();
    console.log('[API] Connessione al database riuscita');
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    console.log(`[API] Parametro type: ${type || 'non specificato'}`);
    
    // Costruisci la query di filtro
    const filter: any = { available: true };
    
    if (type) {
      filter.type = type;
    }
    
    console.log(`[API] Esecuzione query con filtro:`, JSON.stringify(filter));
    
    // Esegue la query per ottenere le posizioni con timeout
    const locations = await Location.find(filter)
      .sort({ order: 1 })
      .lean()  // Usa lean() per performance migliori
      .maxTimeMS(3000); // Aggiunge un timeout di 3 secondi alla query
    
    console.log(`[API] Query completata, trovate ${locations.length} posizioni`);
    
    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error: any) {
    console.error('[API] ERRORE durante il recupero delle posizioni:', error);
    console.error('[API] Dettaglio errore:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero delle posizioni' },
      { status: 500 }
    );
  }
} 