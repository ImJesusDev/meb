import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Document
 */
export interface DocumentAttrs {
  type: string;
  resourceReference: string;
  expeditionDate: Date;
  expirationDate?: Date;
}

/*
 *   Interface that describes the properties
 *   that a Document Document has
 */
interface DocumentDoc extends mongoose.Document {
  type: string;
  resourceReference: string;
  expeditionDate: Date;
  expirationDate?: Date;
}

/*
 *   Interface that describes the properties
 *   that a Document Model has
 */
interface DocumentModel extends mongoose.Model<DocumentDoc> {
  build(attrs: DocumentAttrs): DocumentDoc;
}

const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    resourceReference: {
      type: String,
      required: true,
    },
    expeditionDate: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    expirationDate: {
      type: mongoose.Schema.Types.Date,
      required: false,
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

DocumentSchema.set('versionKey', 'version');
DocumentSchema.plugin(updateIfCurrentPlugin);
DocumentSchema.statics.build = (attrs: DocumentAttrs) => {
  return new Document(attrs);
};

const Document = mongoose.model<DocumentDoc, DocumentModel>(
  'Document',
  DocumentSchema
);

export { Document };
