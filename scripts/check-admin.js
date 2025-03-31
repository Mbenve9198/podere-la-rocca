// Script per verificare l'esistenza dell'utente amministratore

// Carica le variabili d'ambiente da .env.local
const dotenv = require('dotenv');
const path = require('path');

// Percorso assoluto al file .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Caricamento variabili d'ambiente da: ${envPath}`);
dotenv.config({ path: envPath });

console.log('Variabili d\'ambiente caricate:');
console.log(`MONGODB_URI esistente: ${process.env.MONGODB_URI ? 'Sì' : 'No'}`);

const mongoose = require('mongoose');

// Configurazione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/podere-la-rocca';

// Schema Admin (semplificato, solo per la query)
const AdminSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    role: String,
  }
);

// Registra il modello Admin
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function checkAdmin() {
  try {
    console.log('Connessione al database MongoDB...');
    console.log(`URI: ${MONGODB_URI.replace(/\/\/(.+?):(.+?)@/, '//****:****@')}`); // Nasconde le credenziali
    await mongoose.connect(MONGODB_URI);
    console.log('Connessione al database stabilita');

    // Cerca l'admin nel database
    const admin = await Admin.findOne({ username: 'admin@podere-la-rocca.com' });

    if (admin) {
      console.log('Utente amministratore trovato:');
      console.log(`- Nome utente: ${admin.username}`);
      console.log(`- Nome: ${admin.name}`);
      console.log(`- Ruolo: ${admin.role}`);
      console.log(`- ID: ${admin._id}`);
      console.log(`- Data creazione: ${admin.createdAt}`);
    } else {
      console.log('Utente amministratore NON trovato nel database!');
    }

    // Mostra tutti gli admin presenti
    const allAdmins = await Admin.find({});
    console.log(`Numero totale di admin nel database: ${allAdmins.length}`);
    
    if (allAdmins.length > 0) {
      console.log('Lista di tutti gli admin:');
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.username} (${admin.name}) - ${admin.role}`);
      });
    }

    await mongoose.disconnect();
    console.log('Disconnessione dal database completata');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante la verifica dell\'utente amministratore:', error);
    process.exit(1);
  }
}

// Esegui lo script
checkAdmin(); 