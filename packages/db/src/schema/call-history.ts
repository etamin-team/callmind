import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const directionEnum = pgEnum("direction", ["inbound", "outbound"]);
export const callStatusEnum = pgEnum("call_status", [
  "completed",
  "missed",
  "failed",
  "in-progress",
  "ringing",
]);
export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "negative",
  "neutral",
]);

export const callHistory = pgTable("call_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  agentId: text("agent_id").notNull(),
  userId: text("user_id").notNull(),
  orgId: text("org_id"),

  callSid: text("call_sid"),
  direction: directionEnum("direction").notNull(),
  callerNumber: text("caller_number"),
  callerName: text("caller_name"),
  duration: integer("duration").default(0).notNull(),
  status: callStatusEnum("status").default("ringing").notNull(),

  recordingUrl: text("recording_url"),
  transcript: text("transcript"),

  sentiment: sentimentEnum("sentiment"),
  topics: text("topics").array(),
  summary: text("summary"),
  notes: text("notes"),

  collectedData: jsonb("collected_data"),

  cost: integer("cost").default(0).notNull(),
  creditsDeducted: boolean("credits_deducted").default(false).notNull(),
  isSuperRealistic: boolean("is_super_realistic").default(false).notNull(),

  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CallHistory = typeof callHistory.$inferSelect;
export type NewCallHistory = typeof callHistory.$inferInsert;
