import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, collectionsTable, collectionItemsTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const CreateCollectionBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  type: z.enum(["audio", "video", "mixed"]).default("audio"),
  isPublished: z.boolean().default(false),
  createdBy: z.string().optional(),
});

const CreateItemBody = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  mediaUrl: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  duration: z.number().int().optional(),
  position: z.number().int().default(0),
  type: z.enum(["audio", "video"]).default("audio"),
});

router.get("/collections", async (_req, res): Promise<void> => {
  try {
    const collections = await db
      .select()
      .from(collectionsTable)
      .orderBy(asc(collectionsTable.createdAt));
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

router.get("/collections/published", async (_req, res): Promise<void> => {
  try {
    const collections = await db
      .select()
      .from(collectionsTable)
      .where(eq(collectionsTable.isPublished, true))
      .orderBy(asc(collectionsTable.createdAt));
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [collection] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, id));
    if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }
    const items = await db
      .select()
      .from(collectionItemsTable)
      .where(eq(collectionItemsTable.collectionId, id))
      .orderBy(asc(collectionItemsTable.position));
    res.json({ ...collection, items });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [collection] = await db.insert(collectionsTable).values(parsed.data).returning();
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: "Failed to create collection" });
  }
});

router.patch("/collections/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateCollectionBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [collection] = await db
      .update(collectionsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(collectionsTable.id, id))
      .returning();
    if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: "Failed to update collection" });
  }
});

router.delete("/collections/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(collectionsTable).where(eq(collectionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

router.post("/collections/:id/items", async (req, res): Promise<void> => {
  const collectionId = parseInt(req.params.id, 10);
  if (isNaN(collectionId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [item] = await db.insert(collectionItemsTable).values({ ...parsed.data, collectionId }).returning();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

router.patch("/collections/:collectionId/items/:itemId", async (req, res): Promise<void> => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateItemBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [item] = await db
      .update(collectionItemsTable)
      .set(parsed.data)
      .where(eq(collectionItemsTable.id, itemId))
      .returning();
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

router.delete("/collections/:collectionId/items/:itemId", async (req, res): Promise<void> => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(collectionItemsTable).where(eq(collectionItemsTable.id, itemId));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
