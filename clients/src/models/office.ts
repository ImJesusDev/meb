import mongoose from 'mongoose';

interface OfficeAttrs {
  name: string;
  country: string;
  city: string;
  client: string;
  mebAdmin: string;
  clientAdmin: string;
  location: { lat: number; lng: number };
}

interface OfficeDoc extends mongoose.Document {
  name: string;
  country: string;
  city: string;
  client: string;
  mebAdmin: string;
  clientAdmin: string;
  location: { lat: number; lng: number };
}
interface OfficeModel extends mongoose.Model<OfficeDoc> {
  build(attrs: OfficeAttrs): OfficeDoc;
}

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
      default: null,
    },
    mebAdmin: {
      type: String,
      required: true,
    },
    clientAdmin: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.mebAdmin;
        delete ret.clientAdmin;
      },
    },
  }
);

officeSchema.statics.build = (attrs: OfficeAttrs) => {
  return new Office(attrs);
};
officeSchema.virtual('meb_admin', {
  ref: 'User',
  localField: 'mebAdmin',
  foreignField: '_id',
  justOne: true,
});
officeSchema.virtual('client_admin', {
  ref: 'User',
  localField: 'clientAdmin',
  foreignField: '_id',
  justOne: true,
});

const Office = mongoose.model<OfficeDoc, OfficeModel>('Office', officeSchema);

export { Office };
