import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order, { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
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
    
    // Mappa per contare i prodotti nel periodo attuale
    const productCountMap = new Map();
    
    // Conta i prodotti venduti nel periodo corrente
    currentOrders.forEach(order => {
      order.items.forEach((item: IOrderItem) => {
        const productId = item.productId;
        const quantity = item.quantity;
        
        if (productCountMap.has(productId)) {
          productCountMap.set(productId, {
            ...productCountMap.get(productId),
            count: productCountMap.get(productId).count + quantity
          });
        } else {
          productCountMap.set(productId, { 
            id: productId,
            name: item.name,
            count: quantity,
            trend: 0
          });
        }
      });
    });
    
    // Mappa per contare i prodotti nel periodo precedente
    const previousProductCountMap = new Map();
    
    // Conta i prodotti venduti nel periodo precedente
    previousOrders.forEach(order => {
      order.items.forEach((item: IOrderItem) => {
        const productId = item.productId;
        const quantity = item.quantity;
        
        if (previousProductCountMap.has(productId)) {
          previousProductCountMap.set(productId, previousProductCountMap.get(productId) + quantity);
        } else {
          previousProductCountMap.set(productId, quantity);
        }
      });
    });
    
    // Calcola la tendenza per ogni prodotto
    for (const [productId, product] of productCountMap.entries()) {
      const previousCount = previousProductCountMap.get(productId) || 0;
      if (previousCount > 0) {
        const trendPercentage = ((product.count - previousCount) / previousCount) * 100;
        productCountMap.set(productId, {
          ...product,
          trend: Math.round(trendPercentage)
        });
      }
    }
    
    // Converti la mappa in array e ordina per conteggio
    const topProducts = Array.from(productCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: topProducts
    });
  } catch (error: any) {
    console.error('Errore durante il recupero dei prodotti più venduti:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero dei prodotti più venduti' },
      { status: 500 }
    );
  }
} 