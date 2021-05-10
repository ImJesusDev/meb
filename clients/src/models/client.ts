import mongoose, { mongo } from 'mongoose';

interface ClientAttrs {
  name: string;
  address: string;
  logo: string;
}

interface ClientDoc extends mongoose.Document {
  name: string;
  address: string;
  logo: string;
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
    address: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

clientSchema.statics.build = (attrs: ClientAttrs) => {
  return new Client(attrs);
};

const Client = mongoose.model<ClientDoc, ClientModel>('Client', clientSchema);

export { Client };
