import { NextRequest, NextResponse } from "next/server"
import { deleteCookie } from "@/lib/cookies"

export async function POST(req: NextRequest) {
  try {
    // Elimina il cookie di autenticazione
    deleteCookie('admin_token')
    
    // Ritorna una risposta di successo
    return NextResponse.json({
      success: true,
      message: "Logout effettuato con successo"
    })
  } catch (error: any) {
    console.error("Errore durante il logout:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Si è verificato un errore durante il logout" 
      },
      { status: 500 }
    )
  }
} 