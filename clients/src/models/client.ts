import mongoose from 'mongoose';

interface ClientAttrs {
  name: string;
  nit: string;
  logo: string;
  mebAdmin: string;
  superAdminClient: string;
}

interface ClientDoc extends mongoose.Document {
  name: string;
  nit: string;
  logo: string;
  mebAdmin: string;
  superAdminClient: string;
}
interface ClientModel extends mongoose.Model<ClientDoc> {
  build(attrs: ClientAttrs): ClientDoc;
}

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nit: {
      type: String,
      required: true,
    },
    logo: {
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
    superAdminClient: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.mebAdmin;
        delete ret.superAdminClient;
      },
    },
  }
);

clientSchema.statics.build = (attrs: ClientAttrs) => {
  return new Client(attrs);
};
clientSchema.virtual('meb_admin', {
  ref: 'User',
  localField: 'mebAdmin',
  foreignField: '_id',
  justOne: true,
});
clientSchema.virtual('super_admin_client', {
  ref: 'User',
  localField: 'superAdminClient',
  foreignField: '_id',
  justOne: true,
});
// Add virtuals to populate offices of the client
clientSchema.virtual('offices', {
  ref: 'Office', // Reference the Office Model
  localField: 'name', // Name of the field in Client to map the one in Office
  foreignField: 'client', // Name of the field in Office to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});

const Client = mongoose.model<ClientDoc, ClientModel>('Client', clientSchema);

export { Client };
