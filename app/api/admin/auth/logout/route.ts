import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Crea la risposta
    const response = NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo',
    });
    
    // Rimuovi il cookie del token JWT
    response.cookies.delete('admin_token');
    
    return response;
  } catch (error: any) {
    console.error('Errore durante il logout:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il logout' },
      { status: 500 }
    );
  }
} 