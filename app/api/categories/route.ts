import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const parent = url.searchParams.get('parent');
    
    // Costruisci la query di filtro
    let filter: any = {};
    
    // Se è richiesto solo le categorie principali (non le sottocategorie di Light Lunch)
    if (parent) {
      if (parent === 'main') {
        // Recupera solo le categorie principali (cocktails, softDrinks, caffetteria, lightLunch)
        filter = {
          name: { $in: ['cocktails', 'softDrinks', 'caffetteria', 'lightLunch'] }
        };
      } else {
        // Recupera solo le sottocategorie di Light Lunch (antipasti, primi, secondi, contorni, frutta)
        filter = {
          name: { $in: ['antipasti', 'primi', 'secondi', 'contorni', 'frutta'] }
        };
      }
    }
    
    // Esegue la query per ottenere le categorie
    const categories = await Category.find(filter).sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero delle categorie:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero delle categorie' },
      { status: 500 }
    );
  }
} 