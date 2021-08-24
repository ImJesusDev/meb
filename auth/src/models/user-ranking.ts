import mongoose from 'mongoose';

export interface UserRankingAttrs {
  userId: string;
  points: number;
  resourceType: string;
}

interface UserRankingDoc extends mongoose.Document {
  userId: string;
  points: number;
  resourceType: string;
}

interface UserRankingModel extends mongoose.Model<UserRankingDoc> {
  build(attrs: UserRankingAttrs): UserRankingDoc;
}

const userRankingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    points: {
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

userRankingSchema.statics.build = (attrs: UserRankingAttrs) => {
  return new UserRanking(attrs);
};

const UserRanking = mongoose.model<UserRankingDoc, UserRankingModel>(
  'UserRanking',
  userRankingSchema
);

export { UserRanking };
