import { useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Eye, EyeOff, BookOpen, RotateCcw, CheckCircle,
  Star, Target, ChevronDown, ChevronUp, Mic, X, Settings2,
} from "lucide-react";
import { useListSurahs, useListAyahs, useGetSurah } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { RecitationRecorder } from "@/components/recitation-recorder";

type PeekState = "hidden" | "peeked" | "correct" | "revealed";

const PEEK_COLORS: Record<PeekState, string> = {
  hidden: "",
  peeked: "bg-amber-500/15 border border-amber-500/30",
  correct: "bg-emerald-500/15 border border-emerald-500/30",
  revealed: "bg-primary/10 border border-primary/20",
};

const PEEK_TEXT_COLORS: Record<PeekState, string> = {
  hidden: "text-transparent select-none",
  peeked: "text-amber-200/90",
  correct: "text-emerald-200/90",
  revealed: "text-foreground/90",
};

export default function HifzPage() {
  const params = useParams<{ surahNumber?: string }>();
  const surahNumber = parseInt(params.surahNumber ?? "1");
  const [mode, setMode] = useState<"setup" | "memorize">("setup");
  const [hideMode, setHideMode] = useState<"full" | "partial">("full");
  const [peekStates, setPeekStates] = useState<Record<number, PeekState>>({});
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(surahNumber);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState<number | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const { settings } = useSettings();
  const { data: surahs } = useListSurahs();
  const { data: surah } = useGetSurah(selectedSurah);
  const { data: ayahs } = useListAyahs(selectedSurah);

  const arabicFont =
    settings.mushafFont === "scheherazade" ? "'Scheherazade New', serif" :
    settings.mushafFont === "noto-naskh" ? "'Noto Naskh Arabic', serif" :
    "'Amiri Quran', serif";

  const filteredAyahs = ayahs?.filter((a) => {
    const end = endAyah ?? (ayahs.length);
    return a.ayahNumber >= startAyah && a.ayahNumber <= end;
  }) ?? [];

  const peekAyah = useCallback((ayahNum: number) => {
    setPeekStates((prev) => {
      const cur = prev[ayahNum];
      if (!cur || cur === "hidden") return { ...prev, [ayahNum]: "peeked" };
      if (cur === "peeked") return { ...prev, [ayahNum]: "correct" };
      if (cur === "correct") return { ...prev, [ayahNum]: "revealed" };
      return { ...prev, [ayahNum]: "hidden" };
    });
  }, []);

  const markCorrect = useCallback((ayahNum: number) => {
    setPeekStates((prev) => ({ ...prev, [ayahNum]: "correct" }));
  }, []);

  const markPeeked = useCallback((ayahNum: number) => {
    setPeekStates((prev) => ({ ...prev, [ayahNum]: "peeked" }));
  }, []);

  const revealAll = useCallback(() => {
    const newStates: Record<number, PeekState> = {};
    for (const a of filteredAyahs) newStates[a.ayahNumber] = "revealed";
    setPeekStates(newStates);
  }, [filteredAyahs]);

  const resetAll = useCallback(() => {
    setPeekStates({});
  }, []);

  const stats = {
    total: filteredAyahs.length,
    correct: Object.values(peekStates).filter((s) => s === "correct").length,
    peeked: Object.values(peekStates).filter((s) => s === "peeked").length,
    revealed: Object.values(peekStates).filter((s) => s === "revealed").length,
  };

  const progressPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  if (mode === "setup") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/quran">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back to Quran
            </button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Memorization Mode</h1>
              <p className="text-sm text-muted-foreground">Hifz practice with peeking and feedback</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Select Surah</p>
              <select
                value={selectedSurah}
                onChange={(e) => { setSelectedSurah(parseInt(e.target.value)); setEndAyah(null); }}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {surahs?.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameTransliterated} ({s.ayahCount} verses)
                  </option>
                ))}
              </select>
            </div>

            {surah && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Verse Range</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From verse</label>
                    <input
                      type="number"
                      min={1}
                      max={surah.ayahCount}
                      value={startAyah}
                      onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To verse</label>
                    <input
                      type="number"
                      min={startAyah}
                      max={surah.ayahCount}
                      value={endAyah ?? surah.ayahCount}
                      onChange={(e) => setEndAyah(Math.max(startAyah, parseInt(e.target.value) || surah.ayahCount))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {endAyah ? endAyah - startAyah + 1 : surah.ayahCount - startAyah + 1} verses selected
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Practice Mode</p>
              <div className="space-y-2">
                {([
                  { id: "full", label: "Full Concealment", desc: "All verses hidden — tap to peek or reveal" },
                  { id: "partial", label: "First Word Visible", desc: "First word shown as a hint" },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setHideMode(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      hideMode === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 shrink-0", hideMode === m.id ? "border-primary bg-primary" : "border-muted-foreground")} />
                    <div>
                      <p className={cn("text-sm font-medium", hideMode === m.id ? "text-primary" : "text-foreground")}>{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show Translation</p>
                <p className="text-xs text-muted-foreground mt-0.5">Display English translation below each verse</p>
              </div>
              <button
                onClick={() => setShowTranslation((v) => !v)}
                className={cn("relative w-11 h-6 rounded-full transition-all", showTranslation ? "bg-primary" : "bg-muted")}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: showTranslation ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>

            <button
              onClick={() => { resetAll(); setMode("memorize"); }}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Start Practice
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMode("setup")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all">
          <ChevronLeft className="w-4 h-4" /> Setup
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{surah?.nameTransliterated}</span>
          <span className="text-xs text-muted-foreground">{startAyah}–{endAyah ?? surah?.ayahCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowRecorder((v) => !v)}
            title="Record your recitation"
            className={cn("p-1.5 rounded-lg transition-all", showRecorder ? "bg-red-500/15 text-red-400" : "text-muted-foreground hover:text-foreground hover:bg-accent/30")}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={resetAll} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all" title="Reset all">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={revealAll} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all" title="Reveal all">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline recorder */}
      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <RecitationRecorder
              surahName={surah?.nameTransliterated}
              onClose={() => setShowRecorder(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> {stats.correct} correct</span>
            <span className="flex items-center gap-1 text-amber-400"><Eye className="w-3.5 h-3.5" /> {stats.peeked} peeked</span>
          </div>
          <span className="text-muted-foreground font-mono">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted-foreground/30" />Hidden — tap to peek</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500/50" />Peeked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500/50" />Correct</span>
      </div>

      {/* Ayahs */}
      <div className="space-y-3">
        {filteredAyahs.map((ayah) => {
          const state = peekStates[ayah.ayahNumber] ?? "hidden";
          return (
            <motion.div
              key={ayah.id}
              layout
              className={cn("rounded-xl p-4 transition-all duration-300", PEEK_COLORS[state] || "border border-border bg-card")}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn("w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center", state === "correct" ? "bg-emerald-500/20 text-emerald-400" : state === "peeked" ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground")}>
                    {ayah.ayahNumber}
                  </div>
                </div>
                <div
                  onClick={() => peekAyah(ayah.ayahNumber)}
                  className={cn(
                    "flex-1 text-right leading-loose cursor-pointer transition-all select-none",
                    PEEK_TEXT_COLORS[state],
                    state === "hidden" && "blur-sm hover:blur-none"
                  )}
                  dir="rtl"
                  style={{ fontFamily: arabicFont, fontSize: `${settings.arabicFontSize}px`, lineHeight: 2 }}
                  title={state === "hidden" ? "Tap to peek" : "Tap to cycle state"}
                >
                  {hideMode === "partial" && state === "hidden"
                    ? ayah.arabicText.split(" ").slice(0, 1).join(" ") + " …"
                    : ayah.arabicText}
                </div>
              </div>

              {showTranslation && state !== "hidden" && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-t border-border/50 pt-2">
                  {ayah.translation}
                </p>
              )}

              {state === "hidden" && (
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => markPeeked(ayah.ayahNumber)} className="flex-1 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Peek
                  </button>
                  <button onClick={() => markCorrect(ayah.ayahNumber)} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> I know it
                  </button>
                </div>
              )}

              {state === "peeked" && (
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => markCorrect(ayah.ayahNumber)} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Got it now
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {stats.correct === stats.total && stats.total > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-lg font-bold text-foreground mb-1">Excellent! All verses recalled!</p>
          <p className="text-sm text-muted-foreground mb-4">You recalled {stats.total} verses without peeking.</p>
          <button onClick={resetAll} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
            Practice Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
