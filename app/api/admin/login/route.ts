import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/mongodb"
import Admin from "@/models/Admin"

// Chiave segreta per firmare i token JWT
const JWT_SECRET = process.env.JWT_SECRET || 'podere-la-rocca-secret-key'
// Durata del token in secondi (default: 7 giorni)
const TOKEN_EXPIRY = 60 * 60 * 24 * 7

export async function POST(req: NextRequest) {
  try {
    console.log('API: Ricevuta richiesta login admin')
    const { username, password } = await req.json()

    // Validazione dei dati
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Nome utente e password sono richiesti" },
        { status: 400 }
      )
    }

    // Connessione al database
    await dbConnect()

    // Trova l'admin con il nome utente fornito
    const admin = await Admin.findOne({ username: username.toLowerCase() })

    // Se l'admin non esiste o la password non corrisponde
    if (!admin || !(await admin.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: "Credenziali non valide" },
        { status: 401 }
      )
    }

    // Crea un token JWT
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    console.log('API: Token JWT creato con successo')

    // Creazione della risposta
    const response = NextResponse.json({
      success: true,
      message: "Login effettuato con successo",
      user: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    })

    // Imposta il cookie direttamente sulla risposta
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_EXPIRY,
      path: '/',
      sameSite: 'strict',
    })

    console.log('API: Cookie admin_token impostato')
    return response
  } catch (error: any) {
    console.error("Errore durante il login:", error)
    return NextResponse.json(
      { success: false, message: "Si è verificato un errore durante il login" },
      { status: 500 }
    )
  }
} 