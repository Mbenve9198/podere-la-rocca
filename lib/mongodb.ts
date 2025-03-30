import mongoose from 'mongoose';

// Recupera l'URI di connessione dalle variabili d'ambiente
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Definisci la variabile d\'ambiente MONGODB_URI');
}

// Opzioni per la connessione MongoDB
const options = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000, // Timeout di selezione del server
  connectTimeoutMS: 10000,        // Timeout di connessione
  socketTimeoutMS: 45000,         // Timeout socket
};

// Interfaccia per la cache di connessione
interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Singleton per la connessione MongoDB
class MongoConnection {
  private static instance: MongoConnection;
  private _cache: ConnectionCache = {
    conn: null,
    promise: null,
  };

  private constructor() {}

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  // Metodo per connettersi al database
  public async connect(): Promise<typeof mongoose> {
    console.log('[MongoDB] Tentativo di connessione al database...');
    console.log(`[MongoDB] URI (mascherato): ${MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@')}`);
    
    if (this._cache.conn) {
      console.log('[MongoDB] Riutilizzo connessione esistente');
      return this._cache.conn;
    }

    if (!this._cache.promise) {
      console.log('[MongoDB] Creazione nuova connessione');
      this._cache.promise = mongoose.connect(MONGODB_URI, options)
        .then((mongoose) => {
          console.log('[MongoDB] Connessione a MongoDB stabilita con successo');
          return mongoose;
        });
    } else {
      console.log('[MongoDB] Utilizzo promise esistente');
    }

    try {
      console.log('[MongoDB] Attesa completamento connessione...');
      this._cache.conn = await this._cache.promise;
      console.log('[MongoDB] Connessione completata');
    } catch (e) {
      this._cache.promise = null;
      console.error('[MongoDB] ERRORE di connessione a MongoDB:', e);
      throw e;
    }

    return this._cache.conn;
  }
}

// Funzione di connessione al database
async function dbConnect(): Promise<typeof mongoose> {
  const mongoConnection = MongoConnection.getInstance();
  return mongoConnection.connect();
}

export default dbConnect; 