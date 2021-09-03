import mongoose from 'mongoose';

export interface UserIndicatorsAttrs {
  userId: string;
  energyFootprint: number;
  environmentalFootprint: number;
  economicFootprint: number;
  calories: number;
  km: number;
  resourceType: string;
  createdAt: Date;
}

interface UserIndicatorsDoc extends mongoose.Document {
  userId: string;
  energyFootprint: number;
  environmentalFootprint: number;
  economicFootprint: number;
  calories: number;
  km: number;
  resourceType: string;
  createdAt: Date;
}

interface UserIndicatorsModel extends mongoose.Model<UserIndicatorsDoc> {
  build(attrs: UserIndicatorsAttrs): UserIndicatorsDoc;
}

const userIndicatorsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    energyFootprint: {
      type: Number,
      required: true,
    },
    environmentalFootprint: {
      type: Number,
      required: true,
    },
    economicFootprint: {
      type: Number,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    km: {
      type: Number,
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

userIndicatorsSchema.statics.build = (attrs: UserIndicatorsAttrs) => {
  return new UserIndicators(attrs);
};

const UserIndicators = mongoose.model<UserIndicatorsDoc, UserIndicatorsModel>(
  'UserIndicators',
  userIndicatorsSchema
);

export { UserIndicators };
