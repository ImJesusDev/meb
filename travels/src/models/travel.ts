import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { TravelStatus, TravelIndicators, Location } from '@movers/common';

/*
 *   Interface that describes the properties
 *   that are required to create a new Travel
 */
export interface TravelAttrs {
  origin: string;
  originPoint?: Location;
  destinationPoint?: Location;
  destination: string;
  resourceRef: string;
  reservationId: string;
  userId: string;
  indicators?: TravelIndicators;
  tracking?: [];
  createdAt: Date;
  status: TravelStatus;
}
/*
 *   Interface that describes the properties
 *   that an Travel Document has
 */
interface TravelDoc extends mongoose.Document {
  origin: string;
  originPoint?: Location;
  destinationPoint?: Location;
  destination: string;
  resourceRef: string;
  reservationId: string;
  userId: string;
  indicators: TravelIndicators;
  tracking?: [];
  status: TravelStatus;
  version: number;
  createdAt: Date;
  completedAt: Date;
}

/*
 *   Interface that describes the properties
 *   that an Travel Model has
 */
interface TravelModel extends mongoose.Model<TravelDoc> {
  build(attrs: TravelAttrs): TravelDoc;
}

const travelSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: true,
    },
    originPoint: {
      longitude: { type: Number, required: false },
      latitude: { type: Number, required: false },
    },
    destinationPoint: {
      longitude: { type: Number, required: false },
      latitude: { type: Number, required: false },
    },
    destination: {
      type: String,
      required: true,
    },
    resourceRef: {
      type: String,
      required: false,
    },
    reservationId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TravelStatus),
      default: TravelStatus.Pending,
    },
    indicators: {
      energyFootprint: { type: Number, required: false },
      environmentalFootprint: { type: Number, required: false },
      economicFootprint: { type: Number, required: false },
      calories: { type: Number, required: false },
      km: { type: Number, required: false },
    },
    tracking: {
      type: Array,
      required: false,
      default: [],
    },
    createdAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    completedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

travelSchema.set('versionKey', 'version');
travelSchema.plugin(updateIfCurrentPlugin);

travelSchema.statics.build = (attrs: TravelAttrs) => {
  return new Travel(attrs);
};

const Travel = mongoose.model<TravelDoc, TravelModel>('Travel', travelSchema);

export { Travel };
