import { Router, type IRouter } from "express";
import { ilike, or } from "drizzle-orm";
import { db, ayahsTable, hadithsTable, surahsTable, hadithCollectionsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SearchQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const query = SearchQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { q, type } = query.data;
  const searchType = type ?? "all";

  type AyahResult = {
    id: number; surahId: number; surahName: string; ayahNumber: number;
    arabicText: string; translation: string; transliteration: string;
    juzNumber: number; pageNumber: number; audioUrl: string | null;
  };
  type HadithResult = {
    id: number; collectionId: string; collectionName: string; hadithNumber: string;
    arabicText: string; translation: string; grade: string; gradeReason: string;
    narrator: string; topics: string[];
  };

  let ayahs: AyahResult[] = [];
  let hadiths: HadithResult[] = [];
  let aiInsight: string | null = null;

  if (searchType === "all" || searchType === "quran") {
    const foundAyahs = await db
      .select()
      .from(ayahsTable)
      .where(
        or(
          ilike(ayahsTable.translation, `%${q}%`),
          ilike(ayahsTable.transliteration, `%${q}%`)
        )
      )
      .limit(15);

    const surahs = await db.select().from(surahsTable);
    ayahs = foundAyahs.map((ayah) => {
      const surah = surahs.find((s) => s.id === ayah.surahId);
      return { ...ayah, surahName: surah?.nameTransliterated ?? "" };
    });

    // Also search by surah name
    if (ayahs.length < 3) {
      const surahNameMatches = surahs.filter(s =>
        s.nameTransliterated.toLowerCase().includes(q.toLowerCase()) ||
        s.nameEnglish.toLowerCase().includes(q.toLowerCase()) ||
        s.nameArabic.includes(q)
      );
      for (const surah of surahNameMatches.slice(0, 3)) {
        const surahAyahs = await db.select().from(ayahsTable)
          .where(ilike(ayahsTable.translation, `%${q}%`))
          .limit(3);
        for (const ayah of surahAyahs) {
          if (!ayahs.find(a => a.id === ayah.id)) {
            ayahs.push({ ...ayah, surahName: surah.nameTransliterated });
          }
        }
      }
    }
  }

  if (searchType === "all" || searchType === "hadith") {
    const searchLimit = parseInt(String((req as { query?: Record<string, string> }).query?.limit ?? "20"), 10);
    const searchPage = parseInt(String((req as { query?: Record<string, string> }).query?.page ?? "1"), 10);
    const searchOffset = (searchPage - 1) * searchLimit;

    const foundHadiths = await db
      .select()
      .from(hadithsTable)
      .where(
        or(
          ilike(hadithsTable.translation, `%${q}%`),
          ilike(hadithsTable.narrator, `%${q}%`)
        )
      )
      .limit(searchLimit)
      .offset(searchOffset);

    const collections = await db.select().from(hadithCollectionsTable);
    hadiths = foundHadiths.map((h) => {
      const collection = collections.find((c) => c.id === h.collectionId);
      return { ...h, collectionName: collection?.name ?? h.collectionId, topics: h.topics ?? [] };
    });
  }

  // AI Semantic Search when keyword results are sparse
  if (ayahs.length + hadiths.length < 3 && q.length > 4) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "You are an Islamic scholar assistant. When given a search query, provide 3-5 direct relevant Quranic verses (with surah:ayah) and 2-3 relevant hadiths that address the topic. Be concise and scholarly.",
          },
          {
            role: "user",
            content: `Islamic knowledge search: "${q}"\n\nProvide relevant Quran verses and hadiths addressing this topic, with brief explanations.`,
          },
        ],
        max_completion_tokens: 600,
      });

      aiInsight = completion.choices[0]?.message?.content ?? null;
    } catch {
      aiInsight = null;
    }
  }

  res.json({
    query: q,
    ayahs,
    hadiths,
    total: ayahs.length + hadiths.length,
    aiInsight,
  });
});

export default router;
