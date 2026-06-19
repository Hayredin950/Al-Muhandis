import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ayahsTable = pgTable("ayahs", {
  id: serial("id").primaryKey(),
  surahId: integer("surah_id").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  arabicText: text("arabic_text").notNull(),
  translation: text("translation").notNull(),
  transliteration: text("transliteration").notNull(),
  juzNumber: integer("juz_number").notNull(),
  pageNumber: integer("page_number").notNull(),
  audioUrl: text("audio_url"),
});

export const insertAyahSchema = createInsertSchema(ayahsTable).omit({ id: true });
export type InsertAyah = z.infer<typeof insertAyahSchema>;
export type Ayah = typeof ayahsTable.$inferSelect;
