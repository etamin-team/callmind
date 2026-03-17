import { z } from "zod";

export const CallHistorySchema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  userId: z.string(),
  orgId: z.string().optional(),

  // Call Details
  callSid: z.string().optional(), // Unique call identifier from Twilio/Vonage
  direction: z.enum(["inbound", "outbound"]),
  phone: z.string().optional(), // Phone number (v2.0 API)
  callerNumber: z.string().optional(),
  callerName: z.string().optional(),
  duration: z.number().optional(), // in seconds
  turnCount: z.number().optional(), // Number of conversation turns (v2.0 API)
  status: z.enum(["completed", "missed", "failed", "in-progress", "ringing"]),
  outcome: z
    .enum([
      "sold",
      "interested",
      "refused",
      "no_answer",
      "busy",
      "timeout",
      "completed",
    ])
    .optional(),

  // Recording
  recordingUrl: z.string().url().optional(),
  transcript: z.string().optional(),

  // Analytics
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  topics: z.array(z.string()).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),

  // Collected Data (from agent's collectFields)
  collectedData: z.record(z.string()).optional(),

  // Cost tracking
  cost: z.number().optional(),

  // Timestamps
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CallHistory = z.infer<typeof CallHistorySchema>;

export const CreateCallHistorySchema = CallHistorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCallHistoryRequest = z.infer<typeof CreateCallHistorySchema>;

export const UpdateCallHistorySchema = CreateCallHistorySchema.partial();

export type UpdateCallHistoryRequest = z.infer<typeof UpdateCallHistorySchema>;
