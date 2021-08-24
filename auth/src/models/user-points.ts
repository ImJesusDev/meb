import mongoose from 'mongoose';

export enum PointsType {
  ResourceRent = 'resource_rent',
  Distance = 'distance',
}

export interface UserPointsAttrs {
  userId: string;
  type: PointsType;
  points: number;
  createdAt: Date;
  reservationId: string;
  resourceType: string;
}

interface UserPointsDoc extends mongoose.Document {
  userId: string;
  type: PointsType;
  points: number;
  createdAt: Date;
  reservationId: string;
  resourceType: string;
}

interface UserPointsModel extends mongoose.Model<UserPointsDoc> {
  build(attrs: UserPointsAttrs): UserPointsDoc;
}

const userPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(PointsType),
    },
    points: {
      type: Number,
      required: true,
    },
    reservationId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    createdAt: {
      type: mongoose.Schema.Types.Date,
      default: new Date(),
      required: false,
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

userPointsSchema.statics.build = (attrs: UserPointsAttrs) => {
  return new UserPoints(attrs);
};

const UserPoints = mongoose.model<UserPointsDoc, UserPointsModel>(
  'UserPoints',
  userPointsSchema
);

export { UserPoints };
