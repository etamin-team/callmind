import mongoose, { Document, Schema } from "mongoose";

export interface IPaymeTransaction extends Document {
  transactionId: string; // Payme's transaction ID
  merchantTransactionId: string; // Our transaction ID
  orderId: string; // Our order ID (userId_plan_type_timestamp)
  amount: number; // Amount in UZS
  state: number; // Payme transaction state (1=created, 2=performed, -1=cancelled, -2=cancelled after paid)
  createTime: Date;
  performTime?: Date;
  cancelTime?: Date;
  userId: string;
  plan: string;
  yearly: boolean;
  reason?: number; // Payme cancel reason (1-10)
  provider: string; // "PAYME"
}

const paymeTransactionSchema = new Schema<IPaymeTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
    },
    merchantTransactionId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    state: {
      type: Number,
      required: true,
      enum: [-2, -1, 1, 2], // -2=cancelled after paid, -1=cancelled before paid, 1=created, 2=performed
      default: 1,
    },
    createTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    performTime: {
      type: Date,
      required: false,
    },
    cancelTime: {
      type: Date,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["starter", "professional", "business"],
    },
    yearly: {
      type: Boolean,
      required: true,
    },
    reason: {
      type: Number,
      required: false,
    },
    provider: {
      type: String,
      required: true,
      default: "PAYME",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

paymeTransactionSchema.index({ transactionId: 1 }, { unique: true });
paymeTransactionSchema.index({ merchantTransactionId: 1 });
paymeTransactionSchema.index({ orderId: 1 });
paymeTransactionSchema.index({ userId: 1 });
paymeTransactionSchema.index({ state: 1 });

export const PaymeTransactionModel = mongoose.model<IPaymeTransaction>(
  "PaymeTransaction",
  paymeTransactionSchema,
);
