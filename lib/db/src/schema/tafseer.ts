import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tafseerTable = pgTable("tafseer", {
  id: serial("id").primaryKey(),
  ayahId: integer("ayah_id").notNull(),
  source: text("source").notNull(),
  arabicText: text("arabic_text").notNull(),
  englishText: text("english_text").notNull(),
  scholarName: text("scholar_name").notNull(),
});

export const insertTafseerSchema = createInsertSchema(tafseerTable).omit({ id: true });
export type InsertTafseer = z.infer<typeof insertTafseerSchema>;
export type Tafseer = typeof tafseerTable.$inferSelect;
