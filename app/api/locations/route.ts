import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    // Costruisci la query di filtro
    const filter: any = { available: true };
    
    if (type) {
      filter.type = type;
    }
    
    // Esegue la query per ottenere le posizioni
    const locations = await Location.find(filter).sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero delle posizioni:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero delle posizioni' },
      { status: 500 }
    );
  }
} 