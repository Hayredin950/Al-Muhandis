import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ayahWordsTable = pgTable("ayah_words", {
  id: serial("id").primaryKey(),
  ayahId: integer("ayah_id").notNull(),
  position: integer("position").notNull(),
  arabicText: text("arabic_text").notNull(),
  transliteration: text("transliteration").notNull(),
  translation: text("translation").notNull(),
  rootWord: text("root_word").notNull(),
  grammar: text("grammar").notNull(),
});

export const insertAyahWordSchema = createInsertSchema(ayahWordsTable).omit({ id: true });
export type InsertAyahWord = z.infer<typeof insertAyahWordSchema>;
export type AyahWord = typeof ayahWordsTable.$inferSelect;
