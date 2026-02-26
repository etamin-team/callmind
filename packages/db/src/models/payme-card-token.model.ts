import mongoose, { Document, Schema } from "mongoose";

export interface IPaymeCardToken extends Document {
  userId: string;
  token: string;
  cardNumber: string;
  cardExpire: string;
  verify: boolean;
  recurrent: boolean;
  isDefault: boolean;
  createdAt: Date;
}

const paymeCardTokenSchema = new Schema<IPaymeCardToken>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cardExpire: {
      type: String,
      required: true,
    },
    verify: {
      type: Boolean,
      default: false,
      required: true,
    },
    recurrent: {
      type: Boolean,
      default: false,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

paymeCardTokenSchema.index({ userId: 1, isDefault: 1 });

export const PaymeCardTokenModel = mongoose.model<IPaymeCardToken>(
  "PaymeCardToken",
  paymeCardTokenSchema,
);
