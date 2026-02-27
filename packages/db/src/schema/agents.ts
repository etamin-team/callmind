import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const voiceModeEnum = pgEnum("voice_mode", [
  "realistic",
  "superRealistic",
]);

export const agents = pgTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  orgId: text("org_id"),

  name: text("name").notNull(),
  type: text("type").default("custom"),
  language: text("language").default("en"),
  voice: text("voice"),
  voiceMode: voiceModeEnum("voice_mode").default("realistic"),

  businessName: text("business_name"),
  businessDescription: text("business_description"),
  businessIndustry: text("business_industry"),
  targetCallers: text("target_callers"),

  knowledgeText: text("knowledge_text"),

  greeting: text("greeting"),
  primaryGoal: text("primary_goal"),
  phoneTransfer: text("phone_transfer"),
  objectionHandling: text("objection_handling"),
  collectFields: text("collect_fields").array(),

  systemPrompt: text("system_prompt"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
