import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import { MaintenanceStatus, ComponentStatus } from '@movers/common';
/*
 *   Interface that describes the properties
 *   that are required to create a new Maintenance
 */
export interface MaintenanceAttrs {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: ComponentMaintenanceAttrs[];
  status: MaintenanceStatus;
  assignee: string;
}
/*
 *   Interface that describes the properties
 *   that are required to create a new Maintenance
 */
export interface ComponentMaintenanceAttrs {
  componentId: string;
  status?: ComponentStatus;
  componentName: string;
  photo?: string;
  comment?: string;
}
/*
 *   Interface that describes the properties
 *   that a Maintenance Document has
 */
interface MaintenanceDoc extends mongoose.Document {
  createdAt: Date;
  completedAt?: Date;
  resourceRef: string;
  components?: [];
  status: MaintenanceStatus;
  assignee: string;
}

/*
 *   Interface that describes the properties
 *   that a Maintenance Model has
 */
interface MaintenanceModel extends mongoose.Model<MaintenanceDoc> {
  build(attrs: MaintenanceAttrs): MaintenanceDoc;
}

const maintenanceSchema = new mongoose.Schema(
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
      enum: Object.values(MaintenanceStatus),
      default: MaintenanceStatus.Pending,
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
maintenanceSchema.set('versionKey', 'version');
maintenanceSchema.plugin(updateIfCurrentPlugin);
maintenanceSchema.statics.build = (attrs: MaintenanceAttrs) => {
  return new Maintenance(attrs);
};
// Add virtuals to populate checkups
maintenanceSchema.virtual('resource', {
  ref: 'Resource',
  localField: 'resourceRef',
  foreignField: 'reference',
  justOne: true,
});
maintenanceSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignee',
  foreignField: 'id',
  justOne: true,
});
const Maintenance = mongoose.model<MaintenanceDoc, MaintenanceModel>(
  'Maintenance',
  maintenanceSchema
);

export { Maintenance };
