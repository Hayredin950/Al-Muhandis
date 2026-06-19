import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Search, BookOpen, ScrollText, Loader2, Sparkles, Mic, MicOff, Radio } from "lucide-react";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { VoiceSearch } from "@/components/voice-search";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const GRADE_STYLES: Record<string, string> = {
  "Sahih": "bg-emerald-500/15 text-emerald-500",
  "Hasan": "bg-blue-500/15 text-blue-400",
  "Da'if": "bg-amber-500/15 text-amber-500",
  "Mawdu'": "bg-red-500/15 text-red-400",
  "Unknown": "bg-muted text-muted-foreground",
};

type SearchType = "all" | "quran" | "hadith";
type GradeFilter = "all" | "Sahih" | "Hasan" | "Da'if";

const SEARCH_HISTORY_KEY = "search-history";
function loadSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) ?? "[]") as string[]; } catch { return []; }
}
function saveSearchHistory(q: string) {
  try {
    const h = loadSearchHistory();
    const updated = [q, ...h.filter((x) => x !== q)].slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [type, setType] = useState<SearchType>("all");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showSurahVoice, setShowSurahVoice] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(loadSearchHistory);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { data, isFetching } = useSearch(
    { q: submitted, type },
    {
      query: {
        enabled: submitted.length >= 2,
        queryKey: getSearchQueryKey({ q: submitted, type }),
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setSubmitted(query.trim());
      saveSearchHistory(query.trim());
      setSearchHistory(loadSearchHistory());
    }
  };

  const runSearch = (q: string) => {
    setQuery(q);
    setSubmitted(q);
    saveSearchHistory(q);
    setSearchHistory(loadSearchHistory());
  };

  const startVoiceSearch = useCallback(() => {
    setVoiceError(null);
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setVoiceError("Voice search is not supported in your browser.");
      return;
    }
    const rec = new SpeechRecognitionClass();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setIsListening(true);

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        setQuery(transcript.trim());
        setSubmitted(transcript.trim());
      }
      setIsListening(false);
    };
    rec.onerror = () => {
      setVoiceError("Could not capture voice. Please try again.");
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  }, []);

  const stopVoiceSearch = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const TYPES: { value: SearchType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "quran", label: "Quran" },
    { value: "hadith", label: "Hadith" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Unified Search</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Search across the Quran and Hadith collections</p>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a word, phrase, concept..."
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              title={isListening ? "Stop listening" : "Search by voice"}
              className={cn(
                "px-3 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5",
                isListening
                  ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="hidden sm:inline">{isListening ? "Listening…" : "Voice"}</span>
            </button>
            <button type="submit" className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
              Search
            </button>
          </div>
        </form>

        {/* Search history */}
        {!submitted && searchHistory.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Searches</p>
              <button onClick={() => { localStorage.removeItem(SEARCH_HISTORY_KEY); setSearchHistory([]); }}
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((h) => (
                <button key={h} onClick={() => runSearch(h)}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all">
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick topic suggestions */}
        {!submitted && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popular Topics</p>
            <div className="flex flex-wrap gap-2">
              {[
                "prayer", "charity", "patience", "fasting", "paradise", "marriage",
                "knowledge", "honesty", "death", "forgiveness", "tawakkul", "gratitude",
                "dua", "repentance", "parents", "kindness", "anger", "sleep",
              ].map((topic) => (
                <button key={topic} onClick={() => runSearch(topic)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/20 transition-all capitalize">
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Surah Voice Search banner */}
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Find a Surah by voice</p>
            <p className="text-xs text-muted-foreground">Speak a surah name in Arabic or English</p>
          </div>
          <button
            onClick={() => setShowSurahVoice(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all border border-emerald-500/20 flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            Try it
          </button>
        </div>

        {/* Surah voice search modal */}
        <AnimatePresence>
          {showSurahVoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => { if (e.target === e.currentTarget) setShowSurahVoice(false); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                className="w-full max-w-md"
              >
                <VoiceSearch onClose={() => setShowSurahVoice(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {voiceError && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {voiceError}
          </div>
        )}

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5"
          >
            <div className="flex gap-0.5 items-end h-5">
              {[1,2,3,4,5].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-red-400"
                  animate={{ height: [4, 16, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </div>
            <p className="text-xs text-red-400 font-medium">Listening for your search query…</p>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                type === value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {isFetching && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        <AnimatePresence>
          {data && !isFetching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xs text-muted-foreground">{data.total} results for "{data.query}"</p>

              {/* AI Insight */}
              {(data as typeof data & { aiInsight?: string | null }).aiInsight && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">AI Scholar Insight</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {(data as typeof data & { aiInsight?: string }).aiInsight}
                  </p>
                </div>
              )}

              {/* Quran results */}
              {data.ayahs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-foreground">Quran ({data.ayahs.length})</p>
                  </div>
                  <div className="space-y-3">
                    {data.ayahs.map((ayah) => (
                      <Link key={ayah.id} href={`/quran/${ayah.surahId}`}>
                        <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer">
                          <p className="text-right mb-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.1rem", lineHeight: 2 }}>
                            {ayah.arabicText.slice(0, 80)}{ayah.arabicText.length > 80 ? "..." : ""}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ayah.translation}</p>
                          <p className="text-xs text-primary mt-2">{ayah.surahName} · Verse {ayah.ayahNumber}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Hadith results */}
              {data.hadiths.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-semibold text-foreground">Hadith ({data.hadiths.length})</p>
                    </div>
                    {/* Grade filter */}
                    <div className="flex items-center gap-1.5">
                      {(["all", "Sahih", "Hasan", "Da'if"] as GradeFilter[]).map((g) => (
                        <button key={g} onClick={() => setGradeFilter(g)}
                          className={cn("text-xs px-2 py-1 rounded-lg border transition-all",
                            gradeFilter === g ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                          )}>
                          {g === "all" ? "All" : g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.hadiths.filter((h) => gradeFilter === "all" || h.grade === gradeFilter).map((h) => (
                      <Link key={h.id} href={`/hadith/${h.collectionId}/${h.id}`}>
                        <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground font-mono">#{h.hadithNumber}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_STYLES[h.grade] ?? GRADE_STYLES["Unknown"])}>
                              {h.grade}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{h.translation}</p>
                          <p className="text-xs text-primary mt-2">{h.collectionName}</p>
                        </div>
                      </Link>
                    ))}
                    {data.hadiths.filter((h) => gradeFilter === "all" || h.grade === gradeFilter).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No {gradeFilter} hadiths in results</p>
                    )}
                  </div>
                </div>
              )}

              {data.total === 0 && (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">No results found for "{data.query}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try different keywords or check the spelling</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!submitted && (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">Enter a search term to explore Quran and Hadith</p>
            <p className="text-xs text-muted-foreground mt-1">Try: "patience", "prayer", "mercy", "fasting"</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
