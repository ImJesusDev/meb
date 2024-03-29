import mongoose from 'mongoose';

interface ClientAttrs {
  name: string;
  nit: string;
  logo: string;
  mebAdmin?: string;
  mebSuperAdmin?: string;
  superAdminClient?: string;
}

interface ClientDoc extends mongoose.Document {
  name: string;
  nit: string;
  logo: string;
  mebAdmin?: string;
  mebSuperAdmin?: string;
  superAdminClient?: string;
  deletedAt: Date | null;
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
      required: false,
    },
    mebSuperAdmin: {
      type: String,
      required: false,
    },
    superAdminClient: {
      type: String,
      required: false,
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
clientSchema.virtual('users', {
  ref: 'User',
  localField: 'name',
  foreignField: 'client',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate offices of the client
clientSchema.virtual('offices', {
  ref: 'Office', // Reference the Office Model
  localField: 'name', // Name of the field in Client to map the one in Office
  foreignField: 'client', // Name of the field in Office to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate domains of the client
clientSchema.virtual('domains', {
  ref: 'Domain', // Reference the Office Model
  localField: 'name', // Name of the field in Client to map the one in Office
  foreignField: 'client', // Name of the field in Office to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate email of the client
clientSchema.virtual('emails', {
  ref: 'Email', // Reference the Office Model
  localField: 'name', // Name of the field in Client to map the one in Office
  foreignField: 'client', // Name of the field in Office to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});

const Client = mongoose.model<ClientDoc, ClientModel>('Client', clientSchema);

export { Client };
