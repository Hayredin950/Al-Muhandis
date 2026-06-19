import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hadithsTable = pgTable("hadiths", {
  id: serial("id").primaryKey(),
  collectionId: text("collection_id").notNull(),
  hadithNumber: text("hadith_number").notNull(),
  arabicText: text("arabic_text").notNull(),
  translation: text("translation").notNull(),
  grade: text("grade").notNull(),
  gradeReason: text("grade_reason").notNull().default(""),
  narrator: text("narrator").notNull(),
  topics: text("topics").array().notNull().default([]),
  sharh: text("sharh").notNull().default(""),
});

export const insertHadithSchema = createInsertSchema(hadithsTable).omit({ id: true });
export type InsertHadith = z.infer<typeof insertHadithSchema>;
export type Hadith = typeof hadithsTable.$inferSelect;
