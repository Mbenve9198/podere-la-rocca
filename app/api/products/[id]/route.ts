import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const productId = params.id;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID prodotto non fornito' },
        { status: 400 }
      );
    }
    
    // Trova il prodotto nel database
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Prodotto non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero del prodotto:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero del prodotto' },
      { status: 500 }
    );
  }
} 