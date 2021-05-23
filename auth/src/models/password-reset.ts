import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new User
 */
interface PasswordResetAttr {
  userId: string;
  code: string;
}

/*
 *   Interface that describes the properties
 *   that a User Document has
 */
interface PasswordResetDoc extends mongoose.Document {
  userId: string;
  code: string;
}

/*
 *   Interface that describes the properties
 *   that a User Model has
 */
interface PasswordResetModel extends mongoose.Model<PasswordResetDoc> {
  build(attrs: PasswordResetAttr): PasswordResetDoc;
  generateCode(): number;
}

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.statics.build = (attrs: PasswordResetAttr) => {
  return new PasswordReset(attrs);
};
userSchema.statics.generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const PasswordReset = mongoose.model<PasswordResetDoc, PasswordResetModel>(
  'PasswordReset',
  userSchema
);

export { PasswordReset };
