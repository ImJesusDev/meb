import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Authorized email
 */

interface EmailAttrs {
  email: string;
  client: string;
  active: boolean;
}

/*
 *   Interface that describes the properties
 *   that a Email Document has
 */
interface EmailDoc extends mongoose.Document {
  email: string;
  client: string;
  active: boolean;
  version: number;
}

/*
 *   Interface that describes the properties
 *   that a Email Model has
 */

interface EmailModel extends mongoose.Model<EmailDoc> {
  build(attrs: EmailAttrs): EmailDoc;
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
  return new Email(attrs);
};

const Email = mongoose.model<EmailDoc, EmailModel>('Email', emailSchema);

export { Email };
