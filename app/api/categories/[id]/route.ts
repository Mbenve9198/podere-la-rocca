import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const categoryId = params.id;
    
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID categoria non fornito' },
        { status: 400 }
      );
    }
    
    // Trova la categoria nel database
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Categoria non trovata' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error('Errore durante il recupero della categoria:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il recupero della categoria' },
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
    
    const categoryId = params.id;
    
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID categoria non fornito' },
        { status: 400 }
      );
    }
    
    // Recupera i dati dalla richiesta
    const data = await req.json();
    
    // Trova e aggiorna la categoria nel database
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, message: 'Categoria non trovata' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento della categoria:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento della categoria' },
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
    
    const categoryId = params.id;
    
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID categoria non fornito' },
        { status: 400 }
      );
    }
    
    // Trova ed elimina la categoria nel database
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, message: 'Categoria non trovata' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Categoria eliminata con successo',
    });
  } catch (error: any) {
    console.error('Errore durante l\'eliminazione della categoria:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'eliminazione della categoria' },
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
    
    const categoryId = params.id;
    
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID categoria non fornito' },
        { status: 400 }
      );
    }
    
    // Recupera i dati dalla richiesta
    const body = await req.json();
    
    // Trova e aggiorna la categoria nel database
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          order_deadline: body.order_deadline,
          available_days: body.available_days,
        },
      },
      { new: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, message: 'Categoria non trovata' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error('Errore durante l\'aggiornamento della categoria:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'aggiornamento della categoria' },
      { status: 500 }
    );
  }
} 