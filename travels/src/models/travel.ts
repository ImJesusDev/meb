import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { TravelStatus } from '@movers/common';

/*
 *   Interface that describes the properties
 *   that are required to create a new Travel
 */
export interface TravelAttrs {
  origin: string;
  destination: string;
  resourceRef: string;
  userId: string;
  indicators?: [];
  tracking?: [];
  status: TravelStatus;
}
/*
 *   Interface that describes the properties
 *   that an Travel Document has
 */
interface TravelDoc extends mongoose.Document {
  origin: string;
  destination: string;
  resourceRef: string;
  userId: string;
  indicators?: [];
  tracking?: [];
  status: TravelStatus;
  version: number;
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
    destination: {
      type: String,
      required: true,
    },
    resourceRef: {
      type: String,
      required: false,
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
      type: Array,
      required: false,
      default: [],
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
