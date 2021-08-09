import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new DocumentType
 */
export interface DocumentTypeAttrs {
  name: string;
  resourceType: string;
  disables: boolean;
  requiresPhoto: boolean;
  expires: boolean;
}

/*
 *   Interface that describes the properties
 *   that a DocumentType Document has
 */
interface DocumentTypeDoc extends mongoose.Document {
  name: string;
  resourceType: string;
  disables: boolean;
  requiresPhoto: boolean;
  expires: boolean;
}

/*
 *   Interface that describes the properties
 *   that a DocumentType Model has
 */
interface DocumentTypeModel extends mongoose.Model<DocumentTypeDoc> {
  build(attrs: DocumentTypeAttrs): DocumentTypeDoc;
}

const documentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    disables: {
      type: Boolean,
      required: true,
    },
    expires: {
      type: Boolean,
      required: true,
    },
    requiresPhoto: {
      type: Boolean,
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

documentTypeSchema.set('versionKey', 'version');
documentTypeSchema.plugin(updateIfCurrentPlugin);
documentTypeSchema.statics.build = (attrs: DocumentTypeAttrs) => {
  return new DocumentType(attrs);
};

const DocumentType = mongoose.model<DocumentTypeDoc, DocumentTypeModel>(
  'DocumentType',
  documentTypeSchema
);

export { DocumentType };
