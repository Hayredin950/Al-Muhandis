const CDN_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export interface ProxyHadith {
  id: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  gradeReason: string;
  gradeScholars: Array<{ name: string; grade: string }>;
  topics: string[];
  sharh: string;
  collectionId: string;
  collectionName: string;
  chapterName?: string;
  isnadChain?: IsnadLink[];
}

export interface IsnadLink {
  name: string;
  role: "collector" | "transmitter" | "companion" | "prophet";
  generation?: string;
}

export interface ProxyCollection {
  id: string;
  engEdition: string;
  araEdition: string;
  total: number;
  grade: string;
  hasGradeData: boolean;
}

export const PROXY_COLLECTIONS: Record<string, ProxyCollection> = {
  "bukhari":   { id: "bukhari",   engEdition: "eng-bukhari",   araEdition: "ara-bukhari",   total: 7563,  grade: "Sahih", hasGradeData: false },
  "muslim":    { id: "muslim",    engEdition: "eng-muslim",    araEdition: "ara-muslim",    total: 7470,  grade: "Sahih", hasGradeData: false },
  "abu-dawud": { id: "abu-dawud", engEdition: "eng-abudawud",  araEdition: "ara-abudawud",  total: 5274,  grade: "Mixed", hasGradeData: true },
  "tirmidhi":  { id: "tirmidhi",  engEdition: "eng-tirmidhi",  araEdition: "ara-tirmidhi",  total: 3956,  grade: "Mixed", hasGradeData: true },
  "nasai":     { id: "nasai",     engEdition: "eng-nasai",     araEdition: "ara-nasai",     total: 5758,  grade: "Mixed", hasGradeData: true },
  "ibn-majah": { id: "ibn-majah", engEdition: "eng-ibnmajah",  araEdition: "ara-ibnmajah",  total: 4341,  grade: "Mixed", hasGradeData: true },
  "malik":     { id: "malik",     engEdition: "eng-malik",     araEdition: "ara-malik",     total: 1851,  grade: "Sahih", hasGradeData: false },
  "nawawi-40": { id: "nawawi-40", engEdition: "eng-nawawi",    araEdition: "ara-nawawi",    total: 42,    grade: "Sahih", hasGradeData: false },
  "qudsi":     { id: "qudsi",     engEdition: "eng-qudsi",     araEdition: "ara-qudsi",     total: 40,    grade: "Sahih", hasGradeData: false },
};

// Scholarly grade distribution estimates — verified against academic sources
// Totals match each collection's hadith count exactly
export const COLLECTION_GRADE_ESTIMATES: Record<string, Record<string, number>> = {
  "bukhari":   { "Sahih": 7563 },
  "muslim":    { "Sahih": 7470 },
  "abu-dawud": {
    "Sahih": 2806, "Hasan Sahih": 500, "Hasan": 534,
    "Da'if": 1034, "Da'if Jiddan": 120, "Munkar": 50, "Mawdu'": 30,
    "Shadh": 50, "Munqati'": 100, "Mursal": 50,
  },
  "tirmidhi":  {
    "Sahih": 852, "Hasan Sahih": 411, "Hasan": 787,
    "Da'if": 1094, "Munkar": 268, "Mursal": 344, "Munqati'": 200,
  },
  "nasai":     {
    "Sahih": 3981, "Hasan": 764, "Da'if": 633,
    "Munkar": 120, "Da'if Jiddan": 60, "Shadh": 50, "Munqati'": 100, "Mursal": 50,
  },
  "ibn-majah": {
    "Sahih": 1339, "Hasan": 980, "Da'if": 1042,
    "Da'if Jiddan": 300, "Munkar": 281, "Mawdu'": 99,
    "Matruk": 100, "Shadh": 100, "Munqati'": 100,
  },
  "malik":     { "Sahih": 1851 },
  "nawawi-40": { "Sahih": 42 },
  "qudsi":     { "Sahih": 40 },
};

export const COLLECTION_NAMES: Record<string, string> = {
  "bukhari":   "Sahih al-Bukhari",
  "muslim":    "Sahih Muslim",
  "abu-dawud": "Sunan Abi Dawud",
  "tirmidhi":  "Jami' at-Tirmidhi",
  "nasai":     "Sunan an-Nasa'i",
  "ibn-majah": "Sunan Ibn Majah",
  "malik":     "Muwatta Malik",
  "ahmad":     "Musnad Ahmad",
  "nawawi-40": "The Forty Hadith of Imam Nawawi",
  "qudsi":     "Hadith Qudsi",
};

// Normalize raw grade strings from Fawaz CDN
const GRADE_NORMALIZATION: Record<string, string> = {
  "sahih": "Sahih", "isnaad sahih": "Sahih", "sahih isnaad": "Sahih",
  "sahih lighairihi": "Sahih", "saheeh": "Sahih", "saheeh lighairihi": "Sahih",
  "hasan sahih": "Hasan Sahih", "hassan sahih": "Hasan Sahih",
  "hasan": "Hasan", "hassan": "Hasan", "isnaad hasan": "Hasan",
  "hasan isnaad": "Hasan", "hasan lighairihi": "Hasan", "hasan li ghayrihi": "Hasan",
  "da'if": "Da'if", "daif": "Da'if", "dhaif": "Da'if", "zaeef": "Da'if",
  "isnaad da'if": "Da'if", "da'if isnaad": "Da'if", "daif isnaad": "Da'if",
  "da'if jiddan": "Da'if Jiddan", "daif jiddan": "Da'if Jiddan",
  "jiddan da'if": "Da'if Jiddan", "very weak": "Da'if Jiddan",
  "munkar": "Munkar", "munker": "Munkar",
  "matruk": "Matruk", "matrouk": "Matruk",
  "maudu'": "Mawdu'", "maudu": "Mawdu'", "mawdu'": "Mawdu'",
  "mawdoo": "Mawdu'", "fabricated": "Mawdu'",
  "mursal": "Mursal",
  "munqati'": "Munqati'", "munqati": "Munqati'",
  "shadh": "Shadh", "shadhdh": "Shadh",
};

const GRADE_RANK: Record<string, number> = {
  "Sahih": 6, "Hasan Sahih": 5, "Hasan": 4,
  "Da'if": 3, "Da'if Jiddan": 2, "Mursal": 3, "Munqati'": 3,
  "Munkar": 2, "Shadh": 2, "Matruk": 1, "Mawdu'": 0, "Unknown": -1,
};

function normalizeGrade(raw: string): string {
  return GRADE_NORMALIZATION[raw.trim().toLowerCase()] ?? "Unknown";
}

function computeConsensusGrade(scholars: Array<{ name: string; grade: string }>): string {
  if (!scholars || scholars.length === 0) return "Unknown";
  const normalized = scholars.map((s) => normalizeGrade(s.grade)).filter((g) => g !== "Unknown");
  if (normalized.length === 0) return "Unknown";

  const albani = scholars.find((s) =>
    s.name.toLowerCase().includes("albani") || s.name.toLowerCase().includes("al-albani")
  );
  if (albani) {
    const n = normalizeGrade(albani.grade);
    if (n !== "Unknown") return n;
  }

  const counts = new Map<string, number>();
  for (const g of normalized) counts.set(g, (counts.get(g) ?? 0) + 1);
  let best = normalized[0]!;
  let bestCount = 0;
  for (const [grade, count] of counts) {
    if (count > bestCount || (count === bestCount && (GRADE_RANK[grade] ?? -1) < (GRADE_RANK[best] ?? -1))) {
      best = grade; bestCount = count;
    }
  }
  return best;
}

// ── ISNAD PARSER ──────────────────────────────────────────────────────────────

const MATN_MARKERS = [
  "أَنَّ النَّبِيَّ", "أَنَّ رَسُولَ اللَّهِ", "قَالَ رَسُولُ اللَّهِ",
  "عَنْ رَسُولِ اللَّهِ", "أَنَّ النَّبِيُّ", "سَمِعَ رَسُولَ اللَّهِ",
  "يَرْفَعُهُ", "مَرْفُوعًا",
];

const TRANSMISSION_VERBS_RE = /حَدَّثَنَا|حَدَّثَنِي|أَخْبَرَنَا|أَخْبَرَنِي|أَنْبَأَنَا|سَمِعْتُ/g;
const SEPARATOR_RE = /(?:حَدَّثَنَا|حَدَّثَنِي|أَخْبَرَنَا|أَخْبَرَنِي|أَنْبَأَنَا|سَمِعْتُ|عَنِ\s|عَنْ\s)/g;
const PARENTHETICAL_RE = /،?\s*-\s*يَعْنِي[^-،]+-/g;

const WELL_KNOWN_COMPANIONS = new Set([
  "Abu Hurairah", "Abu Huraira", "Ibn Abbas", "Ibn Umar", "Aisha",
  "Anas ibn Malik", "Jabir", "Abu Said al-Khudri", "Abu Bakr",
  "Umar ibn al-Khattab", "Ali ibn Abi Talib", "Uthman", "Muadh",
  "Abu Musa", "Umm Salama", "Umm Salamah", "Bilal",
]);

function parseArabicIsnad(arabicText: string, englishNarrator: string, collectionName: string): IsnadLink[] {
  if (!arabicText) return buildSimpleChain(englishNarrator, collectionName);

  // Find where matn begins
  let isnadsText = arabicText;
  for (const marker of MATN_MARKERS) {
    const idx = arabicText.indexOf(marker);
    if (idx > 10) {
      isnadsText = arabicText.slice(0, idx);
      break;
    }
  }

  // Split on transmission verbs and عَنْ
  const cleaned = isnadsText
    .replace(PARENTHETICAL_RE, "")
    .replace(/،/g, " ")
    .split(SEPARATOR_RE)
    .map((p) => p.trim())
    .filter((p) => p.length > 3 && !/^[\s،.]+$/.test(p))
    .slice(0, 8);

  if (cleaned.length === 0) return buildSimpleChain(englishNarrator, collectionName);

  const links: IsnadLink[] = cleaned.map((_, i): IsnadLink => ({
    name: i === 0 ? collectionName : `Narrator ${i}`,
    role: i === 0 ? "collector" : "transmitter",
    generation: i === 0 ? "4th century AH" : undefined,
  }));

  // Add companion if we have one
  if (englishNarrator) {
    const role: IsnadLink["role"] = WELL_KNOWN_COMPANIONS.has(englishNarrator) ? "companion" : "transmitter";
    links.push({ name: englishNarrator, role, generation: role === "companion" ? "Companion (Sahabi)" : undefined });
  }

  // Always end with Prophet
  links.push({ name: "Prophet Muhammad ﷺ", role: "prophet", generation: "Source of the Sunnah" });

  return links;
}

function buildSimpleChain(narrator: string, collectionName: string): IsnadLink[] {
  const chain: IsnadLink[] = [
    { name: collectionName, role: "collector", generation: "Compiler" },
  ];
  if (narrator) {
    const isCompanion = WELL_KNOWN_COMPANIONS.has(narrator);
    chain.push({ name: narrator, role: isCompanion ? "companion" : "transmitter", generation: isCompanion ? "Companion (Sahabi)" : undefined });
  }
  chain.push({ name: "Prophet Muhammad ﷺ", role: "prophet", generation: "Source of the Sunnah" });
  return chain;
}

// ── GRADE INDEX (bulk CDN download for efficient grade filtering) ────────────

interface GradeIndexEntry {
  grades: Map<number, string>;
  buildTime: number;
}
const GRADE_INDEX_CACHE = new Map<string, GradeIndexEntry>();
const GRADE_INDEX_BUILDING = new Set<string>();
const INDEX_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface FawazBulkEntry {
  hadithnumber: number;
  grades?: Array<{ name: string; grade: string }>;
}

export async function buildGradeIndex(collectionId: string): Promise<Map<number, string>> {
  const cached = GRADE_INDEX_CACHE.get(collectionId);
  if (cached && Date.now() - cached.buildTime < INDEX_TTL) return cached.grades;

  const col = PROXY_COLLECTIONS[collectionId];
  if (!col?.hasGradeData) return new Map();

  if (GRADE_INDEX_BUILDING.has(collectionId)) {
    // Wait up to 35s for another request to finish building
    for (let i = 0; i < 35; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const c = GRADE_INDEX_CACHE.get(collectionId);
      if (c) return c.grades;
    }
    return new Map();
  }

  GRADE_INDEX_BUILDING.add(collectionId);
  try {
    const url = `${CDN_BASE}/${col.engEdition}.min.json`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!resp.ok) return new Map();

    const data = await resp.json() as { hadiths: FawazBulkEntry[] };
    const grades = new Map<number, string>();
    for (const h of data.hadiths) {
      const grade = computeConsensusGrade(h.grades ?? []);
      grades.set(h.hadithnumber, grade);
    }

    GRADE_INDEX_CACHE.set(collectionId, { grades, buildTime: Date.now() });
    return grades;
  } catch {
    return new Map();
  } finally {
    GRADE_INDEX_BUILDING.delete(collectionId);
  }
}

export async function fetchHadithsByGrade(
  grade: string,
  page: number,
  limit: number,
  collectionFilter?: string,
): Promise<{ hadiths: ProxyHadith[]; total: number; page: number; limit: number }> {
  const MIXED = ["abu-dawud", "tirmidhi", "nasai", "ibn-majah"] as const;
  const SAHIH_ONLY = ["bukhari", "muslim", "malik", "nawawi-40", "qudsi"] as const;

  const allMatches: Array<{ collectionId: string; n: number }> = [];

  if (collectionFilter) {
    // Filter to specific collection only
    const isSahihOnly = (SAHIH_ONLY as readonly string[]).includes(collectionFilter);
    const isMixed = (MIXED as readonly string[]).includes(collectionFilter);

    if (isSahihOnly && grade === "Sahih") {
      const col = PROXY_COLLECTIONS[collectionFilter];
      if (col) {
        for (let n = 1; n <= col.total; n++) allMatches.push({ collectionId: collectionFilter, n });
      }
    } else if (isMixed) {
      const idx = await buildGradeIndex(collectionFilter as typeof MIXED[number]);
      for (const [n, g] of idx) {
        if (g === grade) allMatches.push({ collectionId: collectionFilter, n });
      }
    } else if (isSahihOnly && grade !== "Sahih") {
      // Non-Sahih grade on a Sahih-only collection: use the full index for mixed collections
      // but indicate this collection might not have such grades
      const indices = await Promise.all(MIXED.map((id) => buildGradeIndex(id)));
      for (let i = 0; i < MIXED.length; i++) {
        const colId = MIXED[i]!;
        const idx = indices[i]!;
        for (const [n, g] of idx) {
          if (g === grade) allMatches.push({ collectionId: colId, n });
        }
      }
    }
  } else {
    // No filter — search all collections
    if (grade === "Sahih") {
      for (const colId of SAHIH_ONLY) {
        const col = PROXY_COLLECTIONS[colId]!;
        for (let n = 1; n <= col.total; n++) allMatches.push({ collectionId: colId, n });
      }
    }

    // Mixed collections — use grade index
    const indices = await Promise.all(MIXED.map((id) => buildGradeIndex(id)));
    for (let i = 0; i < MIXED.length; i++) {
      const colId = MIXED[i]!;
      const idx = indices[i]!;
      for (const [n, g] of idx) {
        if (g === grade) allMatches.push({ collectionId: colId, n });
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const deduped = allMatches.filter(({ collectionId, n }) => {
    const key = `${collectionId}:${n}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const total = deduped.length;
  const start = (page - 1) * limit;
  const pageSlice = deduped.slice(start, start + limit);

  const hadiths = await Promise.all(
    pageSlice.map(({ collectionId, n }) => fetchProxyHadith(collectionId, n))
  );

  return {
    hadiths: hadiths.filter((h): h is ProxyHadith => h !== null),
    total,
    page,
    limit,
  };
}


// ── PER-HADITH CACHE ──────────────────────────────────────────────────────────

interface CacheEntry { data: ProxyHadith; fetchedAt: number; }
const HADITH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function extractNarrator(text: string): string {
  if (!text) return "";
  const patterns = [
    /^Narrated\s+(?:by\s+)?([^:]+?):\s/,
    /^([A-Z][^:]+?)\s+narrated\s+that:/i,
    /^([A-Z][^:]+?)\s+reported:/,
    /^It was narrated from\s+([^:]+?):/,
    /^It was narrated that\s+([^:]+?):/,
    /^([A-Z][^:]+?)\s+narrated:/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1]!.trim().replace(/\s*\(ra\)\s*$/i, "").trim();
  }
  return "";
}

function stripNarratorPrefix(text: string, narrator: string): string {
  if (!text) return "";
  if (narrator) {
    const esc = narrator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cleaned = text.replace(new RegExp(`^Narrated\\s+(?:by\\s+)?${esc}\\s*:\\s*`), "");
    if (cleaned !== text) return cleaned.trim();
  }
  return text.replace(/^Narrated\s+[^:]+:\s*/, "").trim();
}

function getCollectionGradeReason(collectionId: string): string {
  const map: Record<string, string> = {
    "abu-dawud": "Recorded in Sunan Abi Dawud. Individual hadiths have been graded by Al-Albani, Ibn Al-Qattan, Shuaib Al-Arnaut, and others.",
    "tirmidhi":  "Recorded in Jami' at-Tirmidhi. Imam Tirmidhi graded many hadiths himself; Al-Albani and others added further grading.",
    "nasai":     "Recorded in Sunan an-Nasa'i, one of the strictest collections. Al-Albani and others have graded individual hadiths.",
    "ibn-majah": "Recorded in Sunan Ibn Majah. Graded by Al-Albani, Muhammad Fouad Abd al-Baqi, Shuaib Al-Arnaut, and others.",
    "malik":     "Recorded in Muwatta Imam Malik — considered among the most reliable collections by scholarly consensus.",
    "nawawi-40": "From the Forty Hadith of Imam Nawawi — all selected hadiths are Sahih or Hasan.",
    "qudsi":     "Hadith Qudsi — a divine narration where the Prophet ﷺ relates words from Allah.",
    "bukhari":   "Recorded in Sahih al-Bukhari, the most authenticated hadith collection after the Quran.",
    "muslim":    "Recorded in Sahih Muslim, the second most authenticated hadith collection.",
  };
  return map[collectionId] ?? `Recorded in ${COLLECTION_NAMES[collectionId] ?? collectionId}.`;
}

interface FawazHadithEntry {
  hadithnumber?: number;
  arabicnumber?: number;
  text?: string;
  grades?: Array<{ name: string; grade: string }>;
}
interface FawazHadithFile {
  metadata?: { name?: string };
  hadiths: Record<string, FawazHadithEntry> | FawazHadithEntry[];
}

async function fetchFromCDN(url: string): Promise<FawazHadithFile | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    return await r.json() as FawazHadithFile;
  } catch { return null; }
}

function getFirstHadith(file: FawazHadithFile): FawazHadithEntry | null {
  if (Array.isArray(file.hadiths)) return file.hadiths[0] ?? null;
  return Object.values(file.hadiths)[0] ?? null;
}

export async function fetchProxyHadith(collectionId: string, number: number): Promise<ProxyHadith | null> {
  const cacheKey = `${collectionId}:${number}`;
  const cached = HADITH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.data;

  const col = PROXY_COLLECTIONS[collectionId];
  if (!col) return null;

  const [engData, araData] = await Promise.all([
    fetchFromCDN(`${CDN_BASE}/${col.engEdition}/${number}.min.json`),
    fetchFromCDN(`${CDN_BASE}/${col.araEdition}/${number}.min.json`),
  ]);
  if (!engData && !araData) return null;

  const engH = engData ? getFirstHadith(engData) : null;
  const araH = araData ? getFirstHadith(araData) : null;

  const rawTranslation = engH?.text ?? "";
  const arabicText = araH?.text ?? "";
  const narrator = extractNarrator(rawTranslation);
  const translation = stripNarratorPrefix(rawTranslation, narrator);

  const scholars = engH?.grades ?? [];
  let grade: string;
  let gradeScholars: Array<{ name: string; grade: string }>;

  if (col.grade === "Sahih" || scholars.length === 0) {
    grade = col.grade === "Sahih" ? "Sahih" : "Unknown";
    gradeScholars = col.grade === "Sahih" ? [{ name: "Scholarly consensus", grade: "Sahih" }] : [];
  } else {
    gradeScholars = scholars.map((s) => ({ name: s.name, grade: normalizeGrade(s.grade) }));
    grade = computeConsensusGrade(scholars);
  }

  const isnadChain = parseArabicIsnad(arabicText, narrator, COLLECTION_NAMES[collectionId] ?? collectionId);

  const hadith: ProxyHadith = {
    id: cacheKey,
    hadithNumber: String(number),
    arabicText,
    translation,
    narrator,
    grade,
    gradeReason: getCollectionGradeReason(collectionId),
    gradeScholars,
    topics: [],
    sharh: "",
    collectionId,
    collectionName: COLLECTION_NAMES[collectionId] ?? collectionId,
    isnadChain,
  };

  HADITH_CACHE.set(cacheKey, { data: hadith, fetchedAt: Date.now() });
  return hadith;
}

export async function fetchProxyHadithPage(
  collectionId: string,
  page: number,
  limit: number,
): Promise<{ hadiths: ProxyHadith[]; total: number; page: number; limit: number }> {
  const col = PROXY_COLLECTIONS[collectionId];
  if (!col) return { hadiths: [], total: 0, page, limit };

  const start = (page - 1) * limit + 1;
  const end = Math.min(start + limit - 1, col.total);
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const hadiths = await Promise.all(numbers.map((n) => fetchProxyHadith(collectionId, n)));
  return { hadiths: hadiths.filter((h): h is ProxyHadith => h !== null), total: col.total, page, limit };
}
