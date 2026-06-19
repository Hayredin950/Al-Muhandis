import { db, hadithsTable } from "@workspace/db";

const CDN_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

interface CdnHadith {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  grades?: Array<{ name: string; grade: string }>;
  reference?: { book?: number; hadith?: number };
}

interface CdnResponse {
  hadiths: CdnHadith[];
}

function mapGradeString(grade: string): string {
  const g = grade.toLowerCase().trim();
  if (g.includes("mawdu") || g.includes("batil") || g.includes("fabricated")) return "Mawdu'";
  if (g.includes("very daif") || g.includes("very weak") || g.includes("extremely")) return "Da'if";
  if (g.includes("daif") && !g.includes("hasan")) return "Da'if";
  if (g.includes("munkar")) return "Munkar";
  if ((g.includes("hasan") && g.includes("sahih")) || g.includes("hasan sahih")) return "Hasan";
  if (g.includes("hasan")) return "Hasan";
  if (g.includes("sahih") || g.includes("saheeh") || g.includes("authentic")) return "Sahih";
  return "Unknown";
}

function normalizeGrade(grades: Array<{ name: string; grade: string }> | undefined): string {
  if (!grades || grades.length === 0) return "Unknown";
  const preferredScholars = ["Al-Albani", "Shuaib Al Arnaut", "Ahmad Muhammad Shakir", "Zubair Ali Zai"];
  for (const scholar of preferredScholars) {
    const found = grades.find((g) => g.name.toLowerCase().includes(scholar.toLowerCase()));
    if (found) return mapGradeString(found.grade);
  }
  return mapGradeString(grades[0].grade);
}

function extractNarrator(text: string): string {
  if (!text) return "";
  const patterns = [
    /^Narrated\s+(?:by\s+)?([^:]+?):\s/,
    /^([A-Z][a-z]+(?:\s+(?:ibn|bin|bint|al-|al|Abu|Umm|Abd|'Abd|`Abd)[^,:\n]*)?(?:\s+[A-Z][a-z]+)*)\s+(?:narrated|reported):/,
    /^It was narrated from\s+([^:]+?):/,
    /^([A-Z][^,:]+?) said:/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim().slice(0, 200);
  }
  return "";
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (resp.ok) return resp;
      lastErr = new Error(`HTTP ${resp.status} for ${url}`);
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw lastErr;
}

const COLLECTIONS = [
  { cdnId: "tirmidhi", dbId: "tirmidhi" },
  { cdnId: "ibnmajah", dbId: "ibn-majah" },
  { cdnId: "abudawud", dbId: "abu-dawud" },
  { cdnId: "nasai", dbId: "nasai" },
  { cdnId: "malik", dbId: "malik" },
];

async function seedCollection(cdnId: string, dbId: string): Promise<number> {
  console.log(`\n📚 Fetching ${dbId}...`);

  const [engResp, araResp] = await Promise.all([
    fetchWithRetry(`${CDN_BASE}/eng-${cdnId}.min.json`),
    fetchWithRetry(`${CDN_BASE}/ara-${cdnId}.min.json`).catch(() => null),
  ]);

  const engData = (await engResp.json()) as CdnResponse;
  const araData: CdnResponse | null = araResp
    ? await araResp.json().catch(() => null)
    : null;

  const araMap = new Map<number, string>();
  if (araData?.hadiths) {
    for (const h of araData.hadiths) {
      araMap.set(h.hadithnumber, h.text ?? "");
    }
  }

  const hadiths = engData.hadiths;
  console.log(`  ${hadiths.length} hadiths (${araMap.size} with Arabic)`);

  // Collections are confirmed empty; skipping pre-clear

  const BATCH = 100;
  let inserted = 0;

  for (let i = 0; i < hadiths.length; i += BATCH) {
    const batch = hadiths.slice(i, i + BATCH);
    const values = batch.map((h) => ({
      collectionId: dbId,
      hadithNumber: String(h.hadithnumber),
      arabicText: araMap.get(h.hadithnumber) ?? "",
      translation: (h.text ?? "").slice(0, 8000),
      grade: normalizeGrade(h.grades),
      gradeReason: (h.grades ?? []).map((g) => `${g.name}: ${g.grade}`).join(" | ").slice(0, 1000),
      narrator: extractNarrator(h.text ?? ""),
      topics: [] as string[],
      sharh: "",
    }));

    await db.insert(hadithsTable).values(values);
    inserted += batch.length;

    if (i % 500 === 0 || i + BATCH >= hadiths.length) {
      process.stdout.write(`\r  Inserted ${inserted}/${hadiths.length}...`);
    }
  }

  console.log(`\n✓ ${dbId}: ${inserted} hadiths seeded`);

  const grades: Record<string, number> = {};
  for (const h of hadiths) {
    const g = normalizeGrade(h.grades);
    grades[g] = (grades[g] ?? 0) + 1;
  }
  const topGrades = Object.entries(grades)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([g, n]) => `${g}:${n}`)
    .join(", ");
  console.log(`  Grades: ${topGrades}`);

  return inserted;
}

async function main() {
  console.log("🕌 Seeding hadith collections from fawazahmed0 CDN...\n");
  console.log("Collections to seed:", COLLECTIONS.map((c) => c.dbId).join(", "));
  console.log("This may take a few minutes...\n");

  let total = 0;
  for (const { cdnId, dbId } of COLLECTIONS) {
    total += await seedCollection(cdnId, dbId);
  }

  console.log(`\n✨ Done! Seeded ${total.toLocaleString()} hadiths across ${COLLECTIONS.length} collections.`);
  console.log("Grade stats will now show Sahih, Hasan, and Da'if counts correctly.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
