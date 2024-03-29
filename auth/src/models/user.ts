import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Password } from '../services/password';
import mongoose from 'mongoose';
import { UserRole, UserStatus } from '@movers/common';

export enum UserGender {
  Male = 'male',
  Female = 'female',
}

export interface UserEps {
  id: string;
  name: string;
}
/*
 *   Interface that describes the properties
 *   that are required to create a new User
 */
export interface UserAttrs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mainTransportationMethod?: string;
  secondaryTransportationMethod?: string;
  city?: string;
  country?: string;
  client?: string;
  office?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  photo?: string;
  activationCode: number;
  status: UserStatus;
  role: UserRole;
  points?: number;
  weight?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  gender?: UserGender;
  eps?: UserEps;
}

/*
 *   Interface that describes the properties
 *   that an User Document has
 */
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mainTransportationMethod?: string;
  secondaryTransportationMethod?: string;
  city?: string;
  country?: string;
  client?: string;
  office?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  photo?: string;
  activationCode: number;
  status: UserStatus;
  role: UserRole;
  version: number;
  points?: number;
  weight?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  gender?: UserGender;
  eps?: UserEps;
  deletedAt?: Date | null;
}

/*
 *   Interface that describes the properties
 *   that an User Model has
 */
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  generateActivationCode(): number;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    client: {
      type: String,
      required: false,
    },
    office: {
      type: String,
      required: false,
    },
    mainTransportationMethod: {
      type: String,
      required: false,
    },
    secondaryTransportationMethod: {
      type: String,
      required: false,
    },
    documentType: {
      type: String,
      required: false,
    },
    documentNumber: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    photo: {
      type: String,
      required: false,
    },
    activationCode: {
      type: Number,
      required: true,
    },
    termsDate: {
      type: mongoose.Schema.Types.Date,
      default: Date.now(),
    },
    comodatoDate: {
      type: mongoose.Schema.Types.Date,
      default: Date.now(),
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(UserStatus),
      default: UserStatus.Unverified,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.User,
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
    points: {
      type: Number,
      required: false,
      default: 0,
    },
    deletedAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
      default: null,
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

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
userSchema.statics.generateActivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
userSchema.virtual('primaryTransport', {
  ref: 'TransportMethod',
  localField: 'mainTransportationMethod',
  foreignField: 'name',
  justOne: true,
});
userSchema.virtual('secondaryTransport', {
  ref: 'TransportMethod',
  localField: 'secondaryTransportationMethod',
  foreignField: 'name',
  justOne: true,
});
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
