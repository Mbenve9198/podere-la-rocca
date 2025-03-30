import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://marco:g3eBGj8oLSGg6yhF@podere-la-rocca.1qhm07p.mongodb.net/?retryWrites=true&w=majority&appName=podere-la-rocca';

if (!MONGODB_URI) {
  throw new Error('Definisci la variabile d\'ambiente MONGODB_URI');
}

/**
 * Variabile globale per mantenere lo stato della connessione tra richieste 
 * per migliorare le prestazioni
 */
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connessione a MongoDB stabilita con successo');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Errore di connessione a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 