import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  location: string;
  locationDetail: string | null;
  items: IOrderItem[];
  total: number;
  status: 'waiting' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      default: function() {
        // Genera un valore di default basato sul timestamp
        // Questo valore sarà sovrascritto dal pre-hook di salvataggio
        const today = new Date();
        const dateStr = 
          today.getFullYear().toString() +
          (today.getMonth() + 1).toString().padStart(2, '0') +
          today.getDate().toString().padStart(2, '0');
        return `${dateStr}TMP${Date.now().toString().slice(-6)}`;
      },
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Il nome del cliente è obbligatorio'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'La posizione è obbligatoria'],
      enum: ['camera', 'piscina', 'giardino'],
    },
    locationDetail: {
      type: String,
      default: null,
    },
    items: [
      {
        productId: {
          type: String, 
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['waiting', 'processing', 'completed', 'cancelled'],
      default: 'waiting',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generazione di un numero ordine univoco prima del salvataggio
OrderSchema.pre('save', async function (next) {
  try {
    console.log('Order pre-save hook: Generazione numero ordine');
    
    if (this.isNew) {
      // Formato: ANNO + MESE + GIORNO + contatore a 3 cifre
      const today = new Date();
      const dateString = 
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0');
      
      console.log(`Order pre-save hook: Data per numero ordine: ${dateString}`);
      
      try {
        // Verifica che il modello esista prima di fare la query
        if (!mongoose.models.Order) {
          console.log('Order pre-save hook: Modello Order non trovato, creazione numero ordine semplificato');
          // Se il modello non esiste ancora, crea un numero ordine con timestamp
          const timestamp = Date.now();
          this.orderNumber = `${dateString}${timestamp.toString().slice(-3)}`;
        } else {
          // Trova il numero più alto di ordine con la data di oggi
          console.log('Order pre-save hook: Ricerca ultimo ordine del giorno');
          const lastOrder = await mongoose.models.Order.findOne({
            orderNumber: new RegExp(`^${dateString}`)
          }, {}, { sort: { orderNumber: -1 } });
          
          let counter = 1;
          if (lastOrder && lastOrder.orderNumber) {
            console.log(`Order pre-save hook: Ultimo ordine trovato: ${lastOrder.orderNumber}`);
            const lastCounter = parseInt(lastOrder.orderNumber.substring(8));
            counter = isNaN(lastCounter) ? 1 : lastCounter + 1;
          } else {
            console.log('Order pre-save hook: Nessun ordine precedente trovato oggi');
          }
          
          this.orderNumber = dateString + counter.toString().padStart(3, '0');
        }
        
        console.log(`Order pre-save hook: Nuovo numero ordine generato: ${this.orderNumber}`);
      } catch (err) {
        console.error('Order pre-save hook: Errore durante la ricerca ordini:', err);
        // In caso di errore nel recupero degli ordini precedenti, genera un numero basato sul timestamp
        const timestamp = Date.now();
        this.orderNumber = `${dateString}${timestamp.toString().slice(-3)}`;
        console.log(`Order pre-save hook: Generato numero fallback: ${this.orderNumber}`);
      }
    } else {
      console.log('Order pre-save hook: Non è un nuovo ordine, salto la generazione del numero');
    }
    
    next();
  } catch (error) {
    console.error('Order pre-save hook: Errore generale:', error);
    // In caso di errore generico, passa comunque al salvataggio ma con un numero basato su timestamp
    if (this.isNew && !this.orderNumber) {
      const now = new Date();
      const timestamp = Date.now();
      const dateString = 
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
      this.orderNumber = `${dateString}ERR${timestamp.toString().slice(-3)}`;
      console.log(`Order pre-save hook: Generato numero di emergenza: ${this.orderNumber}`);
    }
    next();
  }
});

// Verifica se esiste già un modello Order per evitare il warning "model already exists"
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order; 