import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surahsTable = pgTable("surahs", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  nameArabic: text("name_arabic").notNull(),
  nameTransliterated: text("name_transliterated").notNull(),
  nameEnglish: text("name_english").notNull(),
  revelation: text("revelation").notNull(),
  ayahCount: integer("ayah_count").notNull(),
  juzNumber: integer("juz_number").notNull(),
  description: text("description").notNull().default(""),
});

export const insertSurahSchema = createInsertSchema(surahsTable).omit({ id: true });
export type InsertSurah = z.infer<typeof insertSurahSchema>;
export type Surah = typeof surahsTable.$inferSelect;
