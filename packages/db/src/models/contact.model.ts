import mongoose, { Document, Schema } from "mongoose";
import { Contact } from "@repo/types";

export interface IContact extends Omit<Contact, "id">, Document {}

const contactSchema = new Schema<IContact>(
  {
    agentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orgId: { type: String, index: true },

    // Contact Details
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },

    // Status & Tags
    status: {
      type: String,
      enum: ["hot-lead", "potential", "customer", "cold", "inactive"],
      default: "potential",
    },
    tags: [{ type: String }],

    // Notes
    notes: { type: String },

    // Call Statistics
    totalCalls: { type: Number, default: 0 },
    lastCallAt: { type: Date },
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

// Index for efficient queries
contactSchema.index({ agentId: 1, createdAt: -1 });
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ orgId: 1, createdAt: -1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ status: 1 });

export const ContactModel = mongoose.model<IContact>("Contact", contactSchema);
