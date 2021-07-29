import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
/*
 *   Interface that describes the properties
 *   that are required to create a new Resource
 */
interface ResourceAttrs {
  type: string;
  reference: string;
  qrCode: string;
  lockerPassword: number;
  client: string;
  office: string;
  loanTime: number;
}

/*
 *   Interface that describes the properties
 *   that a Resource has
 */
interface ResourceDoc extends mongoose.Document {
  type: string;
  reference: string;
  qrCode: string;
  lockerPassword: number;
  client: string;
  office: string;
  loanTime: number;
}

/*
 *   Interface that describes the properties
 *   that a Resource Model has
 */
interface ResourceModel extends mongoose.Model<ResourceDoc> {
  build(attrs: ResourceAttrs): ResourceDoc;
}

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    lockerPassword: {
      type: Number,
      required: true,
    },
    loanTime: {
      type: Number,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    office: {
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
        delete ret.__v;
      },
    },
  }
);
resourceSchema.set('versionKey', 'version');
resourceSchema.plugin(updateIfCurrentPlugin);
resourceSchema.statics.build = (attrs: ResourceAttrs) => {
  return new Resource(attrs);
};

const Resource = mongoose.model<ResourceDoc, ResourceModel>(
  'Resource',
  resourceSchema
);
// Add virtuals to populate documentTypes of ResourceType
resourceSchema.virtual('documents', {
  ref: 'Document',
  localField: 'reference',
  foreignField: 'resourceReference',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
export { Resource };
