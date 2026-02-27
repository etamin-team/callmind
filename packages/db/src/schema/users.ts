import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const planEnum = pgEnum("plan", [
  "free",
  "starter",
  "professional",
  "enterprise",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  plan: planEnum("plan").default("free").notNull(),
  credits: integer("credits").default(2).notNull(),
  superRealisticCallsRemaining: integer("super_realistic_calls_remaining")
    .default(0)
    .notNull(),

  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id"),

  paymeCustomerId: text("payme_customer_id"),
  paymeTransactionId: text("payme_transaction_id"),
  paymeSubscriptionPlan: text("payme_subscription_plan"),
  paymeSubscriptionExpiry: timestamp("payme_subscription_expiry"),
  paymeSubscriptionActive: boolean("payme_subscription_active").default(false),

  freedompayCustomerId: text("freedompay_customer_id"),
  freedompayRecurringProfile: text("freedompay_recurring_profile"),
  freedompayRecurringExpiry: timestamp("freedompay_recurring_expiry"),
  freedompaySubscriptionPlan: text("freedompay_subscription_plan"),

  subscriptionId: text("subscription_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
