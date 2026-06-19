import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, surahsTable, ayahsTable, ayahWordsTable, tafseerTable, hadithsTable, ayahHadithLinksTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  GetSurahParams,
  ListAyahsParams,
  ListAyahsQueryParams,
  GetAyahParams,
  GetAyahWordsParams,
  GetAyahTafseerParams,
  GetAyahTafseerQueryParams,
  GetAyahRelatedHadithsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quran/summary", async (_req, res): Promise<void> => {
  const surahs = await db.select().from(surahsTable);
  const ayahs = await db.select().from(ayahsTable);
  const words = await db.select().from(ayahWordsTable);

  const makkiSurahs = surahs.filter((s) => s.revelation === "Meccan").length;
  const madaniSurahs = surahs.filter((s) => s.revelation === "Medinan").length;

  res.json({
    totalSurahs: surahs.length,
    totalAyahs: ayahs.length,
    totalWords: words.length,
    makkiSurahs,
    madaniSurahs,
    lastRead: null,
  });
});

router.get("/quran/daily-ayah", async (_req, res): Promise<void> => {
  const totalAyahs = await db.select().from(ayahsTable);
  if (totalAyahs.length === 0) {
    res.json({ id: 1, surahId: 1, surahName: "Al-Fatihah", ayahNumber: 1, arabicText: "", translation: "", transliteration: "", juzNumber: 1, pageNumber: 1, audioUrl: null });
    return;
  }
  const dayOfYear = Math.floor(Date.now() / 86400000) % totalAyahs.length;
  const ayah = totalAyahs[dayOfYear] ?? totalAyahs[0];
  const surah = await db.select().from(surahsTable).where(eq(surahsTable.id, ayah!.surahId)).then((r) => r[0]);
  res.json({ ...ayah, surahName: surah?.nameTransliterated ?? "" });
});

router.get("/quran/surahs", async (_req, res): Promise<void> => {
  const surahs = await db.select().from(surahsTable).orderBy(surahsTable.number);
  res.json(surahs);
});

router.get("/quran/surahs/:surahId", async (req, res): Promise<void> => {
  const params = GetSurahParams.safeParse({ surahId: req.params.surahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [surah] = await db.select().from(surahsTable).where(eq(surahsTable.number, params.data.surahId));
  if (!surah) { res.status(404).json({ error: "Surah not found" }); return; }
  res.json(surah);
});

router.get("/quran/surahs/:surahId/ayahs", async (req, res): Promise<void> => {
  const params = ListAyahsParams.safeParse({ surahId: req.params.surahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const _query = ListAyahsQueryParams.safeParse(req.query);
  const surah = await db.select().from(surahsTable).where(eq(surahsTable.number, params.data.surahId)).then((r) => r[0]);
  if (!surah) { res.status(404).json({ error: "Surah not found" }); return; }
  const ayahs = await db.select().from(ayahsTable).where(eq(ayahsTable.surahId, surah.id)).orderBy(ayahsTable.ayahNumber);
  res.json(ayahs.map((a) => ({ ...a, surahName: surah.nameTransliterated })));
});

router.get("/quran/ayahs/:ayahId", async (req, res): Promise<void> => {
  const params = GetAyahParams.safeParse({ ayahId: req.params.ayahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [ayah] = await db.select().from(ayahsTable).where(eq(ayahsTable.id, params.data.ayahId));
  if (!ayah) { res.status(404).json({ error: "Ayah not found" }); return; }
  const surah = await db.select().from(surahsTable).where(eq(surahsTable.id, ayah.surahId)).then((r) => r[0]);
  res.json({ ...ayah, surahName: surah?.nameTransliterated ?? "" });
});

router.get("/quran/ayahs/:ayahId/words", async (req, res): Promise<void> => {
  const params = GetAyahWordsParams.safeParse({ ayahId: req.params.ayahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const words = await db.select().from(ayahWordsTable).where(eq(ayahWordsTable.ayahId, params.data.ayahId)).orderBy(ayahWordsTable.position);
  res.json(words);
});

const CLASSICAL_EDITIONS: Record<string, string> = {
  "ar.jalalayn": "تفسير الجلالين",
  "ar.muyassar": "تفسير الميسر",
  "ar.qurtubi": "تفسير القرطبي",
  "ar.miqbas": "تنوير المقباس",
  "ar.waseet": "التفسير الوسيط",
  "ar.baghawi": "تفسير البغوي",
};

// Real classical tafseer sources fetched from quran.com (returns HTML)
const QURAN_COM_TAFSIRS: Record<string, { tafsirId: number; scholarName: string; lang: "en" | "ar" }> = {
  "en.ibn-kathir": { tafsirId: 169, scholarName: "Tafsir Ibn Kathir (Abridged)", lang: "en" },
};

// Amharic tafseer sources — AI translation of real classical text
const ENGLISH_AI_SOURCES: Record<string, { scholarName: string; systemPrompt: string; userPromptNote: string }> = {};

router.get("/quran/ayahs/:ayahId/tafseer", async (req, res): Promise<void> => {
  const params = GetAyahTafseerParams.safeParse({ ayahId: req.params.ayahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const query = GetAyahTafseerQueryParams.safeParse(req.query);
  const source = query.success ? query.data.source : undefined;

  // Check DB cache first
  const results = await db.select().from(tafseerTable).where(eq(tafseerTable.ayahId, params.data.ayahId));
  const effectiveSource = source ?? "ai-generated";
  const cached = results.find((t) => t.source === effectiveSource) ?? (!source ? results.find((t) => t.source === "ai-generated") : undefined);

  if (cached && (cached.arabicText || cached.englishText)) {
    res.json(cached);
    return;
  }

  // Load ayah + surah for all paths
  const [ayah] = await db.select().from(ayahsTable).where(eq(ayahsTable.id, params.data.ayahId));
  if (!ayah) { res.status(404).json({ error: "Ayah not found" }); return; }
  const [surah] = await db.select().from(surahsTable).where(eq(surahsTable.id, ayah.surahId));
  if (!surah) { res.status(404).json({ error: "Surah not found" }); return; }

  // Classical Arabic edition — fetch from alquran.cloud
  if (source && source in CLASSICAL_EDITIONS) {
    try {
      const url = `https://api.alquran.cloud/v1/ayah/${surah.number}:${ayah.ayahNumber}/${source}`;
      const response = await fetch(url);
      if (!response.ok) { res.status(502).json({ error: "Classical tafseer source unavailable" }); return; }
      const data = await response.json() as { code: number; data: { text: string } };
      if (data.code !== 200 || !data.data?.text) { res.status(502).json({ error: "No tafseer data for this verse" }); return; }

      const arabicText = data.data.text.trim();
      const scholarName = CLASSICAL_EDITIONS[source] ?? source;

      const [inserted] = await db.insert(tafseerTable).values({
        ayahId: params.data.ayahId,
        source,
        scholarName,
        arabicText,
        englishText: "",
      }).returning();

      res.json(inserted ?? { ayahId: params.data.ayahId, source, scholarName, arabicText, englishText: "" });
      return;
    } catch (err) {
      req.log.error({ err }, "Classical tafseer fetch failed");
      res.status(503).json({ error: "Classical tafseer source unavailable" });
      return;
    }
  }

  // Amharic translation — fetch from alquran.cloud
  if (source === "am.sadiq") {
    try {
      const url = `https://api.alquran.cloud/v1/ayah/${surah.number}:${ayah.ayahNumber}/am.sadiq`;
      const response = await fetch(url);
      if (!response.ok) { res.status(502).json({ error: "Amharic translation source unavailable" }); return; }
      const data = await response.json() as { code: number; data: { text: string } };
      if (data.code !== 200 || !data.data?.text) { res.status(502).json({ error: "No Amharic translation for this verse" }); return; }

      const amharicText = data.data.text.trim();

      const [inserted] = await db.insert(tafseerTable).values({
        ayahId: params.data.ayahId,
        source: "am.sadiq",
        scholarName: "ሳዲቅ & ሳኒ ሐቢብ",
        arabicText: "",
        englishText: amharicText,
      }).returning();

      res.json(inserted ?? { ayahId: params.data.ayahId, source: "am.sadiq", scholarName: "ሳዲቅ & ሳኒ ሐቢብ", arabicText: "", englishText: amharicText });
      return;
    } catch (err) {
      req.log.error({ err }, "Amharic translation fetch failed");
      res.status(503).json({ error: "Amharic translation unavailable" });
      return;
    }
  }

  // Real classical tafseer from quran.com (English HTML or Arabic HTML)
  if (source && source in QURAN_COM_TAFSIRS) {
    const { tafsirId, scholarName, lang } = QURAN_COM_TAFSIRS[source]!;
    try {
      const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surah.number}:${ayah.ayahNumber}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) { res.status(502).json({ error: "Tafseer source unavailable" }); return; }
      const data = await response.json() as { tafsir?: { text?: string } };
      const htmlText = data.tafsir?.text?.trim() ?? "";
      if (!htmlText) { res.status(502).json({ error: "No tafseer data for this verse" }); return; }

      const isAr = lang === "ar";
      const [inserted] = await db.insert(tafseerTable).values({
        ayahId: params.data.ayahId,
        source,
        scholarName,
        arabicText: isAr ? htmlText : "",
        englishText: isAr ? "" : htmlText,
      }).returning();

      res.json(inserted ?? { ayahId: params.data.ayahId, source, scholarName, arabicText: isAr ? htmlText : "", englishText: isAr ? "" : htmlText });
      return;
    } catch (err) {
      req.log.error({ err }, "Classical tafseer fetch failed");
      res.status(503).json({ error: "Tafseer not available" });
      return;
    }
  }

  // Amharic tafseer — AI translation of real classical Ibn Kathir text
  // English AI tafseer sources (fallback, currently none)
  if (source && source in ENGLISH_AI_SOURCES) {
    res.status(501).json({ error: "AI tafseer not configured" });
    return;
  }

  // Default AI synthesis (multi-scholar)
  try {
    const prompt = `Provide a scholarly Tafseer for Surah ${surah.number}:${ayah.ayahNumber} (${surah.nameTransliterated}):

Arabic: ${ayah.arabicText}
Translation: "${ayah.translation}"

Include: historical context, linguistic insights, main scholarly interpretation, and practical wisdom. 2-3 concise paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are an expert Quranic scholar. Provide accurate, scholarly tafseer based on Ibn Kathir, al-Tabari, and al-Qurtubi. Always respond with 2-3 paragraphs of commentary." },
        { role: "user", content: prompt },
      ],
    });

    const aiText = (completion.choices[0]?.message?.content ?? "").trim();

    if (!aiText) {
      req.log.warn({ ayahId: params.data.ayahId }, "AI returned empty tafseer content");
      res.status(503).json({ error: "AI returned empty response" });
      return;
    }

    const [inserted] = await db.insert(tafseerTable).values({
      ayahId: params.data.ayahId,
      source: "ai-generated",
      scholarName: "AI Scholar (Al-Muhandis)",
      arabicText: "",
      englishText: aiText,
    }).returning();

    res.json(inserted ?? { ayahId: params.data.ayahId, source: "ai-generated", scholarName: "AI Scholar (Al-Muhandis)", arabicText: "", englishText: aiText });
  } catch (err) {
    req.log.error({ err }, "Tafseer generation failed");
    res.status(503).json({ error: "Tafseer not available" });
  }
});

router.get("/quran/ayahs/:ayahId/related-hadiths", async (req, res): Promise<void> => {
  const params = GetAyahRelatedHadithsParams.safeParse({ ayahId: req.params.ayahId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const links = await db.select().from(ayahHadithLinksTable).where(eq(ayahHadithLinksTable.ayahId, params.data.ayahId));
  const hadithIds = links.map((l) => l.hadithId);
  if (hadithIds.length === 0) { res.json([]); return; }
  const hadiths = await db.select().from(hadithsTable);
  const relevant = hadiths.filter((h) => hadithIds.includes(h.id));
  res.json(relevant.map((h) => ({ ...h, collectionName: h.collectionId, topics: h.topics ?? [] })));
});

router.get("/quran/translations", async (_req, res): Promise<void> => {
  res.json([
    { id: "sahih-international", name: "Sahih International", language: "English", author: "Saheeh International" },
    { id: "pickthall", name: "Pickthall", language: "English", author: "Mohammed Marmaduke Pickthall" },
    { id: "yusuf-ali", name: "Yusuf Ali", language: "English", author: "Abdullah Yusuf Ali" },
    { id: "dr-ghali", name: "Dr. Ghali", language: "English", author: "Dr. Mohammed Ghali" },
    { id: "hilali-khan", name: "Hilali & Khan", language: "English", author: "Al-Hilali & Muhsin Khan" },
    { id: "urdu-jalandhry", name: "Jalandhry", language: "Urdu", author: "Fateh Muhammad Jalandhry" },
    { id: "urdu-junagarhi", name: "Junagarhi", language: "Urdu", author: "Muhammad Junagarhi" },
    { id: "french-hamidullah", name: "Hamidullah", language: "French", author: "Muhammad Hamidullah" },
    { id: "turkish-ates", name: "Ates", language: "Turkish", author: "Suleyman Ates" },
    { id: "indonesian-depag", name: "Kemenag", language: "Indonesian", author: "Indonesian Ministry of Religious Affairs" },
    { id: "am.sadiq", name: "Sadiq & Sani Habib", language: "Amharic", author: "Sadiq & Sani Habib" },
  ]);
});

router.get("/quran/reciters", async (_req, res): Promise<void> => {
  res.json([
    { id: "mishary-rashid", name: "Mishary Rashid Alafasy", style: "Murattal", language: "Arabic" },
    { id: "maher-al-muaiqly", name: "Maher Al-Muaiqly", style: "Murattal", language: "Arabic" },
    { id: "abdulbasit", name: "Abdul Basit Murattal", style: "Murattal", language: "Arabic" },
    { id: "saad-al-ghamdi", name: "Saad Al-Ghamdi", style: "Murattal", language: "Arabic" },
    { id: "minshawi", name: "Mohamed Siddiq El-Minshawi", style: "Murattal", language: "Arabic" },
    { id: "yasser-dosari", name: "Yasser Al-Dosari", style: "Murattal", language: "Arabic" },
    { id: "hani-rifai", name: "Hani Ar-Rifai", style: "Murattal", language: "Arabic" },
    { id: "ali-huthaify", name: "Ali Al-Huthaify", style: "Murattal", language: "Arabic" },
  ]);
});

export default router;
