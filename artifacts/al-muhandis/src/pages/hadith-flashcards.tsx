import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, CheckCircle2,
  XCircle, Shuffle, BookMarked, Sparkles, Trophy, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface FlashHadith {
  id: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  collectionId: string;
  collectionName: string;
}

const DECK_OPTIONS = [
  { id: "bukhari", label: "Sahih al-Bukhari", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "ب" },
  { id: "muslim", label: "Sahih Muslim", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "م" },
  { id: "nawawi-40", label: "Forty Hadith (Nawawi)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "٤٠" },
  { id: "abu-dawud", label: "Sunan Abu Dawud", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: "د" },
  { id: "tirmidhi", label: "Jami' at-Tirmidhi", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: "ت" },
  { id: "qudsi", label: "Hadith Qudsi", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", icon: "ق" },
];

const GRADE_COLORS: Record<string, string> = {
  "Sahih": "text-emerald-400 bg-emerald-500/10",
  "Hasan": "text-blue-400 bg-blue-500/10",
  "Hasan Sahih": "text-teal-400 bg-teal-500/10",
  "Da'if": "text-amber-400 bg-amber-500/10",
};

type CardResult = "known" | "unknown" | "skipped";

interface SessionResult { id: string; result: CardResult; }

const STORAGE_KEY = "hadith-flashcard-session";
const UNKNOWN_KEY = "flashcard-unknown-ids";
const DECK_SIZE = 30;

export default function HadithFlashcards() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"pick" | "study" | "complete">("pick");
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashHadith[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const getUnknownNumbers = (deckId: string): number[] => {
    try {
      const stored = JSON.parse(localStorage.getItem(UNKNOWN_KEY) ?? "{}") as Record<string, number[]>;
      return stored[deckId] ?? [];
    } catch { return []; }
  };

  const saveUnknownNumbers = (deckId: string, numbers: number[]) => {
    try {
      const stored = JSON.parse(localStorage.getItem(UNKNOWN_KEY) ?? "{}") as Record<string, number[]>;
      stored[deckId] = numbers;
      localStorage.setItem(UNKNOWN_KEY, JSON.stringify(stored));
    } catch { /* ignore */ }
  };

  const loadDeck = useCallback(async (deckId: string, reviewUnknown = false) => {
    setLoading(true);
    setReviewMode(reviewUnknown);
    try {
      const deckInfo = DECK_OPTIONS.find((d) => d.id === deckId);
      const total = deckId === "nawawi-40" ? 42 : deckId === "qudsi" ? 40 : 25;
      const numbers = Array.from({ length: total }, (_, i) => i + 1);

      // In review mode, prioritize unknown cards from last session
      let sample: number[];
      if (reviewUnknown) {
        const unknownNums = getUnknownNumbers(deckId);
        const unknownSet = new Set(unknownNums);
        const rest = numbers.filter((n) => !unknownSet.has(n)).sort(() => Math.random() - 0.5);
        const prioritized = [...unknownNums, ...rest].slice(0, DECK_SIZE);
        sample = prioritized;
      } else {
        sample = numbers.sort(() => Math.random() - 0.5).slice(0, DECK_SIZE);
      }
      const fetched = await Promise.all(
        sample.map((n) =>
          fetch(`${BASE_URL}/api/hadith/${deckId}:${n}`)
            .then((r) => r.ok ? r.json() as Promise<FlashHadith> : null)
            .catch(() => null)
        )
      );
      const valid = fetched.filter((h): h is FlashHadith => h !== null);
      setCards(valid);
      setCurrentIdx(0);
      setRevealed(false);
      setResults([]);
      setPhase("study");
    } finally {
      setLoading(false);
    }
  }, []);

  const currentCard = cards[currentIdx];
  const progress = cards.length > 0 ? ((currentIdx) / cards.length) * 100 : 0;
  const knownCount = results.filter((r) => r.result === "known").length;
  const unknownCount = results.filter((r) => r.result === "unknown").length;

  const advance = (result: CardResult) => {
    if (!currentCard) return;
    const newResults = [...results, { id: currentCard.id, result }];
    setResults(newResults);
    setRevealed(false);
    if (currentIdx + 1 >= cards.length) {
      if (selectedDeck) saveSession(newResults, selectedDeck);
      setPhase("complete");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const saveSession = (finalResults: SessionResult[], deckId: string) => {
    try {
      const known = finalResults.filter((r) => r.result === "known").length;
      const history: Array<{ deck: string; score: number; total: number; date: number }> = JSON.parse(localStorage.getItem("flashcard-history") ?? "[]") as Array<{ deck: string; score: number; total: number; date: number }>;
      history.push({ deck: deckId, score: known, total: finalResults.length, date: Date.now() });
      localStorage.setItem("flashcard-history", JSON.stringify(history.slice(-50)));

      // Save unknown card hadith numbers for spaced repetition
      const unknownIds = finalResults
        .filter((r) => r.result === "unknown")
        .map((r) => {
          const card = cards.find((c) => c.id === r.id);
          return card ? parseInt(card.hadithNumber) : NaN;
        })
        .filter((n) => !isNaN(n));
      saveUnknownNumbers(deckId, unknownIds);
    } catch { /* ignore */ }
  };

  const restart = () => {
    setPhase("pick");
    setCards([]);
    setCurrentIdx(0);
    setRevealed(false);
    setResults([]);
  };

  const shuffleDeck = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setRevealed(false);
    setResults([]);
    setShuffled(true);
  };

  // Pick phase
  if (phase === "pick") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <button onClick={() => navigate("/hadith")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Hadith Collections
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hadith Flash Cards</h1>
              <p className="text-xs text-muted-foreground">Test your knowledge of prophetic traditions</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-border bg-card mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How it works</p>
            </div>
            <ol className="space-y-1.5">
              {["Pick a collection to study", "See the Arabic text — try to recall the translation", "Reveal to check yourself", "Mark as Known or Review Again", "See your session summary"].map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {(() => {
            const history = (() => { try { return JSON.parse(localStorage.getItem("flashcard-history") ?? "[]") as Array<{ deck: string; score: number; total: number; date: number }>; } catch { return []; } })();
            if (history.length === 0) return null;
            const last3 = history.slice(-3).reverse();
            return (
              <div className="mt-4 mb-6 p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Sessions</p>
                <div className="space-y-2">
                  {last3.map((h, i) => {
                    const deck = DECK_OPTIONS.find((d) => d.id === h.deck);
                    const pct = Math.round((h.score / h.total) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0", deck?.bg ?? "bg-muted", deck?.color ?? "text-muted-foreground")} style={{ fontFamily: "'Amiri Quran', serif" }}>{deck?.icon ?? "?"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{deck?.label ?? h.deck}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("text-xs font-bold", pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-muted-foreground")}>{pct}%</p>
                          <p className="text-[10px] text-muted-foreground">{h.score}/{h.total}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Choose a collection</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DECK_OPTIONS.map((deck) => (
              <motion.button
                key={deck.id}
                onClick={() => { setSelectedDeck(deck.id); void loadDeck(deck.id); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading && selectedDeck === deck.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  deck.bg, deck.border,
                  loading && selectedDeck === deck.id ? "opacity-60" : "hover:shadow-md"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0", deck.bg, deck.color)}
                  style={{ fontFamily: "'Amiri Quran', serif" }}>
                  {deck.icon}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", deck.color)}>{deck.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{DECK_SIZE} cards · randomised</p>
                </div>
                {loading && selectedDeck === deck.id && (
                  <div className="ml-auto w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Complete phase
  if (phase === "complete") {
    const pct = Math.round((knownCount / cards.length) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            {pct >= 70 ? <Trophy className="w-10 h-10 text-amber-400" /> : <Flame className="w-10 h-10 text-orange-400" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Session Complete!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {pct >= 80 ? "Excellent work, masha'Allah!" : pct >= 50 ? "Good effort — keep reviewing!" : "Keep going — practice makes perfect!"}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Known", value: knownCount, color: "text-emerald-400 bg-emerald-500/10" },
              { label: "Review", value: unknownCount, color: "text-amber-400 bg-amber-500/10" },
              { label: "Score", value: `${pct}%`, color: "text-primary bg-primary/10" },
            ].map(({ label, value, color }) => (
              <div key={label} className={cn("rounded-xl p-3 border border-border", color.split(" ")[1])}>
                <p className={cn("text-xl font-bold tabular-nums", color.split(" ")[0])}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {selectedDeck && unknownCount > 0 && (
              <button
                onClick={() => { void loadDeck(selectedDeck, true); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium text-sm hover:bg-amber-500/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Review {unknownCount} Unknown Card{unknownCount !== 1 ? "s" : ""}
              </button>
            )}
            <button onClick={restart}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all">
              <RotateCcw className="w-4 h-4" /> Study Another Deck
            </button>
            <button onClick={() => { setPhase("study"); setCurrentIdx(0); setResults([]); setRevealed(false); void shuffleDeck(); }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-accent/30 transition-all">
              <Shuffle className="w-4 h-4" /> Reshuffle &amp; Repeat
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Study phase
  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={restart} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Decks
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold">{knownCount} ✓</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-amber-400 font-semibold">{unknownCount} ↺</span>
          <span className="text-xs text-muted-foreground ml-2">{currentIdx + 1}/{cards.length}</span>
        </div>
        <button onClick={shuffleDeck} title="Shuffle" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted mb-6 overflow-hidden">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ ease: "easeOut", duration: 0.4 }} />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-card overflow-hidden mb-4"
        >
          {/* Collection tag */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-xs text-muted-foreground font-medium">{currentCard.collectionName} #{currentCard.hadithNumber}</span>
            {currentCard.grade && (
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_COLORS[currentCard.grade] ?? "text-muted-foreground bg-muted")}>
                {currentCard.grade}
              </span>
            )}
          </div>

          {/* Arabic text — always shown */}
          <div className="px-5 py-4 border-y border-border bg-muted/10">
            <p className="text-right leading-loose" dir="rtl"
              style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.2rem", lineHeight: 2.2 }}>
              {currentCard.arabicText}
            </p>
          </div>

          {/* Translation — revealed on tap */}
          <div className="px-5 py-4">
            {revealed ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm text-foreground leading-relaxed">{currentCard.translation}</p>
                {currentCard.narrator && (
                  <p className="text-xs text-muted-foreground mt-3">Narrated by: <span className="text-foreground font-medium">{currentCard.narrator}</span></p>
                )}
              </motion.div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-accent/10 transition-all text-muted-foreground group"
              >
                <Eye className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="text-sm group-hover:text-primary transition-colors">Tap to reveal translation</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            <button
              onClick={() => advance("unknown")}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium text-sm hover:bg-amber-500/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Review Again
            </button>
            <button
              onClick={() => advance("known")}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              I Know This
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      {!revealed && (
        <div className="text-center mt-4">
          <button onClick={() => advance("skipped")} className="text-xs text-muted-foreground hover:text-foreground transition-all px-4 py-2">
            Skip →
          </button>
        </div>
      )}
    </div>
  );
}
