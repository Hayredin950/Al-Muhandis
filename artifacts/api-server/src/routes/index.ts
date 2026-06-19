import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quranRouter from "./quran";
import hadithRouter from "./hadith";
import searchRouter from "./search";
import bookmarksRouter from "./bookmarks";
import aiRouter from "./ai";
import collectionsRouter from "./collections";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quranRouter);
router.use(hadithRouter);
router.use(searchRouter);
router.use(bookmarksRouter);
router.use(aiRouter);
router.use(collectionsRouter);

export default router;
