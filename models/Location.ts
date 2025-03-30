import mongoose, { Document, Schema } from 'mongoose';
import { ITranslation } from './Category';

export interface ILocation extends Document {
  type: 'camera' | 'piscina' | 'giardino';
  name: string;
  translations: ITranslation;
  available: boolean;
  order: number;
}

const LocationSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      required: [true, 'Il tipo di posizione è obbligatorio'],
      enum: ['camera', 'piscina', 'giardino'],
    },
    name: {
      type: String,
      required: [true, 'Il nome della posizione è obbligatorio'],
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
    available: {
      type: Boolean,
      default: true,
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

const Location = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location; 