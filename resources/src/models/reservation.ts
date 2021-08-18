import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Reservation
 */
export interface ReservationAttrs {
  createdAt: Date;
  resourceRef: string;
  rating?: number;
  comments?: string;
}

/*
 *   Interface that describes the properties
 *   that a Reservation Document has
 */
interface ReservationDoc extends mongoose.Document {
  createdAt: Date;
  resourceRef: string;
  rating?: number;
  comments?: string;
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
    resourceRef: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: false,
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

export { Reservation };
