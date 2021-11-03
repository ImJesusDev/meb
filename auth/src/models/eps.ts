import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new EPS
 */

interface EpsAttrs {
  name: string;
}

/*
 *   Interface that describes the properties
 *   that a Eps Document has
 */
interface EpsDoc extends mongoose.Document {
  name: string;
}

/*
 *   Interface that describes the properties
 *   that a Eps Model has
 */

interface EpsModel extends mongoose.Model<EpsDoc> {
  build(attrs: EpsAttrs): EpsDoc;
}

const epsSchema = new mongoose.Schema(
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

epsSchema.set('versionKey', 'version');
epsSchema.plugin(updateIfCurrentPlugin);

epsSchema.statics.build = (attrs: EpsAttrs) => {
  return new Eps(attrs);
};

const Eps = mongoose.model<EpsDoc, EpsModel>('Eps', epsSchema);

export { Eps };
