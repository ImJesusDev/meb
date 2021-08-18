import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { RepairStatus, ComponentStatus } from '@movers/common';
/*
 *   Interface that describes the properties
 *   that are required to create a new Repair
 */
export interface RepairAttrs {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: ComponentRepairAttrs[];
  status: RepairStatus;
}
/*
 *   Interface that describes the properties
 *   that are required to create a new Repair
 */
export interface ComponentRepairAttrs {
  componentId: string;
  status?: ComponentStatus;
  componentName: string;
  photo?: string;
  comment?: string;
}
/*
 *   Interface that describes the properties
 *   that a Repair Document has
 */
interface RepairDoc extends mongoose.Document {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: [];
  status: RepairStatus;
}

/*
 *   Interface that describes the properties
 *   that a Repair Model has
 */
interface RepairModel extends mongoose.Model<RepairDoc> {
  build(attrs: RepairAttrs): RepairDoc;
}

const repairSchema = new mongoose.Schema(
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
    status: {
      type: String,
      required: true,
      enum: Object.values(RepairStatus),
      default: RepairStatus.Pending,
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
repairSchema.set('versionKey', 'version');
repairSchema.plugin(updateIfCurrentPlugin);
repairSchema.statics.build = (attrs: RepairAttrs) => {
  return new Repair(attrs);
};
// Add virtuals to populate checkups
checkupSchema.virtual('resource', {
  ref: 'Resource',
  localField: 'resourceRef',
  foreignField: 'reference',
  justOne: true,
});
const Repair = mongoose.model<RepairDoc, RepairModel>('Repair', repairSchema);

export { Repair };
