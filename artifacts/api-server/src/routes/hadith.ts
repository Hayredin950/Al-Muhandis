import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, hadithsTable, hadithCollectionsTable, narratorsTable, hadithIsnadTable, ayahHadithLinksTable, ayahsTable, surahsTable } from "@workspace/db";
import {
  GetHadithIsnadParams,
  GetHadithRelatedAyahsParams,
  ListHadithsParams,
  ListHadithsQueryParams,
} from "@workspace/api-zod";
import { PROXY_COLLECTIONS, COLLECTION_GRADE_ESTIMATES, fetchProxyHadith, fetchProxyHadithPage, fetchHadithsByGrade } from "../services/hadith-proxy";
import { parseIsnad } from "../utils/isnad-parser.js";

const router: IRouter = Router();

function isProxyCollection(collectionId: string): boolean {
  return collectionId in PROXY_COLLECTIONS;
}

const GRADE_TERM_MAP: Record<string, string> = {
  "daif": "Ḍaʿīf (Weak)",
  "da'if": "Ḍaʿīf (Weak)",
  "daif maqtu": "Ḍaʿīf Maqṭūʿ (weak with broken chain)",
  "daif jiddan": "Ḍaʿīf Jiddan (Very Weak)",
  "hasan": "Ḥasan (Good)",
  "hasan sahih": "Ḥasan Ṣaḥīḥ (Good/Authentic)",
  "sahih": "Ṣaḥīḥ (Authentic)",
  "mawdu": "Mawḍūʿ (Fabricated)",
  "mawdhu": "Mawḍūʿ (Fabricated)",
  "munkar": "Munkar (Denounced)",
  "mursal": "Mursal (Disconnected — Companion link missing)",
  "munqati": "Munqaṭiʿ (Broken chain)",
  "shadh": "Shādh (Anomalous)",
  "matruk": "Matrūk (Abandoned — narrator accused of lying)",
};

function formatGradeReason(gradeReason: string, grade: string): string {
  const parts = gradeReason.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";

  const gradeLabel: Record<string, string> = {
    "Da'if": "weak", "Munkar": "Munkar (denounced)", "Mawdu'": "fabricated (Mawḍūʿ)",
    "Unknown": "unclassified", "Hasan": "good (Ḥasan)", "Sahih": "authentic (Ṣaḥīḥ)",
  };
  const gradeDesc = gradeLabel[grade] ?? grade.toLowerCase();

  const verdicts = parts.map((p) => {
    const idx = p.indexOf(":");
    if (idx === -1) return p;
    const scholar = p.slice(0, idx).trim();
    const verdict = p.slice(idx + 1).trim().toLowerCase();
    const formatted = GRADE_TERM_MAP[verdict] ?? p.slice(idx + 1).trim();
    return `${scholar}: ${formatted}`;
  });

  const uniqueVerdicts = [...new Set(verdicts)];
  const intro = `Scholars assessed this specific chain as ${gradeDesc}. `;
  return intro + uniqueVerdicts.join(" · ");
}

function buildIsnadChain(
  hadith: { id: number; arabicText: string; narrator: string; grade: string; gradeReason?: string | null },
  collectionName: string
) {
  const parsed = parseIsnad(hadith.arabicText ?? "", hadith.narrator ?? "", hadith.grade);
  const chainAnalysis = hadith.gradeReason
    ? formatGradeReason(hadith.gradeReason, hadith.grade)
    : parsed.chainAnalysis;
  return {
    hadithId: String(hadith.id),
    narrators: parsed.narrators,
    overallGrade: parsed.overallGrade,
    chainAnalysis,
    defects: hadith.gradeReason ? extractDefectsFromReason(hadith.gradeReason) : parsed.defects,
  };
}

function extractDefectsFromReason(gradeReason: string): string[] {
  const defects: string[] = [];
  const lower = gradeReason.toLowerCase();
  if (lower.includes("maqtu")) defects.push("Chain is maqṭūʿ (cut off) — the chain does not reach the Companion level or above.");
  if (lower.includes("mursal")) defects.push("Chain is mursal — the Companion link is missing; a Tābiʿī narrates directly from the Prophet ﷺ.");
  if (lower.includes("munqati")) defects.push("Chain is munqaṭiʿ — one or more links in the chain are missing.");
  if (lower.includes("mawdu") || lower.includes("mawdhu")) defects.push("Scholars identified this as Mawḍūʿ (fabricated) — the chain contains a known fabricator or the content has been proven invented.");
  if (lower.includes("munkar")) defects.push("Graded Munkar — this narration contradicts what more reliable narrators have reported on the same subject.");
  if (lower.includes("matruk")) defects.push("Chain contains a matrūk narrator — someone who was accused of lying in hadith transmission.");
  if (lower.includes("shadh") || lower.includes("syadh")) defects.push("Graded Shādh — a trustworthy narrator contradicts the majority of reliable narrators here.");
  if (defects.length === 0 && (lower.includes("daif") || lower.includes("da'if"))) {
    defects.push("Scholars found one or more narrators in this specific chain to be unreliable (ḍaʿīf) — poor memory, unknown identity, or a gap in transmission.");
  }
  return defects;
}

router.get("/hadith/summary", async (_req, res): Promise<void> => {
  const [collections, gradeCounts, narrators] = await Promise.all([
    db.select().from(hadithCollectionsTable),
    db.select({
      grade: hadithsTable.grade,
      count: sql<number>`cast(count(*) as int)`,
    }).from(hadithsTable).groupBy(hadithsTable.grade),
    db.select().from(narratorsTable),
  ]);

  const totalDbHadiths = gradeCounts.reduce((sum, r) => sum + r.count, 0);
  const proxyTotal = Object.values(PROXY_COLLECTIONS).reduce((sum, c) => sum + c.total, 0);

  // Aggregate grade estimates from all proxy collections using scholarly grade distributions
  const proxyGrades = new Map<string, number>();
  for (const [, estimates] of Object.entries(COLLECTION_GRADE_ESTIMATES)) {
    for (const [grade, count] of Object.entries(estimates)) {
      proxyGrades.set(grade, (proxyGrades.get(grade) ?? 0) + count);
    }
  }

  const gradeMap = new Map<string, number>();
  for (const r of gradeCounts) {
    gradeMap.set(r.grade, r.count);
  }

  const merge = (key: string, ...aliases: string[]) => {
    let total = gradeMap.get(key) ?? 0;
    for (const a of aliases) total += gradeMap.get(a) ?? 0;
    return total + (proxyGrades.get(key) ?? 0);
  };

  res.json({
    totalCollections: collections.length,
    totalHadiths: totalDbHadiths + proxyTotal,
    totalNarrators: narrators.length,
    gradeBreakdown: {
      sahih:      merge("Sahih"),
      hasan:      merge("Hasan"),
      hasanSahih: merge("Hasan Sahih"),
      daif:       merge("Da'if"),
      daifJiddan: merge("Da'if Jiddan"),
      munkar:     merge("Munkar"),
      matruk:     merge("Matruk"),
      mawdu:      merge("Mawdu'", "Mawdu"),
      mursal:     merge("Mursal"),
      munqati:    merge("Munqati'", "Munqati"),
      shadh:      merge("Shadh"),
      unknown:    merge("Unknown"),
    },
    gradeNote: "Grade distribution for Abu Dawud, Tirmidhi, Nasa'i, and Ibn Majah is based on scholarly estimates (Al-Albani's Silsilah and collection-level analysis). Individual hadith grades are available when viewing each hadith.",
  });
});

// Filter hadiths by grade (builds grade index from CDN bulk download on first call)
router.get("/hadith/by-grade/:grade", async (req, res): Promise<void> => {
  const grade = decodeURIComponent(String(req.params.grade));
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(20, Math.max(5, parseInt(String(req.query.limit ?? "15"), 10)));
  const collection = req.query.collection ? String(req.query.collection) : undefined;

  const result = await fetchHadithsByGrade(grade, page, limit, collection);
  res.json(result);
});

// Per-collection grade stats (from scholarly estimates)
router.get("/hadith/collection-grade-stats/:collectionId", async (req, res): Promise<void> => {
  const { collectionId } = req.params;
  const col = PROXY_COLLECTIONS[collectionId as string];
  if (!col) { res.status(404).json({ error: "Not found" }); return; }
  const gradeStats = COLLECTION_GRADE_ESTIMATES[collectionId as string] ?? {};
  res.json({ collectionId, gradeStats, totalHadiths: col.total, hasGradeData: col.hasGradeData });
});

const AUTHENTICITY_ORDER = [
  "bukhari", "muslim", "abu-dawud", "tirmidhi", "nasai", "ibn-majah", "malik", "nawawi-40", "ahmad",
];

router.get("/hadith/collections", async (_req, res): Promise<void> => {
  const collections = await db.select().from(hadithCollectionsTable);
  const sorted = [...collections].sort((a, b) => {
    const ai = AUTHENTICITY_ORDER.indexOf(a.id);
    const bi = AUTHENTICITY_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  res.json(sorted);
});

router.get("/hadith/collections/:collectionId/chapter-hadiths", async (req, res): Promise<void> => {
  const { collectionId } = req.params;
  const from = parseInt(String(req.query.from ?? ""), 10);
  const to = parseInt(String(req.query.to ?? ""), 10);
  if (!collectionId || !from || !to || isNaN(from) || isNaN(to) || from > to) {
    res.status(400).json({ error: "Invalid range parameters" });
    return;
  }
  const count = Math.min(to - from + 1, 150);
  const numbers = Array.from({ length: count }, (_, i) => from + i);

  if (isProxyCollection(collectionId)) {
    const hadiths = await Promise.all(numbers.map((n) => fetchProxyHadith(collectionId, n)));
    res.json({ hadiths: hadiths.filter((h): h is ProxyHadith => h !== null), total: count });
    return;
  }

  const allHadiths = await db.select().from(hadithsTable).where(eq(hadithsTable.collectionId, collectionId));
  const ranged = allHadiths.filter((h) => {
    const n = parseInt(h.hadithNumber, 10);
    return n >= from && n <= to;
  });
  res.json({ hadiths: ranged, total: ranged.length });
});

router.get("/hadith/collections/:collectionId/hadiths", async (req, res): Promise<void> => {
  const params = ListHadithsParams.safeParse({ collectionId: req.params.collectionId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = ListHadithsQueryParams.safeParse(req.query);
  const page = (query.success && query.data.page) ? query.data.page : 1;
  const limit = (query.success && query.data.limit) ? query.data.limit : 20;

  const collectionId = params.data.collectionId;

  if (isProxyCollection(collectionId)) {
    const result = await fetchProxyHadithPage(collectionId, page, limit);
    res.json({
      hadiths: result.hadiths,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
    return;
  }

  const offset = (page - 1) * limit;
  const allHadiths = await db.select().from(hadithsTable).where(eq(hadithsTable.collectionId, collectionId));
  const total = allHadiths.length;
  const paginated = allHadiths.slice(offset, offset + limit);
  const collection = await db.select().from(hadithCollectionsTable)
    .where(eq(hadithCollectionsTable.id, collectionId)).then((r) => r[0]);

  res.json({
    hadiths: paginated.map((h) => ({
      ...h,
      collectionName: collection?.name ?? h.collectionId,
      topics: h.topics ?? [],
    })),
    total,
    page,
    limit,
  });
});

// Daily hadith — DB-first for variety, proxy fallback
router.get("/hadith/daily", async (_req, res): Promise<void> => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );

  // Try DB hadiths first (prefer Sahih/Hasan grades for daily display)
  const [totalResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(hadithsTable);
  const dbTotal = totalResult?.count ?? 0;

  if (dbTotal > 0) {
    const offset = dayOfYear % dbTotal;
    const [hadith] = await db.select().from(hadithsTable).limit(1).offset(offset);
    if (hadith) {
      const collection = await db.select().from(hadithCollectionsTable)
        .where(eq(hadithCollectionsTable.id, hadith.collectionId)).then((r) => r[0]);
      res.json({
        ...hadith,
        id: String(hadith.id),
        collectionName: collection?.name ?? hadith.collectionId,
        topics: hadith.topics ?? [],
      });
      return;
    }
  }

  // Fall back to proxy (Bukhari / Muslim)
  const keys = Object.keys(PROXY_COLLECTIONS) as string[];
  const collectionId = keys[dayOfYear % keys.length] as string;
  const info = PROXY_COLLECTIONS[collectionId];
  if (!info) {
    res.status(404).json({ error: "Daily hadith unavailable" });
    return;
  }
  const hadithNumber = (dayOfYear % info.total) + 1;
  const hadith = await fetchProxyHadith(collectionId, hadithNumber);
  if (!hadith) {
    res.status(404).json({ error: "Daily hadith not found" });
    return;
  }
  res.json({ ...hadith, collectionId });
});

// Fetch single hadith — supports both DB ID (numeric) and proxy ID (e.g. "bukhari:1")
router.get("/hadith/:hadithId", async (req, res): Promise<void> => {
  const rawId = req.params.hadithId ?? "";

  // Check for "collectionId:number" format — handles both proxy and DB collections
  if (rawId.includes(":")) {
    const colonIdx = rawId.lastIndexOf(":");
    const collectionId = rawId.slice(0, colonIdx);
    const numberStr = rawId.slice(colonIdx + 1);
    const number = parseInt(numberStr, 10);
    if (!collectionId || !number) {
      res.status(404).json({ error: "Hadith not found" });
      return;
    }

    // Proxy collections (Bukhari, Muslim)
    if (isProxyCollection(collectionId)) {
      const hadith = await fetchProxyHadith(collectionId, number);
      if (!hadith) { res.status(404).json({ error: "Hadith not found" }); return; }
      const parsed = parseIsnad(hadith.arabicText, hadith.narrator, hadith.grade);
      res.json({
        ...hadith,
        isnadChain: {
          hadithId: hadith.id,
          narrators: parsed.narrators,
          overallGrade: parsed.overallGrade,
          chainAnalysis: parsed.chainAnalysis,
          defects: parsed.defects,
        },
      });
      return;
    }

    // DB collections — look up by collection_id + hadith_number
    const [dbHadith] = await db.select().from(hadithsTable)
      .where(and(eq(hadithsTable.collectionId, collectionId), eq(hadithsTable.hadithNumber, String(number))));
    if (dbHadith) {
      const collection = await db.select().from(hadithCollectionsTable)
        .where(eq(hadithCollectionsTable.id, dbHadith.collectionId)).then((r) => r[0]);
      const isnadChain = buildIsnadChain(dbHadith, collection?.name ?? dbHadith.collectionId);
      res.json({
        ...dbHadith,
        id: String(dbHadith.id),
        collectionName: collection?.name ?? dbHadith.collectionId,
        topics: dbHadith.topics ?? [],
        isnadChain,
      });
      return;
    }

    res.status(404).json({ error: "Hadith not found" });
    return;
  }

  // Also support "collectionId-number" format for URL-safe IDs
  const dashMatch = rawId.match(/^(.+)-(\d+)$/);
  if (dashMatch) {
    const [, collectionId, numberStr] = dashMatch as [string, string, string];
    if (isProxyCollection(collectionId)) {
      const number = parseInt(numberStr, 10);
      const hadith = await fetchProxyHadith(collectionId, number);
      if (hadith) {
        const parsed = parseIsnad(hadith.arabicText, hadith.narrator, hadith.grade);
        res.json({
          ...hadith,
          isnadChain: {
            hadithId: hadith.id,
            narrators: parsed.narrators,
            overallGrade: parsed.overallGrade,
            chainAnalysis: parsed.chainAnalysis,
            defects: parsed.defects,
          },
        });
        return;
      }
    }
  }

  // Numeric DB ID
  const numId = parseInt(rawId, 10);
  if (!numId) {
    res.status(404).json({ error: "Hadith not found" });
    return;
  }
  const [hadith] = await db.select().from(hadithsTable).where(eq(hadithsTable.id, numId));
  if (!hadith) {
    res.status(404).json({ error: "Hadith not found" });
    return;
  }
  const [collection, isnadLinks] = await Promise.all([
    db.select().from(hadithCollectionsTable).where(eq(hadithCollectionsTable.id, hadith.collectionId)).then((r) => r[0]),
    db.select().from(hadithIsnadTable).where(eq(hadithIsnadTable.hadithId, hadith.id)).orderBy(hadithIsnadTable.position),
  ]);

  let isnadChain;
  if (isnadLinks.length > 0) {
    // Use the stored isnad links (seeded collections)
    const allNarrators = await db.select().from(narratorsTable);
    const chainNarrators = isnadLinks.map((link) => {
      const narrator = allNarrators.find((n) => n.id === link.narratorId);
      return narrator ? { ...narrator, heardFrom: narrator.heardFrom ?? [], position: link.position } : null;
    }).filter(Boolean);
    isnadChain = {
      hadithId: String(hadith.id),
      narrators: chainNarrators,
      overallGrade: hadith.grade,
      chainAnalysis: hadith.gradeReason
        ? formatGradeReason(hadith.gradeReason, hadith.grade)
        : undefined,
      defects: hadith.gradeReason ? extractDefectsFromReason(hadith.gradeReason) : [],
    };
  } else {
    // No stored isnad — parse from Arabic text
    isnadChain = buildIsnadChain(hadith, collection?.name ?? hadith.collectionId);
  }

  res.json({
    ...hadith,
    id: String(hadith.id),
    collectionName: collection?.name ?? hadith.collectionId,
    topics: hadith.topics ?? [],
    isnadChain,
  });
});

router.get("/hadith/:hadithId/isnad", async (req, res): Promise<void> => {
  const params = GetHadithIsnadParams.safeParse({ hadithId: req.params.hadithId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [hadith] = await db.select().from(hadithsTable).where(eq(hadithsTable.id, params.data.hadithId));
  if (!hadith) {
    res.status(404).json({ error: "Hadith not found" });
    return;
  }
  const isnadLinks = await db.select().from(hadithIsnadTable).where(eq(hadithIsnadTable.hadithId, hadith.id)).orderBy(hadithIsnadTable.position);
  const allNarrators = isnadLinks.length > 0 ? await db.select().from(narratorsTable) : [];
  const chainNarrators = isnadLinks.map((link) => {
    const narrator = allNarrators.find((n) => n.id === link.narratorId);
    return narrator ? { ...narrator, heardFrom: narrator.heardFrom ?? [], position: link.position } : null;
  }).filter(Boolean);

  res.json({
    hadithId: hadith.id,
    narrators: chainNarrators,
    overallGrade: hadith.grade,
  });
});

router.get("/hadith/:hadithId/related-ayahs", async (req, res): Promise<void> => {
  const params = GetHadithRelatedAyahsParams.safeParse({ hadithId: req.params.hadithId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const links = await db.select().from(ayahHadithLinksTable).where(eq(ayahHadithLinksTable.hadithId, params.data.hadithId));
  const ayahIds = links.map((l) => l.ayahId);
  if (ayahIds.length === 0) {
    res.json([]);
    return;
  }
  const allAyahs = await db.select().from(ayahsTable);
  const relevant = allAyahs.filter((a) => ayahIds.includes(a.id));
  const enriched = await Promise.all(relevant.map(async (ayah) => {
    const surah = await db.select().from(surahsTable).where(eq(surahsTable.id, ayah.surahId)).then((r) => r[0]);
    return { ...ayah, surahName: surah?.nameTransliterated ?? "" };
  }));
  res.json(enriched);
});

export default router;
