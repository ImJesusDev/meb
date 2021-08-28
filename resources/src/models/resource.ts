import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { ResourceStatus } from '@movers/common';

/*
 *   Interface that describes the properties
 *   that are required to create a new Resource
 */
export interface ResourceAttrs {
  type: string;
  reference: string;
  qrCode: string;
  lockerPassword: number;
  client: string;
  office: string;
  loanTime: number;
  status: ResourceStatus;
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
  status: ResourceStatus;
  version: number;
  kmSinceMaintenance: number;
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
    status: {
      type: String,
      required: true,
      enum: Object.values(ResourceStatus),
      default: ResourceStatus.Available,
    },
    office: {
      type: String,
      required: true,
    },
    kmSinceMaintenance: {
      type: Number,
      required: false,
      default: 0,
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
// Add virtuals to populate documents
resourceSchema.virtual('documents', {
  ref: 'Document',
  localField: 'reference',
  foreignField: 'resourceReference',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate checkups
resourceSchema.virtual('checkups', {
  ref: 'Checkup',
  localField: 'reference',
  foreignField: 'resourceRef',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate maintenances
resourceSchema.virtual('maintenances', {
  ref: 'Maintenance',
  localField: 'reference',
  foreignField: 'resourceRef',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});
// Add virtuals to populate repairs
resourceSchema.virtual('repairs', {
  ref: 'Repair',
  localField: 'reference',
  foreignField: 'resourceRef',
  justOne: false, // Set to false to return many
  options: { sort: { name: -1 } },
});

export { Resource };
