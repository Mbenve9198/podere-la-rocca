import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Crea la risposta
    const response = NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo',
    });

    // Cancella il cookie di autenticazione
    response.cookies.delete({
      name: 'admin_token',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Errore durante il logout:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il logout' },
      { status: 500 }
    );
  }
} 