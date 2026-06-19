import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronLeft, ChevronRight, Search, BookOpen, Volume2,
  X, Play, ExternalLink, Palette, Share2, Copy, Repeat,
  ChevronsUp, Target, BookText,
} from "lucide-react";
import { useListSurahs, useListAyahs, useGetAyahWords, getGetAyahWordsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/contexts/audio-player";
import { useSettings } from "@/hooks/use-settings";
import { applyTajweed, TAJWEED_COLORS, TAJWEED_LABELS, type TajweedCategory } from "@/lib/tajweed";
import { shareVerse, copyVerseImage } from "@/lib/verse-share";
import { recordReading } from "@/lib/reading-tracker";

const JUZ_STARTS: Record<number, string> = {
  1: "Al-Fatihah 1", 2: "Al-Baqarah 142", 3: "Al-Baqarah 253",
  4: "Al Imran 92", 5: "An-Nisa 24", 6: "An-Nisa 148",
  7: "Al-Ma'idah 82", 8: "Al-An'am 111", 9: "Al-A'raf 88",
  10: "Al-Anfal 41", 11: "At-Tawbah 93", 12: "Hud 6",
  13: "Yusuf 53", 14: "Al-Hijr 1", 15: "Al-Isra 1",
  16: "Al-Kahf 75", 17: "Al-Anbiya 1", 18: "Al-Mu'minun 1",
  19: "Al-Furqan 21", 20: "An-Naml 56", 21: "Al-Ankabut 46",
  22: "Al-Ahzab 31", 23: "Ya-Sin 28", 24: "Az-Zumar 32",
  25: "Fussilat 47", 26: "Al-Ahqaf 1", 27: "Adh-Dhariyat 31",
  28: "Al-Mujadila 1", 29: "Al-Mulk 1", 30: "An-Naba 1",
};

const SURAHS_WITH_KNOWN_JUZ: Record<number, number> = {
  1: 1, 2: 1, 3: 4, 4: 5, 5: 7, 6: 8, 7: 9, 8: 10, 9: 11,
  10: 11, 11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15,
  19: 16, 20: 16, 21: 17, 22: 17, 23: 18, 24: 18, 25: 19, 26: 19, 27: 20,
  28: 20, 29: 21, 30: 21, 31: 21, 32: 21, 33: 22, 34: 22, 35: 22, 36: 23,
  37: 23, 38: 23, 39: 24, 40: 24, 41: 25, 42: 25, 43: 25, 44: 25, 45: 26,
  46: 26, 47: 26, 48: 26, 49: 27, 50: 27, 51: 27, 52: 27, 53: 27, 54: 27,
  55: 27, 56: 27, 57: 28, 58: 28, 59: 28, 60: 28, 61: 28, 62: 28, 63: 28,
  64: 28, 65: 28, 66: 28, 67: 29, 68: 29, 69: 29, 70: 29, 71: 29, 72: 29,
  73: 29, 74: 29, 75: 29, 76: 29, 77: 29, 78: 30, 79: 30, 80: 30, 81: 30,
  82: 30, 83: 30, 84: 30, 85: 30, 86: 30, 87: 30, 88: 30, 89: 30, 90: 30,
  91: 30, 92: 30, 93: 30, 94: 30, 95: 30, 96: 30, 97: 30, 98: 30, 99: 30,
  100: 30, 101: 30, 102: 30, 103: 30, 104: 30, 105: 30, 106: 30, 107: 30,
  108: 30, 109: 30, 110: 30, 111: 30, 112: 30, 113: 30, 114: 30,
};

const MUSHAF_STYLES = [
  { id: "amiri", label: "Madinah", sublabel: "Hafs · Amiri Quran", family: "'Amiri Quran', serif" },
  { id: "scheherazade", label: "Naskh", sublabel: "Hafs · Scheherazade", family: "'Scheherazade New', serif" },
  { id: "noto-naskh", label: "IndoPak", sublabel: "Hafs · Noto Naskh", family: "'Noto Naskh Arabic', serif" },
] as const;

interface SelectedAyah {
  id: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  surahId: number;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  transliteration?: string;
}

function TajweedText({ text, style, className }: { text: string; style?: React.CSSProperties; className?: string }) {
  const tokens = applyTajweed(text);
  return (
    <span className={className} style={style}>
      {tokens.map((token, i) => (
        <span
          key={i}
          style={{ color: TAJWEED_COLORS[token.category] !== "inherit" ? TAJWEED_COLORS[token.category] : undefined }}
          title={TAJWEED_LABELS[token.category] || undefined}
        >
          {token.text}
        </span>
      ))}
    </span>
  );
}

function toArabicNumeral(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => arabicDigits[parseInt(d)] ?? d).join("");
}

export default function MushafPage() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [showSidebar, setShowSidebar] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [search, setSearch] = useState("");
  const [selectedAyah, setSelectedAyah] = useState<SelectedAyah | null>(null);
  const [showLoopPanel, setShowLoopPanel] = useState(false);
  const [loopStart, setLoopStart] = useState(1);
  const [loopEnd, setLoopEnd] = useState(7);
  const [isSharing, setIsSharing] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const { settings, updateSetting } = useSettings();
  const { play, isPlaying, isCurrentAyah, current, loopRange, setLoopRange } = useAudioPlayer();

  const { data: surahs } = useListSurahs();
  const { data: ayahs, isLoading } = useListAyahs(selectedSurah);

  const activeSurah = surahs?.find((s) => s.number === selectedSurah);

  const arabicFontFamily =
    settings.mushafFont === "scheherazade" ? "'Scheherazade New', serif" :
    settings.mushafFont === "noto-naskh" ? "'Noto Naskh Arabic', serif" :
    "'Amiri Quran', serif";

  const filteredSurahs = surahs?.filter((s) =>
    !search ||
    s.nameTransliterated.toLowerCase().includes(search.toLowerCase()) ||
    s.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number).includes(search)
  );

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setSelectedAyah(null);
    ayahRefs.current.clear();
  }, [selectedSurah]);

  useEffect(() => {
    if (!settings.autoScroll || !current) return;
    if (current.surahId !== activeSurah?.id) return;
    const el = ayahRefs.current.get(current.ayahNumber);
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [current?.ayahNumber, settings.autoScroll, activeSurah?.id]);

  useEffect(() => {
    if (ayahs && activeSurah) {
      recordReading(activeSurah.id, 0);
    }
  }, [activeSurah?.id]);

  const handlePlaySurah = () => {
    if (!ayahs || ayahs.length === 0 || !activeSurah) return;
    play({
      surahId: activeSurah.id,
      surahNumber: activeSurah.number,
      surahName: activeSurah.nameTransliterated,
      ayahNumber: 1,
      arabicText: ayahs[0]?.arabicText ?? "",
      totalAyahs: activeSurah.ayahCount,
    });
  };

  const selectedAyahId = selectedAyah?.id ?? 0;
  const { data: ayahWords, isLoading: wordsLoading } = useGetAyahWords(selectedAyahId, {
    query: { enabled: selectedAyahId > 0, queryKey: getGetAyahWordsQueryKey(selectedAyahId) },
  });

  const handleAyahClick = (ayah: { id: number; ayahNumber: number; arabicText: string; translation: string; transliteration?: string; surahId: number }) => {
    if (!activeSurah) return;
    setSelectedAyah({
      id: ayah.id,
      ayahNumber: ayah.ayahNumber,
      arabicText: ayah.arabicText,
      translation: ayah.translation,
      transliteration: ayah.transliteration,
      surahId: ayah.surahId,
      surahNumber: activeSurah.number,
      surahName: activeSurah.nameTransliterated,
      totalAyahs: activeSurah.ayahCount,
    });
    recordReading(ayah.surahId, 1);
  };

  const handlePlayAyah = (ayah: SelectedAyah) => {
    play({
      surahId: ayah.surahId,
      surahNumber: ayah.surahNumber,
      surahName: ayah.surahName,
      ayahNumber: ayah.ayahNumber,
      arabicText: ayah.arabicText,
      totalAyahs: ayah.totalAyahs,
    });
  };

  const handleSetLoop = () => {
    if (!activeSurah) return;
    setLoopRange({ start: loopStart, end: loopEnd });
    if (activeSurah) {
      play({
        surahId: activeSurah.id,
        surahNumber: activeSurah.number,
        surahName: activeSurah.nameTransliterated,
        ayahNumber: loopStart,
        arabicText: ayahs?.find(a => a.ayahNumber === loopStart)?.arabicText ?? "",
        totalAyahs: activeSurah.ayahCount,
      });
    }
    setShowLoopPanel(false);
  };

  const handleShareAyah = async (ayah: SelectedAyah, mode: "download" | "copy") => {
    setIsSharing(true);
    try {
      const opts = {
        arabicText: ayah.arabicText,
        translation: ayah.translation,
        surahName: ayah.surahName,
        ayahNumber: ayah.ayahNumber,
        surahNumber: ayah.surahNumber,
        arabicFont: arabicFontFamily.split(",")[0]!.replace(/'/g, ""),
      };
      if (mode === "copy") {
        await copyVerseImage(opts);
      } else {
        await shareVerse(opts);
      }
    } catch {
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden relative">
      {/* Sidebar overlay backdrop */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — overlay, never pushes content */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute left-0 top-0 bottom-0 z-30 w-[280px] border-r border-border bg-sidebar shadow-2xl flex flex-col"
          >
        <div className="w-[280px] h-full flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Surah Index</p>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
                title="Close index"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surah..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto premium-scroll">
            {filteredSurahs?.map((s) => (
              <button
                key={s.number}
                onClick={() => setSelectedSurah(s.number)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent/30 transition-all border-b border-border/40",
                  selectedSurah === s.number && "bg-primary/10 border-l-2 border-l-primary"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {s.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold truncate", selectedSurah === s.number ? "text-primary" : "text-foreground")}>
                    {s.nameTransliterated}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.nameEnglish} · {s.ayahCount} verses</p>
                </div>
                <p className="text-sm shrink-0" style={{ fontFamily: arabicFontFamily }} dir="rtl">{s.nameArabic}</p>
              </button>
            ))}
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reader */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-border bg-sidebar/50 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar((v) => !v)}
              title={showSidebar ? "Collapse index" : "Expand index"}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
            >
              {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {activeSurah && (
              <div>
                <p className="text-sm font-semibold text-foreground">{activeSurah.nameTransliterated}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{activeSurah.nameEnglish} · {activeSurah.ayahCount} verses</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Font style pills */}
            <div className="hidden lg:flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 border border-border">
              {MUSHAF_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateSetting("mushafFont", style.id)}
                  title={style.sublabel}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium transition-all",
                    settings.mushafFont === style.id
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Tajweed toggle */}
            <button
              onClick={() => updateSetting("tajweedColoring", !settings.tajweedColoring)}
              title="Toggle Tajweed colors"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                settings.tajweedColoring
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tajweed</span>
            </button>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => updateSetting("autoScroll", !settings.autoScroll)}
              title="Auto-scroll with audio"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                settings.autoScroll
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <ChevronsUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-scroll</span>
            </button>

            {/* Loop range */}
            <button
              onClick={() => setShowLoopPanel((v) => !v)}
              title="Loop verse range"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                loopRange
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <Repeat className="w-3.5 h-3.5" />
              {loopRange ? <span className="hidden sm:inline">{loopRange.start}–{loopRange.end}</span> : <span className="hidden sm:inline">Loop</span>}
            </button>

            {activeSurah && (
              <>
                <span className="text-xs text-muted-foreground hidden md:block px-1">
                  Juz {SURAHS_WITH_KNOWN_JUZ[activeSurah.number] ?? activeSurah.juzNumber}
                </span>
                <button
                  onClick={handlePlaySurah}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isPlaying && current?.surahId === activeSurah.id
                      ? "bg-primary/15 text-primary"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Listen</span>
                </button>
              </>
            )}

            <button disabled={selectedSurah <= 1} onClick={() => setSelectedSurah((v) => Math.max(1, v - 1))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={selectedSurah >= 114} onClick={() => setSelectedSurah((v) => Math.min(114, v + 1))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loop panel */}
        <AnimatePresence>
          {showLoopPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-amber-500/30 bg-amber-500/5"
            >
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5" />Loop Range</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">From</label>
                  <input type="number" min={1} max={activeSurah?.ayahCount ?? 286} value={loopStart} onChange={(e) => setLoopStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
                  <label className="text-xs text-muted-foreground">To</label>
                  <input type="number" min={loopStart} max={activeSurah?.ayahCount ?? 286} value={loopEnd} onChange={(e) => setLoopEnd(Math.max(loopStart, parseInt(e.target.value) || loopStart))}
                    className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
                </div>
                <button onClick={handleSetLoop} className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-all">
                  Start Loop
                </button>
                {loopRange && (
                  <button onClick={() => setLoopRange(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-all">
                    Clear Loop
                  </button>
                )}
                <button onClick={() => setShowLoopPanel(false)} className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tajweed legend */}
        {settings.tajweedColoring && (
          <div className="px-4 py-2 border-b border-border bg-card/50 flex items-center gap-3 flex-wrap text-xs overflow-x-auto no-scrollbar shrink-0">
            <span className="text-muted-foreground font-medium shrink-0">Tajweed:</span>
            {(["qalqalah", "ghunna", "madd", "ikhfa", "idgham", "iqlab"] as TajweedCategory[]).map((cat) => (
              <span key={cat} className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TAJWEED_COLORS[cat] }} />
                <span style={{ color: TAJWEED_COLORS[cat] }}>{TAJWEED_LABELS[cat]}</span>
              </span>
            ))}
          </div>
        )}

        {/* Quran Text */}
        <div ref={contentRef} className="flex-1 overflow-y-auto premium-scroll px-4 md:px-8 lg:px-16 py-8">
          <div className="max-w-3xl mx-auto">
            {activeSurah && (
              <motion.div
                key={selectedSurah}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-flex flex-col items-center gap-2 px-8 py-5 rounded-2xl bg-card border border-border">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest">سُورَة</p>
                  <p className="text-4xl text-foreground" style={{ fontFamily: arabicFontFamily }} dir="rtl">{activeSurah.nameArabic}</p>
                  <p className="text-base font-semibold text-foreground">{activeSurah.nameTransliterated}</p>
                  <p className="text-sm text-muted-foreground">{activeSurah.nameEnglish}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{activeSurah.revelation}</span>
                    <span>·</span>
                    <span>{activeSurah.ayahCount} Verses</span>
                    <span>·</span>
                    <span>Juz {SURAHS_WITH_KNOWN_JUZ[activeSurah.number] ?? activeSurah.juzNumber}</span>
                  </div>
                  <Link href={`/hifz/${activeSurah.number}`}>
                    <button className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all border border-violet-500/20">
                      <Target className="w-3.5 h-3.5" />
                      Practice Hifz
                    </button>
                  </Link>
                </div>

                {activeSurah.number !== 1 && activeSurah.number !== 9 && (
                  <div className="mt-6 text-center">
                    <p className="text-foreground/80" style={{ fontFamily: arabicFontFamily, fontSize: "1.8rem", lineHeight: 2.2 }} dir="rtl">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Loading ayahs...</span>
                </div>
              </div>
            ) : ayahs && ayahs.length > 0 ? (
              <motion.div key={`ayahs-${selectedSurah}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {/* Continuous Arabic flow */}
                <div
                  className="text-right leading-[3.2] mb-8"
                  dir="rtl"
                  style={{ fontFamily: arabicFontFamily, fontSize: `${Math.max(settings.arabicFontSize, 22)}px` }}
                >
                  {ayahs.map((ayah) => (
                    <span
                      key={ayah.id}
                      ref={(el) => { if (el) ayahRefs.current.set(ayah.ayahNumber, el); else ayahRefs.current.delete(ayah.ayahNumber); }}
                    >
                      <span
                        onClick={() => handleAyahClick(ayah)}
                        className={cn(
                          "transition-all cursor-pointer rounded px-0.5",
                          isCurrentAyah(ayah.surahId, ayah.ayahNumber)
                            ? "bg-primary/20 text-primary"
                            : selectedAyah?.ayahNumber === ayah.ayahNumber
                            ? "bg-amber-500/20 text-amber-200"
                            : loopRange && ayah.ayahNumber >= loopRange.start && ayah.ayahNumber <= loopRange.end
                            ? "bg-amber-500/10"
                            : "hover:bg-primary/10"
                        )}
                      >
                        {settings.tajweedColoring ? (
                          <TajweedText text={ayah.arabicText} />
                        ) : (
                          ayah.arabicText
                        )}
                      </span>
                      {" "}
                      <span
                        onClick={() => handleAyahClick(ayah)}
                        className="inline-flex items-center justify-center text-primary text-sm mx-1 cursor-pointer select-none hover:text-primary/70 transition-colors"
                        style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1rem" }}
                      >
                        ۝{toArabicNumeral(ayah.ayahNumber)}
                      </span>
                      {" "}
                    </span>
                  ))}
                </div>

                {/* Translation block */}
                {settings.showMushafTranslation && (
                  <div className="border-t border-border pt-6 mt-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Translation</p>
                    {ayahs.map((ayah) => (
                      <div
                        key={ayah.id}
                        onClick={() => handleAyahClick(ayah)}
                        className={cn(
                          "flex gap-3 cursor-pointer rounded-lg px-2 py-1.5 transition-all group",
                          selectedAyah?.ayahNumber === ayah.ayahNumber
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : "hover:bg-accent/20"
                        )}
                      >
                        <span className="text-xs font-bold text-primary/70 mt-0.5 shrink-0 w-8 text-right">{ayah.ayahNumber}</span>
                        <div className="flex-1">
                          {settings.showMushafTransliteration && (ayah as { transliteration?: string }).transliteration && (
                            <p className="text-xs text-primary/70 mb-1 italic">
                              {(ayah as { transliteration?: string }).transliteration}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors" style={{ fontSize: `${settings.translationFontSize}px` }}>
                            {ayah.translation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No ayahs available for this surah yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ayah detail panel */}
      <AnimatePresence>
        {selectedAyah && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAyah(null)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">{activeSurah?.nameTransliterated}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground font-mono">Verse {selectedAyah.ayahNumber}</span>
                  </div>
                  <button onClick={() => setSelectedAyah(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Arabic */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border mb-4 text-right" dir="rtl">
                  <p className="text-foreground leading-loose" style={{ fontFamily: arabicFontFamily, fontSize: `${Math.max(settings.arabicFontSize, 24)}px`, lineHeight: 2.2 }}>
                    {settings.tajweedColoring ? (
                      <TajweedText text={selectedAyah.arabicText} />
                    ) : selectedAyah.arabicText}
                    {" "}
                    <span className="text-primary" style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1rem" }}>
                      ۝{toArabicNumeral(selectedAyah.ayahNumber)}
                    </span>
                  </p>
                </div>

                {selectedAyah.transliteration && (
                  <p className="text-sm text-primary/70 italic mb-2">{selectedAyah.transliteration}</p>
                )}

                <p className="text-sm text-foreground leading-relaxed mb-5" style={{ fontSize: `${settings.translationFontSize}px` }}>
                  {selectedAyah.translation}
                </p>

                {/* Word by Word */}
                {wordsLoading && (
                  <div className="border-t border-border pt-4 mb-5 flex items-center gap-2 text-muted-foreground">
                    <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">Loading word analysis…</span>
                  </div>
                )}
                {!wordsLoading && ayahWords && ayahWords.length > 0 && (
                  <div className="border-t border-border pt-4 mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookText className="w-3.5 h-3.5 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Word by Word</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end overflow-y-auto premium-scroll max-h-44" dir="rtl">
                      {ayahWords.map((word) => (
                        <div
                          key={word.id}
                          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-default select-none"
                        >
                          <span style={{ fontFamily: arabicFontFamily, fontSize: "1.15rem", lineHeight: 1.6 }} dir="rtl" className="text-foreground">{word.arabicText}</span>
                          <span className="text-[10px] text-primary/70 font-medium italic">{word.transliteration}</span>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">{word.translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePlayAyah(selectedAyah)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      isPlaying && isCurrentAyah(selectedAyah.surahId, selectedAyah.ayahNumber)
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Play className="w-3.5 h-3.5" fill="currentColor" />
                    {isPlaying && isCurrentAyah(selectedAyah.surahId, selectedAyah.ayahNumber) ? "Playing…" : "Play"}
                  </button>

                  <button
                    onClick={() => handleShareAyah(selectedAyah, "download")}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {isSharing ? "Generating…" : "Share Image"}
                  </button>

                  <button
                    onClick={() => handleShareAyah(selectedAyah, "copy")}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Image
                  </button>

                  <Link href={`/quran/${selectedSurah}`} onClick={() => setSelectedAyah(null)}>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Quran Reader
                    </button>
                  </Link>

                  <Link href={`/hifz/${selectedSurah}`} onClick={() => setSelectedAyah(null)}>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all">
                      <Target className="w-3.5 h-3.5" />
                      Memorize
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
