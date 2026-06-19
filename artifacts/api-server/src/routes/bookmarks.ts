import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookmarksTable } from "@workspace/db";
import {
  CreateBookmarkBody,
  DeleteBookmarkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookmarks", async (_req, res): Promise<void> => {
  const bookmarks = await db.select().from(bookmarksTable).orderBy(bookmarksTable.createdAt);
  res.json(bookmarks);
});

router.post("/bookmarks", async (req, res): Promise<void> => {
  const parsed = CreateBookmarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [bookmark] = await db.insert(bookmarksTable).values({
    type: parsed.data.type,
    referenceId: parsed.data.referenceId,
    title: parsed.data.title,
    note: parsed.data.note ?? null,
  }).returning();
  res.status(201).json(bookmark);
});

router.delete("/bookmarks/:bookmarkId", async (req, res): Promise<void> => {
  const params = DeleteBookmarkParams.safeParse({ bookmarkId: req.params.bookmarkId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(bookmarksTable).where(eq(bookmarksTable.id, params.data.bookmarkId)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Bookmark not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
