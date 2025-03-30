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
  if (this.isNew) {
    // Formato: ANNO + MESE + GIORNO + contatore a 3 cifre
    const today = new Date();
    const dateString = 
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    
    // Trova il numero più alto di ordine con la data di oggi
    const lastOrder = await mongoose.models.Order.findOne({
      orderNumber: new RegExp(`^${dateString}`)
    }, {}, { sort: { orderNumber: -1 } });
    
    let counter = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastCounter = parseInt(lastOrder.orderNumber.substring(8));
      counter = isNaN(lastCounter) ? 1 : lastCounter + 1;
    }
    
    this.orderNumber = dateString + counter.toString().padStart(3, '0');
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order; 