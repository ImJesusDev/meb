import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserEps } from '@movers/common';

export enum UserGender {
  Male = 'male',
  Female = 'female',
}
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
  photo?: string;
  phone?: string;
  weight?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  gender?: UserGender;
  documentNumber?: string;
  eps?: UserEps;
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
  photo?: string;
  phone?: string;
  documentNumber?: string;
  weight?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  gender?: UserGender;
  eps?: UserEps;
  deletedAt?: Date | null;
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
    photo: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    documentNumber: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      enum: Object.values(UserGender),
    },
    emergencyContactName: {
      type: String,
      required: false,
    },
    bloodType: {
      type: String,
      required: false,
    },
    emergencyContactPhone: {
      type: String,
      required: false,
    },
    weight: {
      type: Number,
      required: false,
      default: 0,
    },
    eps: {
      id: { type: String, required: false },
      name: { type: String, required: false },
    },
    deletedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
      default: null,
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
    photo: attrs.photo,
    gender: attrs.gender,
    documentNumber: attrs.documentNumber,
    weight: attrs.weight,
    emergencyContactName: attrs.emergencyContactName,
    emergencyContactPhone: attrs.emergencyContactPhone,
    bloodType: attrs.bloodType,
    phone: attrs.phone,
    eps: attrs.eps,
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
