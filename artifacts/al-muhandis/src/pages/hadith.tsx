import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ScrollText, ChevronRight, ShieldCheck, ShieldAlert, ShieldX, AlertCircle, HelpCircle, TriangleAlert, BookMarked, Shuffle } from "lucide-react";
import { useListHadithCollections, useGetHadithSummary } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const GRADE_CONFIG = [
  {
    key: "sahih",
    label: "Ṣaḥīḥ",
    arabic: "صحيح",
    desc: "Authentic",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: ShieldCheck,
  },
  {
    key: "hasan",
    label: "Ḥasan",
    arabic: "حسن",
    desc: "Good",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: ShieldCheck,
  },
  {
    key: "hasanSahih",
    label: "Ḥasan Ṣaḥīḥ",
    arabic: "حسن صحيح",
    desc: "Good/Authentic",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    icon: ShieldCheck,
  },
  {
    key: "daif",
    label: "Ḍaʿīf",
    arabic: "ضعيف",
    desc: "Weak",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: ShieldAlert,
  },
  {
    key: "daifJiddan",
    label: "Ḍaʿīf Jiddan",
    arabic: "ضعيف جداً",
    desc: "Very Weak",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: ShieldAlert,
  },
  {
    key: "munkar",
    label: "Munkar",
    arabic: "منكر",
    desc: "Denounced",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: ShieldX,
  },
  {
    key: "matruk",
    label: "Matrūk",
    arabic: "متروك",
    desc: "Abandoned",
    color: "text-red-500",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
    icon: ShieldX,
  },
  {
    key: "mawdu",
    label: "Mawḍūʿ",
    arabic: "موضوع",
    desc: "Fabricated",
    color: "text-rose-600",
    bg: "bg-rose-600/10",
    border: "border-rose-600/20",
    icon: ShieldX,
  },
  {
    key: "mursal",
    label: "Mursal",
    arabic: "مرسل",
    desc: "Disconnected",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    icon: AlertCircle,
  },
  {
    key: "munqati",
    label: "Munqaṭiʿ",
    arabic: "منقطع",
    desc: "Broken Chain",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: AlertCircle,
  },
  {
    key: "shadh",
    label: "Shādh",
    arabic: "شاذ",
    desc: "Anomalous",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    icon: TriangleAlert,
  },
  {
    key: "unknown",
    label: "Unclassified",
    arabic: "غير مصنف",
    desc: "Grade Unknown",
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
    icon: HelpCircle,
  },
];

const GRADE_DESCRIPTIONS: Record<string, string> = {
  sahih: "A fully authentic hadith — continuous chain of trustworthy narrators with no hidden defects in chain or content.",
  hasan: "A 'good' hadith — chain slightly weaker than Sahih but still acceptable as proof in Islamic law.",
  hasanSahih: "Meets both Sahih and Hasan criteria from multiple chains — highest level of Hasan.",
  daif: "Weak hadith — one or more narrators lacked full reliability or there is a break in the chain.",
  daifJiddan: "Very weak — chain has a severely unreliable narrator; cannot be used as evidence.",
  munkar: "A narration where a weak narrator contradicts a reliable narrator; grade worse than Da'if.",
  matruk: "Abandoned — chain includes a narrator accused of lying or fabrication.",
  mawdu: "Fabricated — scholars have determined this narration to be invented and falsely attributed to the Prophet ﷺ.",
  mursal: "Disconnected — a Tabi'i narrates directly from the Prophet ﷺ without naming the Companion link.",
  munqati: "Broken chain — one or more links between narrators are missing anywhere in the chain.",
  shadh: "Anomalous — a trustworthy narrator contradicts the majority of more reliable narrators.",
  unknown: "Grade not yet determined or scholars have differed without a clear consensus.",
};

interface GradeSummary {
  sahih: number;
  hasan: number;
  daif: number;
  munkar?: number;
  mawdu?: number;
  unknown?: number;
  hasanSahih?: number;
  daifJiddan?: number;
  matruk?: number;
  mursal?: number;
  munqati?: number;
  shadh?: number;
}

// Map GRADE_CONFIG key → URL-safe grade string
const GRADE_KEY_TO_GRADE: Record<string, string> = {
  sahih: "Sahih", hasan: "Hasan", hasanSahih: "Hasan Sahih",
  daif: "Da'if", daifJiddan: "Da'if Jiddan", munkar: "Munkar",
  matruk: "Matruk", mawdu: "Mawdu'", mursal: "Mursal",
  munqati: "Munqati'", shadh: "Shadh", unknown: "Unknown",
};

const RANDOM_POOL = [
  { collectionId: "bukhari", hadithNumber: "1" }, { collectionId: "bukhari", hadithNumber: "6018" },
  { collectionId: "bukhari", hadithNumber: "3" }, { collectionId: "muslim", hadithNumber: "2564" },
  { collectionId: "nawawi-40", hadithNumber: "1" }, { collectionId: "nawawi-40", hadithNumber: "2" },
  { collectionId: "nawawi-40", hadithNumber: "13" }, { collectionId: "nawawi-40", hadithNumber: "17" },
  { collectionId: "nawawi-40", hadithNumber: "34" }, { collectionId: "bukhari", hadithNumber: "2" },
  { collectionId: "muslim", hadithNumber: "131" }, { collectionId: "tirmidhi", hadithNumber: "2516" },
  { collectionId: "abu-dawud", hadithNumber: "4682" }, { collectionId: "ibn-majah", hadithNumber: "224" },
];

export default function HadithPage() {
  const [, navigate] = useLocation();
  const { data: collections, isLoading } = useListHadithCollections();
  const { data: summary } = useGetHadithSummary();

  const grades = summary?.gradeBreakdown as GradeSummary | undefined;

  const goRandom = () => {
    const r = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
    navigate(`/hadith/${r.collectionId}/${r.hadithNumber}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Hadith Collections</h1>
          </div>
          <button onClick={goRandom}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-all">
            <Shuffle className="w-3.5 h-3.5" />
            Random
          </button>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          {summary?.totalCollections ?? "—"} collections · {summary?.totalHadiths?.toLocaleString() ?? "—"} prophetic traditions
        </p>

        {/* Grade breakdown — full authenticity classification system */}
        {grades && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Authenticity Classification (ʿUlūm al-Ḥadīth)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {GRADE_CONFIG.map(({ key, label, arabic, desc, color, bg, border, icon: Icon }) => {
                const count = grades[key as keyof GradeSummary] ?? 0;
                const gradeStr = GRADE_KEY_TO_GRADE[key] ?? key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    title={GRADE_DESCRIPTIONS[key]}
                    onClick={() => count > 0 && navigate(`/hadith/grade/${encodeURIComponent(gradeStr)}`)}
                    className={cn(
                      "rounded-xl border p-3 group transition-all hover:scale-[1.02]",
                      bg, border,
                      count > 0 ? "cursor-pointer hover:shadow-md hover:border-opacity-60" : "cursor-default opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={cn("w-3.5 h-3.5", color)} />
                      <span className={cn("text-lg font-bold tabular-nums", color)}>
                        {count > 0 ? count.toLocaleString() : "—"}
                      </span>
                    </div>
                    <p className={cn("text-xs font-semibold", color)}>{label}</p>
                    <p className="text-xs text-muted-foreground/70" style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">{arabic}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                    {count > 0 && (
                      <p className={cn("text-[10px] font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity", color)}>Click to browse →</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Hover a grade to read its definition · Counts for Abu Dawud, Tirmidhi, Nasa'i &amp; Ibn Majah are scholarly estimates (Al-Albani's Silsilah) · Individual hadith grades load when you open a hadith
            </p>
          </div>
        )}

        {/* Quick tools */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
          <Link href="/hadith/flashcards">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">Flash Cards</p>
                <p className="text-xs text-muted-foreground mt-0.5">Test your hadith knowledge</p>
              </div>
            </div>
          </Link>
          <Link href="/hadith/weak">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <ShieldX className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition-colors">Weak Hadiths</p>
                <p className="text-xs text-muted-foreground mt-0.5">Common unauthentic narrations</p>
              </div>
            </div>
          </Link>
          <button onClick={goRandom}
            className="flex items-center gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all cursor-pointer group text-left">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <Shuffle className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">Surprise Me</p>
              <p className="text-xs text-muted-foreground mt-0.5">Open a random hadith</p>
            </div>
          </button>
        </div>

        {/* Collections */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {collections?.map((col, i) => {
              const gradeColor: Record<string, string> = {
                "Sahih": "text-emerald-500 bg-emerald-500/10",
                "Hasan": "text-blue-400 bg-blue-500/10",
                "Mixed": "text-amber-400 bg-amber-500/10",
                "Unknown": "text-muted-foreground bg-muted/40",
              };
              const gc = (col as { grade?: string }).grade ?? "Unknown";
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <Link href={`/hadith/${col.id}`}>
                    <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/20 transition-all cursor-pointer group">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <p className="text-amber-400 font-bold text-lg" style={{ fontFamily: "'Amiri Quran', serif" }}>
                          {col.nameArabic.slice(0, 1)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{col.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{col.era}</span>
                          {gc && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", gradeColor[gc] ?? "text-muted-foreground bg-muted")}>
                              {gc}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{col.author} · {col.totalHadiths.toLocaleString()} hadiths</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{col.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Amiri Quran', serif" }}>{col.nameArabic}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
