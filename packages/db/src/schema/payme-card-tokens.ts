import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const paymeCardTokens = pgTable("payme_card_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  cardNumber: text("card_number").notNull(),
  cardExpire: text("card_expire").notNull(),
  verify: boolean("verify").default(false).notNull(),
  recurrent: boolean("recurrent").default(false).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PaymeCardToken = typeof paymeCardTokens.$inferSelect;
export type NewPaymeCardToken = typeof paymeCardTokens.$inferInsert;
