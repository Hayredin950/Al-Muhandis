import { useState, useEffect } from "react";
import { Link, useParams, useSearch } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldX, AlertCircle, HelpCircle, TriangleAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface GradeHadith {
  id: string;
  hadithNumber: string;
  translation: string;
  arabicText: string;
  narrator: string;
  grade: string;
  collectionId: string;
  collectionName: string;
}

interface GradeResult {
  hadiths: GradeHadith[];
  total: number;
  page: number;
  limit: number;
}

const GRADE_CONFIG: Record<string, {
  label: string; arabic: string; description: string;
  color: string; bg: string; border: string; icon: typeof ShieldCheck;
}> = {
  "Sahih":      { label: "Ṣaḥīḥ",      arabic: "صحيح",   description: "Fully authentic — continuous chain of trustworthy narrators, no hidden defects.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: ShieldCheck },
  "Hasan":      { label: "Ḥasan",       arabic: "حسن",    description: "Good — chain slightly weaker than Sahih but acceptable as evidence in Islamic law.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: ShieldCheck },
  "Hasan Sahih":{ label: "Ḥasan Ṣaḥīḥ",arabic: "حسن صحيح", description: "Meets both Sahih and Hasan criteria from multiple chains — highest level of Hasan.", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", icon: ShieldCheck },
  "Da'if":      { label: "Ḍaʿīf",       arabic: "ضعيف",  description: "Weak — a narrator lacked reliability or there is a break in the chain.", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: ShieldAlert },
  "Da'if Jiddan":{ label: "Ḍaʿīf Jiddan",arabic: "ضعيف جداً", description: "Very weak — chain has a severely unreliable narrator; cannot be used as evidence.", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: ShieldAlert },
  "Munkar":     { label: "Munkar",       arabic: "منكر",  description: "Denounced — a weak narrator contradicts a reliable one.", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: ShieldX },
  "Matruk":     { label: "Matrūk",      arabic: "متروك", description: "Abandoned — narrator accused of lying or fabrication.", color: "text-red-500", bg: "bg-red-600/10", border: "border-red-600/30", icon: ShieldX },
  "Mawdu'":     { label: "Mawḍūʿ",      arabic: "موضوع", description: "Fabricated — scholars determined this was invented and falsely attributed to the Prophet ﷺ.", color: "text-rose-500", bg: "bg-rose-600/10", border: "border-rose-600/30", icon: ShieldX },
  "Mursal":     { label: "Mursal",       arabic: "مرسل",  description: "Disconnected — a Tabi'i narrates directly from the Prophet ﷺ skipping the Companion link.", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: AlertCircle },
  "Munqati'":   { label: "Munqaṭiʿ",    arabic: "منقطع", description: "Broken chain — one or more links between narrators are missing.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: AlertCircle },
  "Shadh":      { label: "Shādh",        arabic: "شاذ",   description: "Anomalous — a trustworthy narrator contradicts the majority of more reliable narrators.", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", icon: TriangleAlert },
  "Unknown":    { label: "Unclassified", arabic: "غير مصنف", description: "Grade not determined or scholars differed without clear consensus.", color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", icon: HelpCircle },
};

const GRADE_STYLES: Record<string, string> = {
  "Sahih": "text-emerald-400 bg-emerald-500/10",
  "Hasan": "text-blue-400 bg-blue-500/10",
  "Hasan Sahih": "text-teal-400 bg-teal-500/10",
  "Da'if": "text-amber-500 bg-amber-500/10",
  "Da'if Jiddan": "text-orange-500 bg-orange-500/10",
  "Munkar": "text-red-400 bg-red-500/10",
  "Matruk": "text-red-500 bg-red-600/10",
  "Mawdu'": "text-rose-500 bg-rose-600/10",
  "Mursal": "text-violet-400 bg-violet-500/10",
  "Munqati'": "text-purple-400 bg-purple-500/10",
  "Shadh": "text-fuchsia-400 bg-fuchsia-500/10",
};

export default function HadithGradePage() {
  const { grade: rawGrade } = useParams<{ grade: string }>();
  const grade = decodeURIComponent(rawGrade ?? "");
  const config = GRADE_CONFIG[grade] ?? GRADE_CONFIG["Unknown"]!;
  const Icon = config.icon;

  const searchStr = useSearch();
  const collection = new URLSearchParams(searchStr).get("collection") ?? "";

  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    setLoading(true);
    setResult(null);
    const isFirstPage = page === 1;
    if (isFirstPage) setIndexing(true);

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (collection) params.set("collection", collection);

    fetch(`${BASE_URL}/api/hadith/by-grade/${encodeURIComponent(grade)}?${params.toString()}`)
      .then((r) => r.ok ? r.json() as Promise<GradeResult> : Promise.reject())
      .then((data) => { setResult(data); setLoading(false); setIndexing(false); })
      .catch(() => { setLoading(false); setIndexing(false); });
  }, [grade, page, collection]);

  const totalPages = result ? Math.ceil(result.total / limit) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href="/hadith">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Hadith Collections
        </button>
      </Link>

      {/* Grade header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className={cn("rounded-2xl border p-6", config.bg, config.border)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-5 h-5", config.color)} />
                <h1 className={cn("text-xl font-bold", config.color)}>{config.label}</h1>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{config.description}</p>
              {result && (
                <p className="text-xs text-muted-foreground mt-2">
                  <span className={cn("font-semibold", config.color)}>{result.total.toLocaleString()}</span> hadiths found{collection ? ` in ${collection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}` : " across all collections"}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-3xl", config.color)} style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">
                {config.arabic}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Indexing notice */}
      {indexing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          <p className="text-xs text-amber-400">
            Building grade index from {grade === "Sahih" ? "all collections" : "Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah"} — this may take 15–30 seconds on first load, then it's cached.
          </p>
        </motion.div>
      )}

      {/* Hadiths */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : result?.hadiths.length === 0 ? (
        <div className="py-12 text-center">
          <Icon className="w-10 h-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">No hadiths found for this grade in the graded collections.</p>
          {grade === "Mawdu'" && (
            <div className="mt-4 max-w-sm mx-auto text-left p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <p className="text-xs font-semibold text-rose-400 mb-1">Why is this empty?</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Fabricated (Mawḍūʿ) hadiths are intentionally excluded from the canonical collections (Bukhari, Muslim, Abu Dawud, etc.). They exist only in specialized works by hadith scholars cataloguing fabrications to warn Muslims.
              </p>
              <Link href="/hadith/weak">
                <button className="text-xs text-rose-400 hover:underline font-medium">
                  Browse Weak Hadith Encyclopedia →
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {result?.hadiths.map((hadith, i) => (
            <motion.div
              key={hadith.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/hadith/${hadith.collectionId}/${hadith.hadithNumber}`}>
                <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {hadith.collectionName} #{hadith.hadithNumber}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_STYLES[hadith.grade] ?? "text-muted-foreground bg-muted")}>
                        {hadith.grade}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  {hadith.arabicText && (
                    <p className="text-right text-muted-foreground mb-3 leading-loose" dir="rtl"
                      style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.05rem" }}>
                      {hadith.arabicText.slice(0, 120)}{hadith.arabicText.length > 120 ? "..." : ""}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{hadith.translation}</p>
                  {hadith.narrator && (
                    <p className="text-xs text-muted-foreground mt-2">Narrated by {hadith.narrator}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-sm text-muted-foreground px-2">
            Page <span className="font-semibold text-foreground">{page}</span> of {totalPages.toLocaleString()}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 transition-all"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Other grades quick nav */}
      <div className="mt-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Browse Other Grades</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(GRADE_CONFIG).filter(([g]) => g !== grade && g !== "Unknown").slice(0, 6).map(([g, cfg]) => {
            const GradeIcon = cfg.icon;
            return (
              <Link key={g} href={`/hadith/grade/${encodeURIComponent(g)}`}>
                <div className={cn("flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:opacity-80", cfg.bg, cfg.border)}>
                  <GradeIcon className={cn("w-3.5 h-3.5 shrink-0", cfg.color)} />
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold truncate", cfg.color)}>{cfg.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif" }}>{cfg.arabic}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
