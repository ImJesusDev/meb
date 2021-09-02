import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
/*
 *   Interface that describes the properties
 *   that are required to create a new Office
 */
interface OfficeAttrs {
  id: string;
  name: string;
  client: string;
  repairAdmin: string;
  inventoryAdmin: string;
  maintenanceAdmin: string;
}

/*
 *   Interface that describes the properties
 *   that a Office Model has
 */
interface OfficeModel extends mongoose.Model<OfficeDoc> {
  build(attrs: OfficeAttrs): OfficeDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<OfficeDoc | null>;
}

/*
 *   Interface that describes the properties
 *   that a Office Document has
 */
interface OfficeDoc extends mongoose.Document {
  version: number;
  name: string;
  client: string;
  repairAdmin: string;
  inventoryAdmin: string;
  maintenanceAdmin: string;
}

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    repairAdmin: {
      type: String,
      required: true,
    },
    inventoryAdmin: {
      type: String,
      required: true,
    },
    maintenanceAdmin: {
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
officeSchema.set('versionKey', 'version');
officeSchema.plugin(updateIfCurrentPlugin);
officeSchema.statics.build = (attrs: OfficeAttrs) => {
  return new Office({
    _id: attrs.id,
    name: attrs.name,
    client: attrs.client,
    repairAdmin: attrs.repairAdmin,
    maintenanceAdmin: attrs.maintenanceAdmin,
    inventoryAdmin: attrs.inventoryAdmin,
  });
};
officeSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Office.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Office = mongoose.model<OfficeDoc, OfficeModel>('Office', officeSchema);

export { Office };
