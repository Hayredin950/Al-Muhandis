import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hadithCollectionsTable = pgTable("hadith_collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameArabic: text("name_arabic").notNull(),
  author: text("author").notNull(),
  totalHadiths: integer("total_hadiths").notNull(),
  description: text("description").notNull(),
  era: text("era").notNull(),
});

export const insertHadithCollectionSchema = createInsertSchema(hadithCollectionsTable);
export type InsertHadithCollection = z.infer<typeof insertHadithCollectionSchema>;
export type HadithCollection = typeof hadithCollectionsTable.$inferSelect;
