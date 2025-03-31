import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Recupera i parametri di query
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'week';
    
    // Ottieni il timestamp di inizio per il periodo richiesto
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();
    
    if (period === 'today') {
      // Oggi - dalle 00:00 di oggi
      startDate.setHours(0, 0, 0, 0);
      
      // Periodo precedente: ieri
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousStartDate.setHours(0, 0, 0, 0);
      previousEndDate = new Date(startDate);
      previousEndDate.setMilliseconds(-1);
    } else if (period === 'week') {
      // Questa settimana - 7 giorni indietro
      startDate.setDate(startDate.getDate() - 7);
      
      // Periodo precedente: settimana precedente
      previousStartDate.setDate(previousStartDate.getDate() - 14);
      previousEndDate = new Date(startDate);
      previousEndDate.setMilliseconds(-1);
    } else if (period === 'month') {
      // Questo mese - 30 giorni indietro
      startDate.setDate(startDate.getDate() - 30);
      
      // Periodo precedente: mese precedente
      previousStartDate.setDate(previousStartDate.getDate() - 60);
      previousEndDate = new Date(startDate);
      previousEndDate.setMilliseconds(-1);
    } else if (period === 'year') {
      // Quest'anno - 365 giorni indietro
      startDate.setDate(startDate.getDate() - 365);
      
      // Periodo precedente: anno precedente
      previousStartDate.setDate(previousStartDate.getDate() - 730);
      previousEndDate = new Date(startDate);
      previousEndDate.setMilliseconds(-1);
    }
    
    // Ottieni solo gli ordini con stato "completed"
    const completedStatus = 'completed';
    
    // Query per gli ordini del periodo corrente
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
      status: completedStatus
    });
    
    // Query per gli ordini del periodo precedente
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      status: completedStatus
    });
    
    // Calcola il fatturato per il periodo corrente
    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
    const currentOrderCount = currentOrders.length;
    
    // Calcola il fatturato per il periodo precedente
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const previousOrderCount = previousOrders.length;
    
    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          change: previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Errore durante il recupero dei dati di analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero dei dati di analytics' },
      { status: 500 }
    );
  }
} 