import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hadithIsnadTable = pgTable("hadith_isnad", {
  id: serial("id").primaryKey(),
  hadithId: integer("hadith_id").notNull(),
  narratorId: integer("narrator_id").notNull(),
  position: integer("position").notNull(),
});

export const insertHadithIsnadSchema = createInsertSchema(hadithIsnadTable).omit({ id: true });
export type InsertHadithIsnad = z.infer<typeof insertHadithIsnadSchema>;
export type HadithIsnad = typeof hadithIsnadTable.$inferSelect;
