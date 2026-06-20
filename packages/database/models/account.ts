import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { usersTable } from "../schema";

export const accountsTable = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  provider: varchar("provider", { length: 50 }).notNull(),

  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectAccount = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
