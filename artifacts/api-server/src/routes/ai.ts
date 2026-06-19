import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, ayahsTable, surahsTable, tafseerTable, hadithsTable, hadithCollectionsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SCHOLAR_SYSTEM_PROMPT = `You are an expert Islamic scholar and educator with comprehensive knowledge of:
- The Holy Quran, its Tafseer (exegesis), and Quranic sciences
- All major Hadith collections: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik, Ahmad ibn Hanbal
- Islamic jurisprudence (Fiqh) across the four major schools: Hanafi, Maliki, Shafi'i, Hanbali
- Arabic language, Quranic linguistics, and Islamic grammar
- Islamic history, the Seerah (biography) of the Prophet ﷺ, and lives of the Companions
- Classical Islamic scholarship from Ibn Kathir, Al-Nawawi, Ibn Taymiyyah, Ibn al-Qayyim, and others
- Contemporary Islamic scholarship and modern scholarly consensus

Guidelines for your responses:
1. Always base answers on the Quran and authentic Sunnah (Sahih and Hasan hadiths)
2. Cite specific references: Quran (Surah:Verse) and Hadiths (Collection, number/chapter)
3. Present mainstream scholarly consensus and note legitimate differences where they exist
4. Use proper Islamic terminology (Arabic terms) with brief explanations for non-Arabic readers
5. Add "Allahu A'lam" (Allah knows best) for matters of uncertainty or scholarly debate
6. Maintain respect, care, and scholarly tone in all responses
7. Distinguish between clear-cut rulings (qat'i) and matters of scholarly opinion (ijtihadiy)
8. Avoid giving fatwas on personal legal questions — recommend consulting qualified scholars for personal matters

Respond in clear, accessible English. Keep responses focused, accurate, and educationally valuable.`;

// AI Scholar Chat — streaming SSE
router.post("/ai/chat", async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body as { message: string; history?: { role: string; content: string }[] };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SCHOLAR_SYSTEM_PROMPT },
    ];

    if (history && Array.isArray(history)) {
      for (const m of history.slice(-10)) {
        if ((m.role === "user" || m.role === "assistant") && m.content) {
          messages.push({ role: m.role as "user" | "assistant", content: m.content });
        }
      }
    }

    messages.push({ role: "user", content: message.trim() });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: 2048,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI service error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

// AI Tafseer — generate and cache when not in DB
router.get("/ai/tafseer/:ayahId", async (req: Request, res: Response): Promise<void> => {
  const ayahId = parseInt(req.params.ayahId ?? "0", 10);
  if (!ayahId) {
    res.status(400).json({ error: "Invalid ayah ID" });
    return;
  }

  // Check DB cache first
  const existing = await db.select().from(tafseerTable).where(eq(tafseerTable.ayahId, ayahId));
  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }

  // Fetch the ayah
  const [ayah] = await db.select().from(ayahsTable).where(eq(ayahsTable.id, ayahId));
  if (!ayah) {
    res.status(404).json({ error: "Ayah not found" });
    return;
  }
  const [surah] = await db.select().from(surahsTable).where(eq(surahsTable.id, ayah.surahId));

  try {
    const prompt = `Provide a concise scholarly Tafseer (Quranic exegesis) for:

Surah ${surah?.number ?? "?"}:${ayah.ayahNumber} (${surah?.nameTransliterated ?? "Unknown"} — ${surah?.nameEnglish ?? ""})
Arabic: ${ayah.arabicText}
Translation: "${ayah.translation}"

Include:
1. Historical context or occasion of revelation (Asbab al-Nuzul) if known
2. Linguistic/grammatical insights from the Arabic
3. Main scholarly interpretation (based on Ibn Kathir, al-Tabari, or al-Qurtubi)
4. Practical lesson or spiritual wisdom for the believer
5. Connection to other Quranic verses or authentic hadiths if relevant

Keep it scholarly yet accessible, approximately 2-3 paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are an expert Quranic scholar specializing in Tafseer based on the classical works of Ibn Kathir, Imam al-Tabari, Imam al-Qurtubi, and Sayyid Qutb. Provide accurate, scholarly, and spiritually enriching tafseer. Always respond with substantive commentary." },
        { role: "user", content: prompt },
      ],
    });

    const aiText = (completion.choices[0]?.message?.content ?? "").trim();

    if (!aiText) {
      res.status(503).json({ error: "AI returned empty response" });
      return;
    }

    // Cache in DB for future requests
    await db.insert(tafseerTable).values({
      ayahId,
      source: "ai-generated",
      scholarName: "AI Scholar Assistant",
      arabicText: "",
      englishText: aiText,
    }).onConflictDoNothing();

    res.json({
      ayahId,
      source: "ai-generated",
      scholarName: "AI Scholar Assistant",
      arabicText: "",
      englishText: aiText,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "AI service error";
    res.status(500).json({ error: errMsg });
  }
});

// AI Word Analysis — explain an Arabic word in context
router.post("/ai/analyze-word", async (req: Request, res: Response): Promise<void> => {
  const { arabicWord, surahNumber, ayahNumber, context } = req.body as {
    arabicWord: string; surahNumber?: number; ayahNumber?: number; context?: string;
  };

  if (!arabicWord) {
    res.status(400).json({ error: "Arabic word is required" });
    return;
  }

  try {
    const contextStr = context ? `\nFull verse: "${context}"` : "";
    const locationStr = surahNumber ? `\nLocation: Surah ${surahNumber}, Ayah ${ayahNumber}` : "";

    const prompt = `Analyze the Arabic word "${arabicWord}" from the Quran.${locationStr}${contextStr}

Provide:
1. Root word (3 or 4 letter root with Arabic script)
2. Basic meaning and English translation
3. Grammar classification (noun/verb/particle + case/form)
4. Morphological form if it's a verb (form I-X)
5. How this word is used elsewhere in the Quran (1-2 examples)
6. Any significant linguistic or theological insight

Format as a concise structured analysis.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are an expert in Arabic linguistics, Quranic grammar (nahw and sarf), and Quranic morphology. Provide precise, scholarly analysis of Quranic Arabic words." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 512,
    });

    res.json({
      word: arabicWord,
      analysis: completion.choices[0]?.message?.content ?? "",
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "AI service error";
    res.status(500).json({ error: errMsg });
  }
});

// AI Hadith Explanation — explain a hadith's meaning and context
router.get("/ai/hadith-explanation/:hadithId", async (req: Request, res: Response): Promise<void> => {
  const hadithId = parseInt(req.params.hadithId ?? "0", 10);
  if (!hadithId) {
    res.status(400).json({ error: "Invalid hadith ID" });
    return;
  }

  const [hadith] = await db.select().from(hadithsTable).where(eq(hadithsTable.id, hadithId));
  if (!hadith) {
    res.status(404).json({ error: "Hadith not found" });
    return;
  }

  // If sharh already exists, return it
  if (hadith.sharh && hadith.sharh.length > 50) {
    res.json({ hadithId, explanation: hadith.sharh, source: "database" });
    return;
  }

  const collection = await db.select().from(hadithCollectionsTable)
    .where(eq(hadithCollectionsTable.id, hadith.collectionId))
    .then(r => r[0]);

  try {
    const prompt = `Explain this hadith from ${collection?.name ?? hadith.collectionId}, #${hadith.hadithNumber}:

Arabic: ${hadith.arabicText}
Translation: "${hadith.translation}"
Narrator: ${hadith.narrator}
Grade: ${hadith.grade}

Provide:
1. The context and occasion of this hadith (if known)
2. Key linguistic insights from the Arabic text
3. Main scholarly explanation (sharh) — what does it mean practically?
4. Fiqh rulings or ethical principles derived from it
5. Connection to relevant Quranic verses or other hadiths
6. Practical application for a Muslim today

Keep it scholarly, insightful, and approximately 3-4 paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are an expert in Hadith sciences (Ulum al-Hadith), specializing in classical hadith commentary (sharh). Base your explanations on authentic scholarly works like Ibn Hajar al-Asqalani's Fath al-Bari, Imam al-Nawawi's Sharh Muslim, and Ibn Rajab's Jami al-Ulum wal-Hikam." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1024,
    });

    const explanation = completion.choices[0]?.message?.content ?? "";

    res.json({ hadithId, explanation, source: "ai-generated" });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "AI service error";
    res.status(500).json({ error: errMsg });
  }
});

export default router;
