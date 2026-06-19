import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useListHadithCollections } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const GRADE_STYLES: Record<string, string> = {
  "Sahih": "bg-emerald-500/15 text-emerald-500",
  "Hasan": "bg-blue-500/15 text-blue-400",
  "Da'if": "bg-amber-500/15 text-amber-500",
  "Mawdu'": "bg-red-500/15 text-red-400",
  "Unknown": "bg-muted text-muted-foreground",
  "Mixed": "bg-violet-500/15 text-violet-400",
};

interface ChapterDef {
  id: string;
  name: string;
  nameArabic: string;
  range: string;
}

const COLLECTION_CHAPTERS: Record<string, ChapterDef[]> = {
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
  ],
  "nasai": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–330" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "449–981" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "2428–2603" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "2100–2363" },
    { id: "hajj", name: "Hajj", nameArabic: "كِتَابُ الْمَنَاسِكِ", range: "2607–3069" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "3222–3425" },
    { id: "qiyam", name: "Night Prayer", nameArabic: "كِتَابُ قِيَامِ اللَّيْلِ", range: "1580–1638" },
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
  ],
  "malik": [
    { id: "tahara", name: "Purification", nameArabic: "كِتَابُ الطَّهَارَةِ", range: "1–88" },
    { id: "salah", name: "Prayer", nameArabic: "كِتَابُ الصَّلاَةِ", range: "89–296" },
    { id: "zakat", name: "Zakat", nameArabic: "كِتَابُ الزَّكَاةِ", range: "582–644" },
    { id: "sawm", name: "Fasting", nameArabic: "كِتَابُ الصِّيَامِ", range: "645–686" },
    { id: "hajj", name: "Pilgrimage", nameArabic: "كِتَابُ الْحَجِّ", range: "739–960" },
    { id: "nikah", name: "Marriage", nameArabic: "كِتَابُ النِّكَاحِ", range: "1077–1155" },
  ],
  "nawawi-40": [
    { id: "foundations", name: "Foundations of Islam", nameArabic: "أُصُولُ الإِسْلاَمِ", range: "1–5" },
    { id: "halal-haram", name: "Halal & Haram", nameArabic: "الْحَلاَلُ وَالْحَرَامُ", range: "6–10" },
    { id: "worship", name: "Worship & Devotion", nameArabic: "الْعِبَادَةُ", range: "11–20" },
    { id: "character", name: "Character & Akhlaq", nameArabic: "الأَخْلاَقُ", range: "21–30" },
    { id: "misc", name: "Miscellaneous", nameArabic: "مُتَنَوِّعَةٌ", range: "31–42" },
  ],
};

function parseRange(range: string): { from: number; to: number } {
  const m = range.match(/^(\d+)[–\-](\d+)$/);
  if (m) return { from: parseInt(m[1], 10), to: parseInt(m[2], 10) };
  const s = parseInt(range, 10);
  return { from: s, to: s };
}

const PROXY_COLLECTIONS = new Set([
  "bukhari", "muslim", "abu-dawud", "tirmidhi", "nasai", "ibn-majah", "malik", "nawawi-40", "qudsi",
]);

interface HadithItem {
  id: string | number;
  hadithNumber: string;
  arabicText?: string;
  translation?: string;
  narrator?: string;
  grade?: string;
  collectionId?: string;
}

export default function HadithChapter() {
  const { collectionId, chapterId } = useParams<{ collectionId: string; chapterId: string }>();
  const { data: collectionsData } = useListHadithCollections();
  const collection = collectionsData?.find((c) => c.id === collectionId);
  const chapters = COLLECTION_CHAPTERS[collectionId ?? ""] ?? [];
  const chapter = chapters.find((c) => c.id === chapterId);
  const isProxy = PROXY_COLLECTIONS.has(collectionId ?? "");

  const { from, to } = chapter ? parseRange(chapter.range) : { from: 0, to: 0 };

  const { data, isLoading } = useQuery<{ hadiths: HadithItem[]; total: number }>({
    queryKey: ["chapter-hadiths", collectionId, chapterId],
    queryFn: async () => {
      const resp = await fetch(
        `${BASE_URL}/api/hadith/collections/${collectionId}/chapter-hadiths?from=${from}&to=${to}`
      );
      if (!resp.ok) throw new Error("Failed to fetch");
      return resp.json() as Promise<{ hadiths: HadithItem[]; total: number }>;
    },
    enabled: !!collectionId && !!chapterId && from > 0,
    staleTime: 5 * 60 * 1000,
  });

  const getHadithLink = (h: HadithItem) => {
    if (isProxy) return `/hadith/${collectionId}/${h.hadithNumber}`;
    return `/hadith/${collectionId}/${h.id}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href={`/hadith/${collectionId ?? ""}`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {collection?.name ?? "Collection"}
        </button>
      </Link>

      {chapter && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {collection?.name}
                </p>
                <h1 className="text-xl font-bold text-foreground">{chapter.name}</h1>
                <p className="text-xs text-muted-foreground mt-2">
                  Hadiths {chapter.range} · {to - from + 1} narrations
                </p>
              </div>
              <p
                className="text-2xl text-foreground/80 shrink-0"
                style={{ fontFamily: "'Amiri Quran', serif" }}
                dir="rtl"
              >
                {chapter.nameArabic}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Loading {to - from + 1} hadiths from the CDN…</p>
          <p className="text-xs">This may take a moment for large chapters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.hadiths ?? []).map((hadith, i) => (
            <motion.div
              key={`${hadith.id}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.3 }}
            >
              <Link href={getHadithLink(hadith)}>
                <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        #{hadith.hadithNumber}
                      </span>
                      {hadith.grade && hadith.grade !== "Unknown" && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_STYLES[hadith.grade] ?? GRADE_STYLES["Unknown"])}>
                          {hadith.grade}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  {hadith.arabicText && (
                    <p
                      className="text-right text-foreground/80 mb-3 leading-loose"
                      dir="rtl"
                      style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.05rem", lineHeight: 2 }}
                    >
                      {hadith.arabicText.slice(0, 180)}{hadith.arabicText.length > 180 ? "…" : ""}
                    </p>
                  )}
                  {hadith.translation && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {hadith.translation}
                    </p>
                  )}
                  {hadith.narrator && (
                    <p className="text-xs text-muted-foreground mt-2">Narrated by {hadith.narrator}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}

          {(data?.hadiths ?? []).length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No hadiths found for this chapter range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
