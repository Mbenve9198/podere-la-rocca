import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Crea una risposta con un messaggio di successo
    const response = NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo',
    });
    
    // Rimuovi il cookie impostandolo a una stringa vuota e con un max-age di 0
    response.cookies.set({
      name: 'admin_token',
      value: '',
      httpOnly: true,
      maxAge: 0, // Scadrà immediatamente
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error: any) {
    console.error('Errore durante il logout:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore durante il logout' 
      },
      { status: 500 }
    );
  }
} 