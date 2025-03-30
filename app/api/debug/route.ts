import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Inizio diagnostica database');
    await dbConnect();
    console.log('[DEBUG] Connessione al database riuscita');
    
    // Recupera informazioni sulla categoria specifica
    const targetCategoryId = '67e9424db092d6d1d2ff852c';
    
    // PARTE 1: Informazioni di base
    console.log('[DEBUG] Verifica conteggio documenti nelle collezioni');
    const categoriesCount = await Category.countDocuments({});
    const productsCount = await Product.countDocuments({});
    
    // PARTE 2: Verifica categoria specifica
    console.log(`[DEBUG] Ricerca categoria con ID: ${targetCategoryId}`);
    
    // Prova con ObjectId
    const objId = mongoose.Types.ObjectId.isValid(targetCategoryId) ? 
                  new mongoose.Types.ObjectId(targetCategoryId) : null;
                  
    let categoryWithObjectId = null;
    if (objId) {
      categoryWithObjectId = await Category.findById(objId).lean();
    }
    
    // Prova con stringa diretta
    const categoryWithString = await Category.findOne({ _id: targetCategoryId }).lean();
    
    // PARTE 3: Cerca tutti i prodotti che hanno la categoria specificata
    console.log('[DEBUG] Ricerca prodotti per la categoria specificata');
    
    // 1. Usando ObjectId
    let productsWithObjectId = [];
    if (objId) {
      productsWithObjectId = await Product.find({ category: objId }).lean();
    }
    
    // 2. Usando la stringa
    const productsWithString = await Product.find({ category: targetCategoryId }).lean();
    
    // 3. Cerca prodotti che potrebbero avere la categoria in un formato diverso
    const allProducts = await Product.find({}).lean();
    const productsContainingCategory = allProducts.filter(p => {
      if (!p.category) return false;
      const catStr = p.category.toString();
      return catStr.includes(targetCategoryId);
    });
    
    // PARTE 4: Mostra un esempio di prodotto per verificare la struttura
    const sampleProduct = allProducts.length > 0 ? allProducts[0] : null;
    
    // Raccolta dei risultati
    const result = {
      dbStats: {
        categoriesCount,
        productsCount
      },
      categoryCheck: {
        withObjectId: categoryWithObjectId,
        withString: categoryWithString
      },
      productsCheck: {
        withObjectId: productsWithObjectId.length,
        withString: productsWithString.length,
        containingCategory: productsContainingCategory.length,
        allProductCategories: allProducts.map(p => ({
          id: p._id,
          category: p.category ? p.category.toString() : null,
          type: p.category ? typeof p.category : null
        }))
      },
      sampleProduct: sampleProduct
    };
    
    return NextResponse.json({
      success: true,
      message: 'Debug completato',
      data: result
    });
  } catch (error: any) {
    console.error('[DEBUG] Errore durante la diagnostica:', error);
    return NextResponse.json({
      success: false,
      message: 'Errore durante la diagnostica',
      error: {
        name: error.name,
        message: error.message
      }
    }, { status: 500 });
  }
} 