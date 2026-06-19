import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookMarked, List, Search, Bookmark } from "lucide-react";
import {
  useListHadiths,
  useListHadithCollections,
  getListHadithsQueryKey,
  useCreateBookmark,
  useDeleteBookmark,
  useListBookmarks,
  getListBookmarksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface GradeStats {
  collectionId: string;
  gradeStats: Record<string, number>;
  totalHadiths: number;
  hasGradeData: boolean;
}

const GRADE_ORDER = ["Sahih", "Hasan Sahih", "Hasan", "Da'if", "Da'if Jiddan", "Munkar", "Matruk", "Mawdu'", "Mursal", "Munqati'", "Shadh"];
const GRADE_COLORS: Record<string, string> = {
  "Sahih": "bg-emerald-500", "Hasan Sahih": "bg-teal-500", "Hasan": "bg-blue-400",
  "Da'if": "bg-amber-500", "Da'if Jiddan": "bg-orange-500", "Munkar": "bg-red-400",
  "Matruk": "bg-red-500", "Mawdu'": "bg-rose-600", "Mursal": "bg-violet-400",
  "Munqati'": "bg-purple-400", "Shadh": "bg-fuchsia-400",
};
const GRADE_TEXT_COLORS: Record<string, string> = {
  "Sahih": "text-emerald-400", "Hasan Sahih": "text-teal-400", "Hasan": "text-blue-400",
  "Da'if": "text-amber-400", "Da'if Jiddan": "text-orange-400", "Munkar": "text-red-400",
  "Matruk": "text-red-500", "Mawdu'": "text-rose-500", "Mursal": "text-violet-400",
  "Munqati'": "text-purple-400", "Shadh": "text-fuchsia-400",
};

const GRADE_STYLES: Record<string, string> = {
  "Sahih":       "bg-emerald-500/15 text-emerald-500",
  "Hasan":       "bg-blue-500/15 text-blue-400",
  "Hasan Sahih": "bg-teal-500/15 text-teal-400",
  "Da'if":       "bg-amber-500/15 text-amber-500",
  "Da'if Jiddan":"bg-orange-500/15 text-orange-500",
  "Munkar":      "bg-red-500/15 text-red-400",
  "Matruk":      "bg-red-600/15 text-red-500",
  "Mawdu'":      "bg-rose-600/15 text-rose-500",
  "Mursal":      "bg-violet-500/15 text-violet-400",
  "Munqati'":    "bg-purple-500/15 text-purple-400",
  "Shadh":       "bg-fuchsia-500/15 text-fuchsia-400",
  "Mixed":       "bg-amber-500/15 text-amber-400",
  "Unknown":     "bg-muted text-muted-foreground",
};

// All collections served via CDN proxy
const PROXY_COLLECTIONS = new Set([
  "bukhari", "muslim", "abu-dawud", "tirmidhi", "nasai", "ibn-majah", "malik", "nawawi-40", "qudsi",
]);

interface Chapter {
  id: string;
  name: string;
  nameArabic: string;
  range: string;
}

const COLLECTION_CHAPTERS: Record<string, Chapter[]> = {
  "bukhari": [
    { id: "revelation", name: "Revelation", nameArabic: "بَدْءُ الْوَحْيِ", range: "1–7" },
    { id: "iman", name: "Faith (Iman)", nameArabic: "كِتَابُ الإِيمَانِ", range: "8–58" },
    { id: "knowledge", name: "Knowledge", nameArabic: "كِتَابُ الْعِلْمِ", range: "59–134" },
    { id: "wudu", name: "Ablution (Wudu)", nameArabic: "كِتَابُ الْوُضُوءِ", range: "135–247" },
    { id: "ghusl", name: "Bathing (Ghusl)", nameArabic: "كِتَابُ الْغُسْلِ", range: "248–293" },
    { id: "tayammum", name: "Dry Ablution", nameArabic: "كِتَابُ التَّيَمُّمِ", range: "335–350" },
    { id: "salah", name: "Prayer (Salah)", nameArabic: "كِتَابُ الصَّلاَةِ", range: "351–520" },
    { id: "adhan", name: "Call to Prayer", nameArabic: "كِتَابُ الأَذَانِ", range: "585–875" },
    { id: "jumu", name: "Friday Prayer", nameArabic: "كِتَابُ الْجُمُعَةِ", range: "876–941" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "1395–1510" },
    { id: "sawm", name: "Fasting (Sawm)", nameArabic: "كِتَابُ الصَّوْمِ", range: "1891–2004" },
    { id: "hajj", name: "Hajj & Pilgrimage", nameArabic: "كِتَابُ الْحَجِّ", range: "1469–1760" },
    { id: "nikah", name: "Marriage (Nikah)", nameArabic: "كِتَابُ النِّكَاحِ", range: "4776–5114" },
    { id: "tafseer", name: "Quran Commentary", nameArabic: "كِتَابُ التَّفْسِيرِ", range: "4474–4775" },
    { id: "prophets", name: "Stories of Prophets", nameArabic: "كِتَابُ الأَنْبِيَاءِ", range: "3189–3473" },
    { id: "anbiya", name: "Virtues & Manners", nameArabic: "كِتَابُ الأَدَبِ", range: "5740–6059" },
  ],
  "muslim": [
    { id: "iman", name: "Faith (Iman)", nameArabic: "كِتَابُ الإِيمَانِ", range: "1–260" },
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "261–430" },
    { id: "hayd", name: "Menstruation", nameArabic: "كِتَابُ الْحَيْضِ", range: "431–550" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "551–875" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "979–1098" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "1099–1296" },
    { id: "hajj", name: "Hajj", nameArabic: "كِتَابُ الْحَجِّ", range: "1297–1476" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "1400–1596" },
    { id: "dhikr", name: "Dhikr & Dua", nameArabic: "كِتَابُ الذِّكْرِ", range: "6840–7060" },
  ],
  "abu-dawud": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–397" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "398–1064" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "1558–1665" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "2316–2452" },
    { id: "hajj", name: "Pilgrimage", nameArabic: "كِتَابُ الْمَنَاسِكِ", range: "1729–2009" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "2046–2183" },
    { id: "adab", name: "Manners", nameArabic: "كِتَابُ الأَدَبِ", range: "4780–5030" },
    { id: "sunnah", name: "Sunnah", nameArabic: "كِتَابُ السُّنَّةِ", range: "4587–4660" },
  ],
  "tirmidhi": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–148" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "149–464" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصَّوْمِ", range: "682–762" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "617–681" },
    { id: "hajj", name: "Pilgrimage", nameArabic: "كِتَابُ الْحَجِّ", range: "813–970" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "1081–1162" },
    { id: "iman", name: "Faith", nameArabic: "كِتَابُ الإِيمَانِ", range: "2610–2644" },
    { id: "dua", name: "Supplications", nameArabic: "كِتَابُ الدَّعَوَاتِ", range: "3370–3604" },
    { id: "birr", name: "Righteousness & Ties", nameArabic: "كِتَابُ الْبِرِّ", range: "1924–2033" },
  ],
  "nasai": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–330" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "449–981" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "2428–2603" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "2100–2363" },
    { id: "hajj", name: "Hajj", nameArabic: "كِتَابُ الْمَنَاسِكِ", range: "2607–3069" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "3222–3425" },
    { id: "qiyam", name: "Night Prayer", nameArabic: "كِتَابُ قِيَامِ اللَّيْلِ", range: "1580–1638" },
    { id: "janaiz", name: "Funerals", nameArabic: "كِتَابُ الْجَنَائِزِ", range: "1825–2084" },
  ],
  "ibn-majah": [
    { id: "muqaddima", name: "Introduction", nameArabic: "كِتَابُ الْمُقَدِّمَةِ", range: "1–226" },
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "272–671" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "672–1083" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "1783–1849" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "1631–1782" },
    { id: "hajj", name: "Hajj", nameArabic: "كِتَابُ الْمَنَاسِكِ", range: "2884–3090" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "1846–2068" },
    { id: "adab", name: "Manners", nameArabic: "كِتَابُ الأَدَبِ", range: "3641–3779" },
    { id: "fitan", name: "Tribulations", nameArabic: "كِتَابُ الْفِتَنِ", range: "3942–4083" },
  ],
  "malik": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–88" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "89–296" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "582–644" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "645–686" },
    { id: "hajj", name: "Pilgrimage", nameArabic: "كِتَابُ الْحَجِّ", range: "739–960" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "1077–1155" },
    { id: "buyu", name: "Business Transactions", nameArabic: "كِتَابُ الْبُيُوعِ", range: "1298–1385" },
  ],
  "nawawi-40": [
    { id: "foundations", name: "Foundations of Islam", nameArabic: "أُصُولُ الإِسْلاَمِ", range: "1–5" },
    { id: "halal-haram", name: "Halal & Haram", nameArabic: "الْحَلاَلُ وَالْحَرَامُ", range: "6–10" },
    { id: "worship", name: "Worship & Devotion", nameArabic: "الْعِبَادَةُ", range: "11–20" },
    { id: "character", name: "Character & Akhlaq", nameArabic: "الأَخْلاَقُ", range: "21–30" },
    { id: "misc", name: "Miscellaneous", nameArabic: "مُتَنَوِّعَةٌ", range: "31–42" },
  ],
  "qudsi": [
    { id: "all", name: "All Hadith Qudsi", nameArabic: "الأَحَادِيثُ الْقُدْسِيَّةُ", range: "1–40" },
  ],
  "ahmad": [
    { id: "abuBakr", name: "Musnad Abu Bakr", nameArabic: "مُسْنَدُ أَبِي بَكْرٍ", range: "1–105" },
    { id: "umar", name: "Musnad Umar", nameArabic: "مُسْنَدُ عُمَرَ", range: "106–400" },
    { id: "uthman", name: "Musnad Uthman", nameArabic: "مُسْنَدُ عُثْمَانَ", range: "401–550" },
    { id: "ali", name: "Musnad Ali", nameArabic: "مُسْنَدُ عَلِيٍّ", range: "551–1360" },
    { id: "makkiyun", name: "Musnad Makkiyun", nameArabic: "مُسْنَدُ الْمَكِّيِّينَ", range: "14000–16000" },
    { id: "madaniyun", name: "Musnad Madaniyun", nameArabic: "مُسْنَدُ الْمَدَنِيِّينَ", range: "16000–18000" },
  ],
};

function parseRangeStart(range: string): number {
  const m = range.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

export default function HadithCollection() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"hadiths" | "chapters">("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const queryClient = useQueryClient();
  const limit = 20;

  const { data: bookmarks } = useListBookmarks();
  const { mutate: createBookmark } = useCreateBookmark({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() }); },
    },
  });
  const { mutate: deleteBookmark } = useDeleteBookmark({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() }); },
    },
  });
  const hadithBookmarks = (bookmarks ?? []).filter((b) => b.type === "hadith");
  const bookmarkedIds = new Set(hadithBookmarks.map((b) => b.referenceId));

  useEffect(() => {
    if (!collectionId) return;
    fetch(`${BASE_URL}/api/hadith/collection-grade-stats/${collectionId}`)
      .then((r) => r.ok ? r.json() as Promise<GradeStats> : Promise.reject())
      .then(setGradeStats)
      .catch(() => {});
  }, [collectionId]);

  const isProxy = PROXY_COLLECTIONS.has(collectionId ?? "");
  const { data: collectionsData } = useListHadithCollections();
  const collection = collectionsData?.find((c) => c.id === collectionId);
  const chapters: Chapter[] = (collectionId ? COLLECTION_CHAPTERS[collectionId] : undefined) ?? [];

  const { data, isLoading } = useListHadiths(
    collectionId ?? "",
    { page, limit },
    {
      query: {
        enabled: !!collectionId && view === "hadiths",
        queryKey: getListHadithsQueryKey(collectionId ?? "", { page, limit }),
      },
    }
  );

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getHadithLinkId = (hadith: { id: unknown; hadithNumber?: string }) => {
    if (isProxy) return String(hadith.hadithNumber ?? hadith.id);
    return String(hadith.id);
  };

  const filteredHadiths = data?.hadiths.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.translation?.toLowerCase().includes(q) ||
      h.arabicText?.includes(searchQuery) ||
      h.narrator?.toLowerCase().includes(q) ||
      String(h.hadithNumber).includes(searchQuery)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href="/hadith">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Collections
        </button>
      </Link>

      {collection && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">{collection.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{collection.author}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md">{collection.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl" style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">{collection.nameArabic}</p>
                <p className="text-xs text-muted-foreground mt-1">{collection.era}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{collection.totalHadiths.toLocaleString()}</span>
              <span>hadiths</span>
              {chapters.length > 0 && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-foreground">{chapters.length}</span>
                  <span>chapters</span>
                </>
              )}
              {isProxy && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                  Live Data
                </span>
              )}
            </div>

            {/* Grade breakdown bar */}
            {gradeStats && gradeStats.totalHadiths > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Grade Distribution</p>
                {/* Stacked bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden mb-3 gap-px">
                  {GRADE_ORDER.map((grade) => {
                    const count = gradeStats.gradeStats[grade] ?? 0;
                    if (count === 0) return null;
                    const pct = (count / gradeStats.totalHadiths) * 100;
                    return (
                      <div
                        key={grade}
                        title={`${grade}: ${count.toLocaleString()} (${pct.toFixed(1)}%)`}
                        className={cn("transition-all cursor-default", GRADE_COLORS[grade] ?? "bg-muted")}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {GRADE_ORDER.map((grade) => {
                    const count = gradeStats.gradeStats[grade] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={grade}
                        onClick={() => navigate(`/hadith/grade/${encodeURIComponent(grade)}?collection=${encodeURIComponent(collectionId ?? "")}`)}
                        className="flex items-center gap-1.5 cursor-pointer group"
                        title={`Browse ${grade} hadiths`}
                      >
                        <div className={cn("w-2 h-2 rounded-full shrink-0", GRADE_COLORS[grade] ?? "bg-muted")} />
                        <span className={cn("text-[10px] font-medium group-hover:underline", GRADE_TEXT_COLORS[grade] ?? "text-muted-foreground")}>
                          {grade}: {count.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {!gradeStats.hasGradeData && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">Scholarly estimates based on Al-Albani's grading</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Musnad Ahmad notice */}
      {collectionId === "ahmad" && (
        <div className="mb-5 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-400 mb-1">📚 Musnad Ahmad — Unique Structure</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Musnad of Imam Ahmad ibn Hanbal (27,647 hadiths) is organized by Companion (Sahabah) rather than by topic.
            Each chapter (musnad) contains all hadiths narrated by a specific Companion. This is the largest known hadith collection.
            Browse the chapters below to explore hadiths by narrator lineage.
          </p>
        </div>
      )}

      {/* View toggle + search */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {chapters.length > 0 && (
          <>
            <button
              onClick={() => setView("chapters")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                view === "chapters" ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
              )}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Chapters
            </button>
            <button
              onClick={() => { setView("hadiths"); setPage(1); }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                view === "hadiths" ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
              )}
            >
              <List className="w-3.5 h-3.5" />
              All Hadiths
            </button>
          </>
        )}
        {view === "hadiths" && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hadiths..."
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {/* Chapters view */}
      {view === "chapters" && chapters.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {chapters.map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <button
                onClick={() => {
                  if (collectionId && isProxy) {
                    navigate(`/hadith/${collectionId}/chapter/${ch.id}`);
                  } else if (collectionId) {
                    navigate(`/hadith/${collectionId}/chapter/${ch.id}`);
                  } else {
                    setView("hadiths");
                    setPage(1);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{ch.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">{ch.nameArabic}</p>
                  <p className="text-xs text-muted-foreground mt-1">Hadiths {ch.range}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Hadiths view */}
      {view === "hadiths" && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(filteredHadiths ?? data?.hadiths ?? []).map((hadith, i) => {
                const numericId = typeof hadith.id === "number" ? hadith.id : parseInt(String(hadith.id));
                const isBookmarked = !isProxy && !isNaN(numericId) && bookmarkedIds.has(numericId);
                return (
                  <motion.div key={`${hadith.id}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}>
                    <Link href={`/hadith/${collectionId}/${getHadithLinkId(hadith)}`}>
                      <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">#{hadith.hadithNumber}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_STYLES[hadith.grade] ?? GRADE_STYLES["Unknown"])}>
                              {hadith.grade}
                            </span>
                            {hadith.topics?.slice(0, 2).map((t) => (
                              <span key={t} className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isProxy && !isNaN(numericId) && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const numId = parseInt(String(hadith.id), 10);
                              const bm = hadithBookmarks.find((b) => b.referenceId === numId);
                              if (bm) {
                                deleteBookmark({ bookmarkId: bm.id });
                              } else {
                                createBookmark({ data: { type: "hadith", referenceId: numId, title: `${collection?.name ?? collectionId} #${hadith.hadithNumber}`, note: JSON.stringify({ _meta: true, collectionId, hadithNumber: hadith.hadithNumber, collectionName: collection?.name ?? collectionId, translationSnippet: hadith.translation?.slice(0, 160) }) } });
                              }
                                }}
                                className={cn("p-1 rounded-lg transition-all", isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary")}
                                title={isBookmarked ? "Bookmarked" : "Bookmark"}
                              >
                                <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                        {hadith.arabicText && (
                          <p className="text-right text-muted-foreground mb-3" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.1rem", lineHeight: 2 }}>
                            {hadith.arabicText.slice(0, 150)}{hadith.arabicText.length > 150 ? "..." : ""}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{hadith.translation}</p>
                        {hadith.narrator && (
                          <p className="text-xs text-muted-foreground mt-2 truncate">Narrated by {hadith.narrator}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {(filteredHadiths ?? data?.hadiths ?? []).length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {searchQuery ? "No hadiths match your search." : "No hadiths available yet."}
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="text-sm text-muted-foreground px-2">
                  Page <span className="font-semibold text-foreground">{page}</span> of {totalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const val = parseInt((e.currentTarget.elements.namedItem("jumpPage") as HTMLInputElement).value); if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val); }} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Jump to page</span>
                <input name="jumpPage" type="number" min={1} max={totalPages} defaultValue={page}
                  className="w-16 px-2 py-1 rounded-lg border border-border bg-card text-sm text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="submit" className="px-3 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">Go</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
