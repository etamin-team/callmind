import mongoose, { Document, Schema } from "mongoose";
import { CallHistory } from "@repo/types";

export interface ICallHistory extends Omit<CallHistory, "id">, Document {}

const callHistorySchema = new Schema<ICallHistory>(
  {
    agentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orgId: { type: String, index: true },

    // Call Details
    callSid: { type: String, sparse: true, index: true }, // Unique call identifier
    direction: { type: String, required: true, enum: ["inbound", "outbound"] },
    callerNumber: { type: String },
    callerName: { type: String },
    duration: { type: Number, default: 0 }, // in seconds
    status: {
      type: String,
      required: true,
      enum: ["completed", "missed", "failed", "in-progress", "ringing"],
      default: "ringing",
    },

    // Recording
    recordingUrl: { type: String },
    transcript: { type: String },

    // Analytics
    sentiment: { type: String, enum: ["positive", "negative", "neutral"] },
    topics: [{ type: String }],
    summary: { type: String },
    notes: { type: String },

    // Collected Data
    collectedData: { type: Map, of: String },

    // Cost tracking
    cost: { type: Number, default: 0 },

    // Timestamps
    startedAt: { type: Date },
    endedAt: { type: Date },
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
callHistorySchema.index({ agentId: 1, createdAt: -1 });
callHistorySchema.index({ userId: 1, createdAt: -1 });
callHistorySchema.index({ orgId: 1, createdAt: -1 });

export const CallHistoryModel = mongoose.model<ICallHistory>(
  "CallHistory",
  callHistorySchema,
);
