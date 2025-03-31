import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Location from '@/models/Location';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '3');
    const period = url.searchParams.get('period') || 'week';
    
    // Ottieni il timestamp di inizio per il periodo richiesto
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    if (period === 'today') {
      // Oggi - dalle 00:00 di oggi
      startDate.setHours(0, 0, 0, 0);
      
      // Periodo precedente: ieri
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousStartDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      // Questa settimana - 7 giorni indietro
      startDate.setDate(startDate.getDate() - 7);
      
      // Periodo precedente: settimana precedente
      previousStartDate.setDate(previousStartDate.getDate() - 14);
    } else if (period === 'month') {
      // Questo mese - 30 giorni indietro
      startDate.setDate(startDate.getDate() - 30);
      
      // Periodo precedente: mese precedente
      previousStartDate.setDate(previousStartDate.getDate() - 60);
    } else if (period === 'year') {
      // Quest'anno - 365 giorni indietro
      startDate.setDate(startDate.getDate() - 365);
      
      // Periodo precedente: anno precedente
      previousStartDate.setDate(previousStartDate.getDate() - 730);
    }
    
    // Ottieni solo gli ordini completati nel periodo corrente
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
      status: 'completed'
    });
    
    // Ottieni ordini del periodo precedente per confronto
    const previousStartEndDate = new Date(startDate);
    previousStartEndDate.setMilliseconds(-1); // Un millisecondo prima dell'inizio del periodo corrente
    
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lte: previousStartEndDate },
      status: 'completed'
    });
    
    // Carica tutte le location per ottenere i nomi
    const locations = await Location.find({});
    const locationMap = new Map();
    locations.forEach(location => {
      locationMap.set(location.code, location.translations.it);
    });
    
    // Oggetto per tenere traccia delle location nel periodo attuale
    const locationCountMap = new Map();
    
    // Conta gli ordini per location nel periodo corrente
    currentOrders.forEach(order => {
      const locationCode = order.location;
      const locationName = locationMap.get(locationCode) || locationCode; // Utilizza il codice se non trova il nome
      
      if (locationCountMap.has(locationCode)) {
        locationCountMap.set(locationCode, {
          ...locationCountMap.get(locationCode),
          count: locationCountMap.get(locationCode).count + 1
        });
      } else {
        locationCountMap.set(locationCode, {
          id: locationCode,
          name: locationName,
          count: 1,
          trend: 0
        });
      }
    });
    
    // Mappa per contare le location nel periodo precedente
    const previousLocationCountMap = new Map();
    
    // Conta gli ordini per location nel periodo precedente
    previousOrders.forEach(order => {
      const locationCode = order.location;
      
      if (previousLocationCountMap.has(locationCode)) {
        previousLocationCountMap.set(locationCode, previousLocationCountMap.get(locationCode) + 1);
      } else {
        previousLocationCountMap.set(locationCode, 1);
      }
    });
    
    // Calcola la tendenza per ogni location
    for (const [locationCode, location] of locationCountMap.entries()) {
      const previousCount = previousLocationCountMap.get(locationCode) || 0;
      if (previousCount > 0) {
        const trendPercentage = ((location.count - previousCount) / previousCount) * 100;
        locationCountMap.set(locationCode, {
          ...location,
          trend: Math.round(trendPercentage)
        });
      }
    }
    
    // Converti la mappa in array e ordina per conteggio
    const topLocations = Array.from(locationCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: topLocations
    });
  } catch (error: any) {
    console.error('Errore durante il recupero delle location più attive:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero delle location più attive' },
      { status: 500 }
    );
  }
} 