import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
/*
 *   Interface that describes the properties
 *   that are required to create a new User
 */
interface UserAttrs {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  client?: string;
  office?: string;
}

/*
 *   Interface that describes the properties
 *   that a User Model has
 */
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  findByEvent(event: { id: string; version: number }): Promise<UserDoc | null>;
}

/*
 *   Interface that describes the properties
 *   that a User Document has
 */
interface UserDoc extends mongoose.Document {
  email: string;
  version: number;
  firstName: string;
  lastName: string;
  client?: string;
  office?: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: false,
    },
    office: {
      type: String,
      required: false,
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
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User({
    _id: attrs.id,
    email: attrs.email,
    firstName: attrs.firstName,
    lastName: attrs.lastName,
    client: attrs.client,
    office: attrs.office,
  });
};
userSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return User.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
