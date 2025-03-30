import mongoose, { Document, Schema } from 'mongoose';

export interface ITranslation {
  it: string;
  en: string;
}

export interface ICategory extends Document {
  name: string;
  translations: ITranslation;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Il nome della categoria è obbligatorio'],
      trim: true,
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
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Verifica se il modello esiste già per evitare errori
const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category; 