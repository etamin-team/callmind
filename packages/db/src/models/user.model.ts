import mongoose, { Document, Schema } from "mongoose";
import { User } from "@repo/types";

export interface IUser extends Omit<User, "id">, Document {}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
      required: false,
    },
    credits: {
      type: Number,
      default: 2,
      min: 0,
      required: false,
    },
    paddleCustomerId: {
      type: String,
      required: false,
    },
    paddleSubscriptionId: {
      type: String,
      required: false,
    },
    // Payme.uz fields
    paymeCustomerId: {
      type: String,
      required: false,
    },
    paymePhone: {
      type: String,
      required: false,
    },
    paymeCardToken: {
      type: String,
      required: false,
    },
    paymeCardRecurrent: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: String,
      required: false,
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

export const UserModel = mongoose.model<IUser>("User", userSchema);
