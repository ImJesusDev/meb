import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { CheckupStatus, ComponentStatus } from '@movers/common';
/*
 *   Interface that describes the properties
 *   that are required to create a new Checkup
 */
export interface CheckupAttrs {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: ComponentCheckupAttrs[];
  status: CheckupStatus;
  assignee: string;
}
/*
 *   Interface that describes the properties
 *   that are required to create a new Checkup
 */
export interface ComponentCheckupAttrs {
  componentId: string;
  status?: ComponentStatus;
  componentName: string;
  photo?: string;
  comment?: string;
}
/*
 *   Interface that describes the properties
 *   that a Checkup Document has
 */
interface CheckupDoc extends mongoose.Document {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: [];
  status: CheckupStatus;
  assignee: string;
}

/*
 *   Interface that describes the properties
 *   that a Checkup Model has
 */
interface CheckupModel extends mongoose.Model<CheckupDoc> {
  build(attrs: CheckupAttrs): CheckupDoc;
}

const checkupSchema = new mongoose.Schema(
  {
    createdAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    completedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    resourceRef: {
      type: String,
      required: true,
    },
    assignee: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CheckupStatus),
      default: CheckupStatus.Pending,
    },
    components: [
      {
        componentId: { type: String, required: true },
        status: { type: String, required: false },
        componentName: { type: String, required: true },
        photo: { type: String, required: false },
        comment: { type: String, required: false },
      },
    ],
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
checkupSchema.set('versionKey', 'version');
checkupSchema.plugin(updateIfCurrentPlugin);
checkupSchema.statics.build = (attrs: CheckupAttrs) => {
  return new Checkup(attrs);
};

// Add virtuals to populate checkups
checkupSchema.virtual('resource', {
  ref: 'Resource',
  localField: 'resourceRef',
  foreignField: 'reference',
  justOne: true,
});
checkupSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignee',
  foreignField: '_id',
  justOne: true,
});
const Checkup = mongoose.model<CheckupDoc, CheckupModel>(
  'Checkup',
  checkupSchema
);

export { Checkup };
