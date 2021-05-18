import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Country
 */
interface CountryAttrs {
  name: string;
  slug: string;
}

/*
 *   Interface that describes the properties
 *   that a Country Document has
 */
interface CountryDoc extends mongoose.Document {
  name: string;
  slug: string;
}

/*
 *   Interface that describes the properties
 *   that a Country Model has
 */
interface CountryModel extends mongoose.Model<CountryDoc> {
  build(attrs: CountryAttrs): CountryDoc;
}

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
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

countrySchema.set('versionKey', 'version');
countrySchema.plugin(updateIfCurrentPlugin);
countrySchema.statics.build = (attrs: CountryAttrs) => {
  return new Country(attrs);
};

const Country = mongoose.model<CountryDoc, CountryModel>(
  'Country',
  countrySchema
);

export { Country };
