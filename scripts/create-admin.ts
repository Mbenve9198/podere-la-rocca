/**
 * Script per creare un utente admin
 * 
 * Uso: npx tsx scripts/create-admin.ts username password nome "ruolo"
 * Esempio: npx tsx scripts/create-admin.ts admin password123 "Admin" "admin"
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin';

// Carica le variabili d'ambiente
dotenv.config({ path: '.env.local' });

async function createAdmin() {
  // Ottieni gli argomenti dalla command line
  const [, , username, password, name, role = 'admin'] = process.argv;

  // Verifica che siano stati forniti tutti gli argomenti necessari
  if (!username || !password || !name) {
    console.error('Uso: npx tsx scripts/create-admin.ts username password "nome" "ruolo"');
    process.exit(1);
  }

  // Verifica il ruolo
  if (role !== 'admin' && role !== 'super-admin') {
    console.error('Il ruolo deve essere "admin" o "super-admin"');
    process.exit(1);
  }

  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connesso al database');

    // Verifica se l'admin esiste già
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      console.error(`L'admin con username ${username} esiste già`);
      process.exit(1);
    }

    // Crea il nuovo admin
    const admin = new Admin({
      username: username.toLowerCase(),
      password,
      name,
      role,
    });

    // Salva l'admin nel database
    await admin.save();
    console.log(`Admin ${username} creato con successo!`);
  } catch (error) {
    console.error('Errore durante la creazione dell\'admin:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.disconnect();
    console.log('Disconnesso dal database');
  }
}

// Esegui la funzione
createAdmin(); 