import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new EPS
 */

interface TransportMethodAttrs {
  name: string;
}

/*
 *   Interface that describes the properties
 *   that a TransportMethod Document has
 */
interface TransportMethodDoc extends mongoose.Document {
  name: string;
}

/*
 *   Interface that describes the properties
 *   that a TransportMethod Model has
 */

interface TransportMethodModel extends mongoose.Model<TransportMethodDoc> {
  build(attrs: TransportMethodAttrs): TransportMethodDoc;
}

const transportMethod = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: mongoose.Schema.Types.Date,
      default: Date.now(),
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

transportMethod.set('versionKey', 'version');
transportMethod.plugin(updateIfCurrentPlugin);

transportMethod.statics.build = (attrs: TransportMethodAttrs) => {
  return new TransportMethod(attrs);
};

const TransportMethod = mongoose.model<
  TransportMethodDoc,
  TransportMethodModel
>('TransportMethod', transportMethod);

export { TransportMethod };
