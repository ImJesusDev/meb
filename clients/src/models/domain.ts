import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Authorized domain
 */

interface DomainAttrs {
  id: string;
  domain: string;
  client: string;
  active: boolean;
}

/*
 *   Interface that describes the properties
 *   that a Domain Document has
 */
interface DomainDoc extends mongoose.Document {
  domain: string;
  client: string;
  active: boolean;
  version: number;
}

/*
 *   Interface that describes the properties
 *   that a Domain Model has
 */

interface DomainModel extends mongoose.Model<DomainDoc> {
  build(attrs: DomainAttrs): DomainDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<DomainDoc | null>;
}

const domainSchema = new mongoose.Schema({
  domain: {
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
    default: Date.now(),
  },
});

domainSchema.set('versionKey', 'version');
domainSchema.plugin(updateIfCurrentPlugin);

domainSchema.statics.build = (attrs: DomainAttrs) => {
  return new Domain({
    _id: attrs.id,
    domain: attrs.domain,
    client: attrs.client,
    active: attrs.active,
  });
};

domainSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Domain.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Domain = mongoose.model<DomainDoc, DomainModel>('Domain', domainSchema);

export { Domain };
