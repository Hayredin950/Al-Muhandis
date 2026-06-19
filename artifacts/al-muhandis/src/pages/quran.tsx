import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { useListSurahs } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const JUZ_GROUPS = [
  { label: "All", value: 0 },
  { label: "Juz 1–5", value: 1, min: 1, max: 5 },
  { label: "Juz 6–10", value: 2, min: 6, max: 10 },
  { label: "Juz 11–15", value: 3, min: 11, max: 15 },
  { label: "Juz 16–20", value: 4, min: 16, max: 20 },
  { label: "Juz 21–25", value: 5, min: 21, max: 25 },
  { label: "Juz 26–30", value: 6, min: 26, max: 30 },
];

export default function Quran() {
  const { data: surahs, isLoading } = useListSurahs();
  const [query, setQuery] = useState("");
  const [juzGroup, setJuzGroup] = useState(0);
  const [revelationType, setRevelationType] = useState<"all" | "Meccan" | "Medinan">("all");

  const filtered = (surahs ?? []).filter((s) => {
    const matchesQuery = s.nameEnglish.toLowerCase().includes(query.toLowerCase()) ||
      s.nameTransliterated.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query);
    const group = JUZ_GROUPS.find((g) => g.value === juzGroup);
    const matchesJuz = !group || group.value === 0 || (s.juzNumber >= (group.min ?? 0) && s.juzNumber <= (group.max ?? 30));
    const matchesRevelation = revelationType === "all" || s.revelation === revelationType;
    return matchesQuery && matchesJuz && matchesRevelation;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">The Holy Quran</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-4">114 Surahs · 6,236 Verses</p>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search surahs by name or number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-5">
          {[
            { label: "All", value: "all" as const },
            { label: "Meccan", value: "Meccan" as const },
            { label: "Medinan", value: "Medinan" as const },
          ].map(({ label, value }) => (
            <button key={value} onClick={() => setRevelationType(value)}
              className={cn("text-xs px-3 py-1 rounded-full border transition-all", revelationType === value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
          <span className="w-px h-5 bg-border self-center mx-1" />
          {JUZ_GROUPS.map((g) => (
            <button key={g.value} onClick={() => setJuzGroup(g.value)}
              className={cn("text-xs px-3 py-1 rounded-full border transition-all", juzGroup === g.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              {g.label}
            </button>
          ))}
        </div>
        {(query || juzGroup !== 0 || revelationType !== "all") && (
          <p className="text-xs text-muted-foreground mb-3">{filtered.length} surah{filtered.length !== 1 ? "s" : ""} shown</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((surah, i) => (
              <motion.div
                key={surah.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.3 }}
              >
                <Link href={`/quran/${surah.number}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/20 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {surah.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{surah.nameTransliterated}</p>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium",
                          surah.revelation === "Meccan"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {surah.revelation === "Meccan" ? "Makkah" : "Madinah"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{surah.nameEnglish} · {surah.ayahCount} verses · Juz {surah.juzNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p
                        className="text-foreground/70"
                        style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.1rem" }}
                        dir="rtl"
                      >
                        {surah.nameArabic}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
