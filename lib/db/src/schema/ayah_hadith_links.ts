import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ayahHadithLinksTable = pgTable("ayah_hadith_links", {
  id: serial("id").primaryKey(),
  ayahId: integer("ayah_id").notNull(),
  hadithId: integer("hadith_id").notNull(),
});

export const insertAyahHadithLinkSchema = createInsertSchema(ayahHadithLinksTable).omit({ id: true });
export type InsertAyahHadithLink = z.infer<typeof insertAyahHadithLinkSchema>;
export type AyahHadithLink = typeof ayahHadithLinksTable.$inferSelect;
