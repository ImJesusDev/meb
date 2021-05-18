import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new City
 */
interface CityAttrs {
  name: string;
  slug: string;
  country: string;
}

/*
 *   Interface that describes the properties
 *   that a City Document has
 */
interface CityDoc extends mongoose.Document {
  name: string;
  slug: string;
  country: string;
}

/*
 *   Interface that describes the properties
 *   that a City Model has
 */
interface CityModel extends mongoose.Model<CityDoc> {
  build(attrs: CityAttrs): CityDoc;
}

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
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

citySchema.set('versionKey', 'version');
citySchema.plugin(updateIfCurrentPlugin);
citySchema.statics.build = (attrs: CityAttrs) => {
  return new City(attrs);
};

const City = mongoose.model<CityDoc, CityModel>('City', citySchema);

export { City };
