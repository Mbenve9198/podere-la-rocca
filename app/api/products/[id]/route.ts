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

export async function PUT(
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
    
    // Recupera i dati dalla richiesta
    const data = await req.json();
    
    // Trova e aggiorna il prodotto nel database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Prodotto non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento del prodotto:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento del prodotto' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    
    // Recupera i dati dalla richiesta
    const data = await req.json();
    
    // Trova e aggiorna parzialmente il prodotto nel database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Prodotto non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento parziale del prodotto:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento parziale del prodotto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Trova ed elimina il prodotto nel database
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Prodotto non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Prodotto eliminato con successo',
    });
  } catch (error: any) {
    console.error('Errore durante l\'eliminazione del prodotto:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'eliminazione del prodotto' },
      { status: 500 }
    );
  }
} 