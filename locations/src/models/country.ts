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
      virtuals: true,
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

// Add virtuals to populate cities of the country
countrySchema.virtual('cities', {
  ref: 'City', // Reference the City Model
  localField: 'name', // Name of the field in Country to map the one in City
  foreignField: 'country', // Name of the field in City to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
const Country = mongoose.model<CountryDoc, CountryModel>(
  'Country',
  countrySchema
);

export { Country };
