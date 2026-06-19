import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const narratorsTable = pgTable("narrators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameArabic: text("name_arabic").notNull(),
  birthYear: integer("birth_year"),
  deathYear: integer("death_year"),
  location: text("location").notNull().default(""),
  reliability: text("reliability").notNull(),
  grade: text("grade").notNull(),
  heardFrom: text("heard_from").array().notNull().default([]),
});

export const insertNarratorSchema = createInsertSchema(narratorsTable).omit({ id: true });
export type InsertNarrator = z.infer<typeof insertNarratorSchema>;
export type Narrator = typeof narratorsTable.$inferSelect;
