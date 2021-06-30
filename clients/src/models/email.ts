import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Authorized email
 */

interface EmailAttrs {
  id: string;
  email: string;
  client: string;
  office: string;
  active: boolean;
}

/*
 *   Interface that describes the properties
 *   that a Email Document has
 */
interface EmailDoc extends mongoose.Document {
  email: string;
  client: string;
  office: string;
  active: boolean;
  version: number;
}

/*
 *   Interface that describes the properties
 *   that a Email Model has
 */

interface EmailModel extends mongoose.Model<EmailDoc> {
  build(attrs: EmailAttrs): EmailDoc;
  findByEvent(event: { id: string; version: number }): Promise<EmailDoc | null>;
}

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
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
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: {
    type: mongoose.Schema.Types.Date,
    default: new Date(),
  },
});

emailSchema.set('versionKey', 'version');
emailSchema.plugin(updateIfCurrentPlugin);

emailSchema.statics.build = (attrs: EmailAttrs) => {
  return new Email({
    _id: attrs.id,
    email: attrs.email,
    client: attrs.client,
    office: attrs.office,
    active: attrs.active,
  });
};

emailSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Email.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Email = mongoose.model<EmailDoc, EmailModel>('Email', emailSchema);

export { Email };
