import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { ResourceStatus } from '@movers/common';

/*
 *   Interface that describes the properties
 *   that are required to create a new Resource
 */
interface ResourceAttrs {
  id: string;
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
}

/*
 *   Interface that describes the properties
 *   that a Resource Model has
 */
interface ResourceModel extends mongoose.Model<ResourceDoc> {
  build(attrs: ResourceAttrs): ResourceDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ResourceDoc | null>;
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
  return new Resource({
    _id: attrs.id,
    type: attrs.type,
    reference: attrs.reference,
    qrCode: attrs.qrCode,
    lockerPassword: attrs.lockerPassword,
    client: attrs.client,
    office: attrs.office,
    loanTime: attrs.loanTime,
    status: attrs.status,
  });
};
resourceSchema.statics.findByEvent = (event: {
  id: string;
  version: number;
}) => {
  return Resource.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
const Resource = mongoose.model<ResourceDoc, ResourceModel>(
  'Resource',
  resourceSchema
);

export { Resource };
