import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Geometry
 */
interface GeometryAttrs {
  name: string;
  city: string;
  points: { lat: number; lng: number }[];
}

/*
 *   Interface that describes the properties
 *   that a Geometry Document has
 */
interface GeometryDoc extends mongoose.Document {
  name: string;
  city: string;
  points: { lat: number; lng: number }[];
}

/*
 *   Interface that describes the properties
 *   that a Geometry Model has
 */
interface GeometryModel extends mongoose.Model<GeometryDoc> {
  build(attrs: GeometryAttrs): GeometryDoc;
}

const geometrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    points: [
      {
        lat: Number,
        lng: Number,
      },
    ],
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

geometrySchema.set('versionKey', 'version');
geometrySchema.plugin(updateIfCurrentPlugin);
geometrySchema.statics.build = (attrs: GeometryAttrs) => {
  return new Geometry(attrs);
};

const Geometry = mongoose.model<GeometryDoc, GeometryModel>(
  'Geometry',
  geometrySchema
);

export { Geometry };
