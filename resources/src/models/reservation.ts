import mongoose from 'mongoose';
import { ReservationStatus, TravelIndicators } from '@movers/common';
/*
 *   Interface that describes the properties
 *   that are required to create a new Reservation
 */
export interface ReservationAttrs {
  createdAt: Date;
  returnedAt?: Date;
  resourceRef: string;
  rating?: number;
  comments?: string;
  reply?: string;
  status: ReservationStatus;
  userId: string;
  typeRent?: number;
  indicators?: TravelIndicators;
}

/*
 *   Interface that describes the properties
 *   that a Reservation Document has
 */
interface ReservationDoc extends mongoose.Document {
  createdAt: Date;
  returnedAt: Date;
  resourceRef: string;
  rating?: number;
  comments?: string;
  reply?: string;
  status: ReservationStatus;
  userId: string;
  typeRent?: number;
  indicators?: TravelIndicators;
}

/*
 *   Interface that describes the properties
 *   that a Reservation Model has
 */
interface ReservationModel extends mongoose.Model<ReservationDoc> {
  build(attrs: ReservationAttrs): ReservationDoc;
}

const reservationSchema = new mongoose.Schema(
  {
    createdAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    returnedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    resourceRef: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      required: false,
    },
    indicators: {
      energyFootprint: { type: Number, required: false },
      environmentalFootprint: { type: Number, required: false },
      economicFootprint: { type: Number, required: false },
      calories: { type: Number, required: false },
      km: { type: Number, required: false },
    },
    reply: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: false,
    },
    typeRent: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.Active,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

reservationSchema.statics.build = (attrs: ReservationAttrs) => {
  return new Reservation(attrs);
};

const Reservation = mongoose.model<ReservationDoc, ReservationModel>(
  'Reservation',
  reservationSchema
);
// Add virtuals to populate
reservationSchema.virtual('travels', {
  ref: 'Travel',
  localField: '_id',
  foreignField: 'reservationId',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});

reservationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
reservationSchema.virtual('resource', {
  ref: 'Resource',
  localField: 'resourceRef',
  foreignField: 'reference',
  justOne: true,
});
export { Reservation };
