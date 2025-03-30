import mongoose from 'mongoose';

// Recupera l'URI di connessione dalle variabili d'ambiente
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Assicurati di aver definito MONGODB_URI nelle variabili d\'ambiente');
}

let cachedConnection: typeof mongoose | null = null;

async function dbConnect(retries = 3): Promise<typeof mongoose> {
  if (cachedConnection) {
    console.log('MongoDB: Utilizzo connessione esistente');
    return cachedConnection;
  }

  console.log('MongoDB: Tentativo di connessione...');
  
  try {
    const opts = {
      bufferCommands: true,
    };

    const connection = await mongoose.connect(MONGODB_URI!, opts);
    console.log('MongoDB: Connessione stabilita con successo');
    
    cachedConnection = connection;
    return connection;
  } catch (error: any) {
    console.error(`MongoDB: Errore di connessione: ${error.message}`);
    
    if (retries > 0) {
      console.log(`MongoDB: Nuovo tentativo di connessione (rimasti ${retries} tentativi)...`);
      // Attesa esponenziale tra i tentativi
      const waitTime = Math.pow(2, 4 - retries) * 100;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return dbConnect(retries - 1);
    }
    
    console.error('MongoDB: Tutti i tentativi di connessione falliti');
    throw new Error(`Impossibile connettersi a MongoDB: ${error.message}`);
  }
}

export default dbConnect; 