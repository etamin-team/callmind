import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const transactionStateEnum = pgEnum("transaction_state", [
  "-1",
  "1",
  "2",
]);
export const transactionPlanEnum = pgEnum("transaction_plan", [
  "starter",
  "professional",
  "business",
]);

export const paymeTransactions = pgTable("payme_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  paymeTransactionId: text("payme_transaction_id").notNull().unique(),
  merchantTransactionId: text("merchant_transaction_id").notNull().unique(),
  orderId: text("order_id").notNull(),
  amount: integer("amount").notNull(),
  state: transactionStateEnum("state").default("1").notNull(),
  createTime: timestamp("create_time").defaultNow().notNull(),
  performTime: timestamp("perform_time"),
  cancelTime: timestamp("cancel_time"),
  userId: text("user_id").notNull(),
  plan: transactionPlanEnum("plan").notNull(),
  yearly: boolean("yearly").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PaymeTransaction = typeof paymeTransactions.$inferSelect;
export type NewPaymeTransaction = typeof paymeTransactions.$inferInsert;
