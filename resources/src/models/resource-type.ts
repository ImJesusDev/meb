import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { ComponentDoc } from './component';
/*
 *   Interface that describes the properties
 *   that are required to create a new ResourceType
 */
interface ResourceTypeAttrs {
  type: string;
  resourceTypeBrand: string;
  resourceTypeModel: string;
  checkupTime: number;
  photo: string;
  measureIndicators: boolean;
}

/*
 *   Interface that describes the properties
 *   that a ResourceType Document has
 */
interface ResourceTypeDoc extends mongoose.Document {
  type: string;
  resourceTypeBrand: string;
  resourceTypeModel: string;
  checkupTime: number;
  measureIndicators: boolean;
  photo: string;
  components?: ComponentDoc[];
}

/*
 *   Interface that describes the properties
 *   that a ResourceType Model has
 */
interface ResourceTypeModel extends mongoose.Model<ResourceTypeDoc> {
  build(attrs: ResourceTypeAttrs): ResourceTypeDoc;
}

const resourceTypeSchema = new mongoose.Schema(
  {
    resourceTypeBrand: {
      type: String,
      required: true,
    },
    resourceTypeModel: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    checkupTime: {
      type: Number,
      required: true,
    },
    measureIndicators: {
      type: Boolean,
      required: true,
    },
    photo: {
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

resourceTypeSchema.set('versionKey', 'version');
resourceTypeSchema.plugin(updateIfCurrentPlugin);
resourceTypeSchema.statics.build = (attrs: ResourceTypeAttrs) => {
  return new ResourceType(attrs);
};
// Add virtuals to populate components of ResourceType
resourceTypeSchema.virtual('components', {
  ref: 'Component', // Reference the Component Model
  localField: 'type', // Name of the field in ResourceType to map the one in Component
  foreignField: 'resourceType', // Name of the field in Component to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate documentTypes of ResourceType
resourceTypeSchema.virtual('documentTypes', {
  ref: 'DocumentType', // Reference the DocumentType Model
  localField: 'type', // Name of the field in ResourceType to map the one in DocumentType
  foreignField: 'resourceType', // Name of the field in DocumentType to map the localField
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
const ResourceType = mongoose.model<ResourceTypeDoc, ResourceTypeModel>(
  'ResourceType',
  resourceTypeSchema
);

export { ResourceType };
