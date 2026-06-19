/**
 * Fetches all 6,236 Quran ayahs from the alquran.cloud API
 * and populates the database with complete Arabic text + Sahih International translation.
 *
 * Run: pnpm --filter @workspace/scripts run seed-quran-api
 */
import { db, surahsTable, ayahsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ARABIC_EDITION = "quran-uthmani";
const ENGLISH_EDITION = "en.sahih";
const BASE_URL = "https://api.alquran.cloud/v1";

interface AlquranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

interface AlquranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: AlquranAyah[];
}

interface AlquranResponse {
  code: number;
  data: { surahs: AlquranSurah[] };
}

async function fetchWithRetry(url: string, retries = 3): Promise<AlquranResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json() as Promise<AlquranResponse>;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

async function main() {
  console.log("🌙 Fetching full Quran from alquran.cloud API...\n");

  const surahs = await db.select().from(surahsTable).orderBy(surahsTable.number);
  if (surahs.length < 114) {
    console.error("❌ Run the main seed first: pnpm --filter @workspace/scripts run seed");
    process.exit(1);
  }
  const surahMap: Record<number, number> = {};
  for (const s of surahs) surahMap[s.number] = s.id;

  console.log("📥 Fetching Arabic text (Uthmani script)...");
  const arabicData = await fetchWithRetry(`${BASE_URL}/quran/${ARABIC_EDITION}`);
  console.log(`   ✓ ${arabicData.data.surahs.length} surahs of Arabic text fetched`);

  console.log("📥 Fetching Sahih International translation...");
  const englishData = await fetchWithRetry(`${BASE_URL}/quran/${ENGLISH_EDITION}`);
  console.log(`   ✓ ${englishData.data.surahs.length} surahs of translation fetched\n`);

  // Build a lookup map for English translations
  const engMap: Record<number, string> = {};
  for (const surah of englishData.data.surahs) {
    for (const ayah of surah.ayahs) {
      engMap[ayah.number] = ayah.text;
    }
  }

  // Clear existing ayahs and re-import
  console.log("🗑️  Clearing existing ayahs...");
  await db.delete(ayahsTable);

  let totalInserted = 0;
  for (const surah of arabicData.data.surahs) {
    const surahId = surahMap[surah.number];
    if (!surahId) {
      console.warn(`  ⚠️  Surah ${surah.number} not found in DB — run main seed first`);
      continue;
    }

    const batch = surah.ayahs.map(ayah => ({
      surahId,
      ayahNumber: ayah.numberInSurah,
      arabicText: ayah.text,
      transliteration: "",
      translation: engMap[ayah.number] ?? "",
      juzNumber: ayah.juz,
      pageNumber: ayah.page,
    }));

    // Insert in batches of 50
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      await db.insert(ayahsTable).values(chunk).onConflictDoNothing();
    }
    totalInserted += batch.length;

    if (surah.number % 10 === 0 || surah.number === 114) {
      process.stdout.write(`\r   Progress: Surah ${surah.number}/114 — ${totalInserted} ayahs imported`);
    }
  }

  console.log(`\n\n✅ Complete! ${totalInserted} ayahs imported into the database.`);
  console.log("   The Quran reader now has full text for all 114 surahs.");
  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ API seed failed:", err);
  process.exit(1);
});
