import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  type: text("type").notNull().default("audio"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: text("created_by"),
});

export const collectionItemsTable = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collectionsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  position: integer("position").notNull().default(0),
  type: text("type").notNull().default("audio"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCollectionItemSchema = createInsertSchema(collectionItemsTable).omit({ id: true, createdAt: true });

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;
export type CollectionItem = typeof collectionItemsTable.$inferSelect;
