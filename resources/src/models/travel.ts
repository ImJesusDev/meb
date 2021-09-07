import { TravelIndicators, TravelStatus, Location } from '@movers/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
/*
 *   Interface that describes the properties
 *   that are required to create a new Travel
 */
interface TravelAttrs {
  id: string;
  origin: string;
  destination: string;
  originPoint?: Location;
  destinationPoint?: Location;
  resourceRef: string;
  reservationId: string;
  userId: string;
  indicators?: TravelIndicators;
  tracking?: [];
  status: TravelStatus;
}

/*
 *   Interface that describes the properties
 *   that a Travel Model has
 */
interface TravelModel extends mongoose.Model<TravelDoc> {
  build(attrs: TravelAttrs): TravelDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TravelDoc | null>;
}

/*
 *   Interface that describes the properties
 *   that a Travel Document has
 */
interface TravelDoc extends mongoose.Document {
  origin: string;
  destination: string;
  originPoint?: Location;
  destinationPoint?: Location;
  resourceRef: string;
  reservationId: string;
  userId: string;
  indicators?: TravelIndicators;
  tracking?: [];
  status: TravelStatus;
  version: number;
}

const userSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: true,
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
    originPoint: {
      longitude: { type: Number, required: false },
      latitude: { type: Number, required: false },
    },
    destinationPoint: {
      longitude: { type: Number, required: false },
      latitude: { type: Number, required: false },
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
      default: new Date(),
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
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
userSchema.statics.build = (attrs: TravelAttrs) => {
  return new Travel({
    _id: attrs.id,
    origin: attrs.origin,
    destination: attrs.destination,
    resourceRef: attrs.resourceRef,
    reservationId: attrs.reservationId,
    userId: attrs.userId,
    indicators: attrs.indicators,
    tracking: attrs.tracking,
    status: attrs.status,
  });
};
userSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Travel.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Travel = mongoose.model<TravelDoc, TravelModel>('Travel', userSchema);

export { Travel };
