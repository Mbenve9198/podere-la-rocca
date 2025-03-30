import mongoose, { Document, Schema } from 'mongoose';
import { ITranslation } from './Category';

export interface IProductTranslation extends ITranslation {
  description?: {
    it?: string;
    en?: string;
  }
}

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  description?: string;
  image?: string;
  available: boolean;
  translations: IProductTranslation;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Il nome del prodotto è obbligatorio'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Il prezzo è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo'],
    },
    category: {
      type: String,
      required: [true, 'La categoria è obbligatoria'],
      ref: 'Category',
    },
    subcategory: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    available: {
      type: Boolean,
      default: true,
    },
    translations: {
      it: {
        type: String,
        required: [true, 'La traduzione italiana è obbligatoria'],
        trim: true,
      },
      en: {
        type: String,
        required: [true, 'La traduzione inglese è obbligatoria'],
        trim: true,
      },
      description: {
        it: {
          type: String,
          default: '',
        },
        en: {
          type: String,
          default: '',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product; 