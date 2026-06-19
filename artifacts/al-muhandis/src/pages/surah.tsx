import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Bookmark, X, ChevronDown, ChevronUp,
  Play, Pause, Pencil, Check, Trash2, Volume2, Palette, Target,
  Loader2, RefreshCw, BookOpen, Maximize2, Minimize2,
} from "lucide-react";
import { applyTajweed, TAJWEED_COLORS } from "@/lib/tajweed";
import {
  useGetSurah,
  useListAyahs,
  useGetAyahWords,
  useGetAyahTafseer,
  useGetAyahRelatedHadiths,
  useCreateBookmark,
  useDeleteBookmark,
  useListBookmarks,
  getListBookmarksQueryKey,
  getGetAyahWordsQueryKey,
  getGetAyahTafseerQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/contexts/audio-player";
import { useSettings } from "@/hooks/use-settings";
import { useNote } from "@/hooks/use-notes";

type WordData = {
  id: number;
  position: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  rootWord: string;
  grammar: string;
};

function WordPopup({ word, onClose }: { word: WordData; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 6 }}
      className="relative z-10 mb-3"
    >
      <div className="bg-card border border-primary/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.6rem", lineHeight: 1.8 }} dir="rtl" className="text-foreground">{word.arabicText}</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-all ml-2 shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm font-medium text-primary mb-1">{word.transliteration}</p>
        <p className="text-sm text-foreground mb-3">"{word.translation}"</p>
        <div className="space-y-1.5 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Root</span>
            <span className="text-foreground font-medium" style={{ fontFamily: "'Amiri Quran', serif" }}>{word.rootWord}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Grammar</span>
            <span className="text-foreground font-medium">{word.grammar}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NoteEditor({
  ayahId,
  onClose,
}: {
  ayahId: number;
  onClose: () => void;
}) {
  const { note, saveNote, deleteNote } = useNote("ayah", ayahId);
  const [draft, setDraft] = useState(note?.text ?? "");

  const handleSave = () => {
    saveNote(draft);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
        <p className="text-xs font-semibold text-primary mb-2">Your Note</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a personal note or reflection…"
          className="w-full text-sm text-foreground bg-transparent resize-none outline-none placeholder:text-muted-foreground leading-relaxed min-h-[72px]"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <button
            onClick={() => { deleteNote(); onClose(); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-all px-2 py-1 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-all"
            >
              <Check className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const TAFSEER_SOURCES = [
  {
    id: "ai-generated",
    label: "AI",
    labelAr: "الذكاء الاصطناعي",
    scholar: "Al-Muhandis AI",
    scholarAr: "نظام الذكاء الاصطناعي",
    era: "Contemporary",
    known: "Scholarly synthesis of Ibn Kathir, al-Tabari & al-Qurtubi",
    color: "text-primary",
    activeBg: "bg-primary/15",
    border: "border-primary/40",
    dot: "bg-primary",
    isArabic: false,
  },
  {
    id: "ar.jalalayn",
    label: "الجلالين",
    labelAr: "تفسير الجلالين",
    scholar: "Jalal al-Mahalli & al-Suyuti",
    scholarAr: "جلال الدين المحلي والسيوطي",
    era: "9th–10th Century AH",
    known: "Word-by-word classical commentary",
    color: "text-amber-400",
    activeBg: "bg-amber-500/15",
    border: "border-amber-400/40",
    dot: "bg-amber-400",
    isArabic: true,
  },
  {
    id: "ar.muyassar",
    label: "الميسر",
    labelAr: "تفسير الميسر",
    scholar: "King Fahad Quran Complex",
    scholarAr: "مجمع الملك فهد",
    era: "Contemporary (1418 AH)",
    known: "Simplified modern Arabic tafseer",
    color: "text-emerald-400",
    activeBg: "bg-emerald-500/15",
    border: "border-emerald-400/40",
    dot: "bg-emerald-400",
    isArabic: true,
  },
  {
    id: "ar.qurtubi",
    label: "القرطبي",
    labelAr: "تفسير القرطبي",
    scholar: "Imam Muhammad al-Qurtubi",
    scholarAr: "الإمام القرطبي",
    era: "671 AH (1273 CE)",
    known: "Comprehensive juristic & linguistic commentary",
    color: "text-rose-400",
    activeBg: "bg-rose-500/15",
    border: "border-rose-400/40",
    dot: "bg-rose-400",
    isArabic: true,
  },
  {
    id: "ar.miqbas",
    label: "المقباس",
    labelAr: "تنوير المقباس",
    scholar: "Attributed to Ibn Abbas (RA)",
    scholarAr: "ابن عباس رضي الله عنه",
    era: "Companion of the Prophet ﷺ",
    known: "Earliest tafseer tradition",
    color: "text-violet-400",
    activeBg: "bg-violet-500/15",
    border: "border-violet-400/40",
    dot: "bg-violet-400",
    isArabic: true,
  },
  {
    id: "en.ibn-kathir",
    label: "Ibn Kathir",
    labelAr: "ابن كثير",
    scholar: "Imam Ibn Kathir",
    scholarAr: "الإمام ابن كثير",
    era: "774 AH (1373 CE)",
    known: "Tafsir Ibn Kathir — classical Sunni commentary",
    color: "text-sky-400",
    activeBg: "bg-sky-500/15",
    border: "border-sky-400/40",
    dot: "bg-sky-400",
    isArabic: false,
  },
  {
    id: "am.sadiq",
    label: "ቁርኣን አማርኛ",
    labelAr: "الأمهرية",
    scholar: "Sadiq & Sani Habib",
    scholarAr: "صادق وسني حبيب",
    era: "Modern Amharic Translation",
    known: "Amharic Quran translation",
    color: "text-teal-400",
    activeBg: "bg-teal-500/15",
    border: "border-teal-400/40",
    dot: "bg-teal-400",
    isArabic: false,
  },
] as const;

type TafseerSourceId = (typeof TAFSEER_SOURCES)[number]["id"];

// Detects if a string is predominantly Arabic script
function isArabicText(text: string): boolean {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  return arabicChars / text.length > 0.35;
}

// Parse Ibn Kathir HTML into structured segments for rich rendering
type TafseerSegment =
  | { type: "heading"; text: string }
  | { type: "arabic"; text: string }
  | { type: "para"; text: string };

function parseIbnKathirHtml(html: string): TafseerSegment[] {
  const segments: TafseerSegment[] = [];
  // Extract tags sequentially
  const tagRe = /<(h2|p)>([\s\S]*?)<\/(h2|p)>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    const tag = match[1];
    const rawContent = match[2] ?? "";
    // Strip any inner HTML tags (e.g. <b>, <i>, <strong>)
    const text = rawContent.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    if (tag === "h2") {
      segments.push({ type: "heading", text });
    } else {
      segments.push({ type: isArabicText(text) ? "arabic" : "para", text });
    }
  }
  return segments;
}

// Smart paragraph splitter for plain Arabic classical tafseer text
function ArabicTafseerContent({
  text,
  color,
  scholarAr,
  known,
}: {
  text: string;
  color: string;
  scholarAr: string;
  known: string;
}) {
  // Split on natural Arabic sentence boundaries: period, semicolon, colon-preceded headers
  // Detect section labels like "الأولى :", "المسألة الأولى :" etc.
  const sectionRe = /(?:المسألة\s+)?(?:الأول[ىة]|الثانية|الثالثة|الرابعة|الخامسة)\s*:/g;

  // First tag section headings
  const withMarkers = text.replace(sectionRe, (match) => `\n\n§HEADING§${match}`);

  // Split into raw chunks by double-space-period or double newlines
  const rawParts = withMarkers.split(/\n\n/);

  const paragraphs: { heading?: string; body: string }[] = [];
  let currentBody = "";

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("§HEADING§")) {
      if (currentBody.trim()) {
        paragraphs.push({ body: currentBody.trim() });
        currentBody = "";
      }
      const headingText = trimmed.replace("§HEADING§", "").trim();
      // Separate heading label from the rest
      const colonIdx = headingText.indexOf(":");
      const heading = colonIdx >= 0 ? headingText.slice(0, colonIdx + 1) : headingText;
      const rest = colonIdx >= 0 ? headingText.slice(colonIdx + 1).trim() : "";
      paragraphs.push({ heading, body: rest });
    } else {
      // Accumulate — split long chunks by ". " every ~250 chars
      const sentences = trimmed.split(/(?<=[.؟!])\s+/);
      let chunk = "";
      for (const s of sentences) {
        chunk += (chunk ? " " : "") + s;
        if (chunk.length >= 250) {
          paragraphs.push({ body: chunk.trim() });
          chunk = "";
        }
      }
      if (chunk.trim()) currentBody += (currentBody ? " " : "") + chunk;
    }
  }
  if (currentBody.trim()) paragraphs.push({ body: currentBody.trim() });

  // If splitting produced nothing useful, just display as one block
  const display = paragraphs.length > 0 ? paragraphs : [{ body: text }];

  return (
    <div className="space-y-5" dir="rtl">
      {display.map((p, i) => (
        <div key={i}>
          {p.heading && (
            <div className={cn("flex items-center gap-2 mb-2")}>
              <div className={cn("h-px flex-1 opacity-20", color.replace("text-", "bg-"))} />
              <span className={cn("text-[11px] font-bold tracking-wide shrink-0", color)} style={{ fontFamily: "'Scheherazade New', serif" }}>
                {p.heading}
              </span>
              <div className={cn("h-px w-4 opacity-20", color.replace("text-", "bg-"))} />
            </div>
          )}
          {p.body && (
            <p
              className="text-[17px] leading-[2.15] text-foreground/90 text-right"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
            >
              {p.body}
            </p>
          )}
        </div>
      ))}
      <div className={cn("pt-3 border-t border-border/20 flex items-center justify-between gap-3")}>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{known}</p>
        <p className={cn("text-xs font-semibold shrink-0", color)} dir="rtl" style={{ fontFamily: "'Scheherazade New', serif" }}>
          {scholarAr}
        </p>
      </div>
    </div>
  );
}

// Amharic tafseer rich renderer — paragraph-based display
function AmharicTafseerContent({ text, scholarName }: { text: string; scholarName: string }) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const display = paragraphs.length > 1 ? paragraphs : [text];

  return (
    <div className="space-y-4">
      {display.map((p, i) => (
        <p key={i} className="text-[14px] text-foreground/90 leading-[1.95]">{p}</p>
      ))}
      <div className="mt-4 pt-3 border-t border-orange-400/15 flex items-center justify-between gap-3">
        <p className="text-[11px] text-orange-400/60">ተፍሲር ኢብን ከሢር — ወደ አማርኛ ተተርጉሟል</p>
        <p className="text-[11px] text-muted-foreground shrink-0">{scholarName}</p>
      </div>
    </div>
  );
}

function IbnKathirContent({ html }: { html: string }) {
  const segments = parseIbnKathirHtml(html);

  if (segments.length === 0) {
    return (
      <p className="text-sm text-foreground/90 leading-relaxed">{html.replace(/<[^>]+>/g, " ").trim()}</p>
    );
  }

  return (
    <div className="space-y-4">
      {segments.map((seg, i) => {
        if (seg.type === "heading") {
          return (
            <div key={i} className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-sky-400/20" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400/80 shrink-0">
                {seg.text}
              </h3>
              <div className="h-px flex-1 bg-sky-400/20" />
            </div>
          );
        }
        if (seg.type === "arabic") {
          return (
            <p
              key={i}
              dir="rtl"
              className="text-[17px] leading-[2.1] text-amber-100/90 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 text-right"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
            >
              {seg.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-[14px] text-foreground/85 leading-[1.9]">
            {seg.text}
          </p>
        );
      })}
    </div>
  );
}

function AyahRow({
  ayah,
  surahName,
  surahNumber,
  totalAyahs,
  isSelected,
  onSelect,
}: {
  ayah: { id: number; ayahNumber: number; arabicText: string; translation: string; surahId: number };
  surahName: string;
  surahNumber: number;
  totalAyahs: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [selectedWordPos, setSelectedWordPos] = useState<number | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [tafseerSource, setTafseerSource] = useState<TafseerSourceId>(
    () => (localStorage.getItem("al-muhandis-tafseer-source") as TafseerSourceId | null) ?? "ai-generated"
  );
  const activeSourceMeta = TAFSEER_SOURCES.find((s) => s.id === tafseerSource) ?? TAFSEER_SOURCES[0];
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { play, pause, isPlaying, isCurrentAyah } = useAudioPlayer();
  const { note } = useNote("ayah", ayah.id);

  const isThisAyahPlaying = isCurrentAyah(ayah.surahId, ayah.ayahNumber) && isPlaying;
  const isThisAyahActive = isCurrentAyah(ayah.surahId, ayah.ayahNumber);

  const { data: words } = useGetAyahWords(ayah.id, {
    query: { enabled: isSelected && settings.showWordByWord, queryKey: getGetAyahWordsQueryKey(ayah.id) },
  });
  const {
    data: tafseer,
    isLoading: tafseerLoading,
    isError: tafseerError,
    refetch: refetchTafseer,
  } = useGetAyahTafseer(
    ayah.id,
    tafseerSource !== "ai-generated" ? { source: tafseerSource } : undefined,
    {
      query: {
        enabled: isSelected,
        queryKey: getGetAyahTafseerQueryKey(ayah.id, tafseerSource !== "ai-generated" ? { source: tafseerSource } : undefined),
        retry: 1,
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
      },
    }
  );
  const { data: relatedHadiths } = useGetAyahRelatedHadiths(ayah.id);
  const { mutate: createBookmark } = useCreateBookmark({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
      },
    },
  });
  const { mutate: deleteBookmark } = useDeleteBookmark({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
      },
    },
  });
  const { data: bookmarks } = useListBookmarks();

  const existingBookmark = bookmarks?.find((b) => b.type === "ayah" && b.referenceId === ayah.id);
  const isBookmarked = !!existingBookmark;
  const selectedWordData = words?.find((w) => w.position === selectedWordPos);

  const arabicFontFamily = settings.mushafFont === "scheherazade"
    ? "'Scheherazade New', serif"
    : "'Amiri Quran', serif";

  const handleBookmark = () => {
    if (isBookmarked && existingBookmark) {
      deleteBookmark({ bookmarkId: existingBookmark.id });
    } else {
      createBookmark({
        data: {
          type: "ayah",
          referenceId: ayah.id,
          title: `${surahName} ${ayah.ayahNumber}`,
          note: JSON.stringify({
            _meta: true,
            surahId: ayah.surahId,
            ayahNumber: ayah.ayahNumber,
            surahName,
            translationSnippet: ayah.translation.slice(0, 160),
          }),
        },
      });
    }
  };

  useEffect(() => {
    if (showNote) {
      try {
        localStorage.setItem(
          `al-muhandis-meta:ayah:${ayah.id}`,
          JSON.stringify({ surahId: ayah.surahId, ayahNumber: ayah.ayahNumber, surahName })
        );
      } catch {}
    }
  }, [showNote]);

  const handleAudioToggle = () => {
    if (isThisAyahActive) {
      if (isThisAyahPlaying) {
        pause();
      } else {
        play({
          surahId: ayah.surahId,
          surahNumber,
          surahName,
          ayahNumber: ayah.ayahNumber,
          arabicText: ayah.arabicText,
          totalAyahs,
        });
      }
    } else {
      play({
        surahId: ayah.surahId,
        surahNumber,
        surahName,
        ayahNumber: ayah.ayahNumber,
        arabicText: ayah.arabicText,
        totalAyahs,
      });
    }
  };

  return (
    <div className={cn(
      "border-b border-border last:border-0 transition-all",
      isSelected && "bg-accent/10",
      isThisAyahActive && "bg-primary/5 border-l-2 border-l-primary"
    )}>
      <div className="px-4 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
            {ayah.ayahNumber}
          </div>
          <div className="flex items-center gap-1">
            {/* Note indicator */}
            {note && !showNote && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-1" title="Has note" />
            )}
            {/* Audio button */}
            <button
              onClick={handleAudioToggle}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                isThisAyahActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
              title="Play ayah"
            >
              {isThisAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            {/* Note button */}
            <button
              onClick={() => setShowNote((v) => !v)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                note ? "text-primary" : showNote ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              )}
              title="Add note"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmark}
              className={cn("p-1.5 rounded-lg transition-all", isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onSelect}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
              )}
              title={isSelected ? "Collapse" : "Show Tafseer & more"}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSelected ? "Close" : "Tafseer"}</span>
              {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Arabic text */}
        <div className="text-right mb-4" dir="rtl">
          {isSelected && words && words.length > 0 && settings.showWordByWord ? (
            <p style={{ fontFamily: arabicFontFamily, fontSize: `${settings.arabicFontSize}px`, lineHeight: 2.2 }}>
              {words.map((w) => (
                <span
                  key={w.id}
                  onClick={() => setSelectedWordPos(selectedWordPos === w.position ? null : w.position)}
                  className={cn(
                    "cursor-pointer px-0.5 rounded transition-all",
                    selectedWordPos === w.position ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                  )}
                >
                  {settings.tajweedColoring
                    ? applyTajweed(w.arabicText).map((t, i) => (
                        <span key={i} style={{ color: TAJWEED_COLORS[t.category] !== "inherit" ? TAJWEED_COLORS[t.category] : undefined }}>
                          {t.text}
                        </span>
                      ))
                    : w.arabicText
                  }{" "}
                </span>
              ))}
            </p>
          ) : (
            <p style={{ fontFamily: arabicFontFamily, fontSize: `${settings.arabicFontSize}px`, lineHeight: 2.2 }} className="text-foreground">
              {settings.tajweedColoring
                ? applyTajweed(ayah.arabicText).map((t, i) => (
                    <span key={i} style={{ color: TAJWEED_COLORS[t.category] !== "inherit" ? TAJWEED_COLORS[t.category] : undefined }}>
                      {t.text}
                    </span>
                  ))
                : ayah.arabicText
              }
            </p>
          )}
        </div>

        {/* Word popup */}
        <AnimatePresence>
          {selectedWordData && (
            <WordPopup word={selectedWordData} onClose={() => setSelectedWordPos(null)} />
          )}
        </AnimatePresence>

        {/* Translation */}
        <p
          className="text-muted-foreground leading-relaxed"
          style={{ fontSize: `${settings.translationFontSize}px` }}
        >
          {ayah.translation}
        </p>

        {/* Note display */}
        {note && !showNote && (
          <div className="mt-2 flex items-start gap-1.5">
            <Pencil className="w-3 h-3 text-primary/60 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed italic">{note.text}</p>
          </div>
        )}

        {/* Note editor */}
        <AnimatePresence>
          {showNote && <NoteEditor ayahId={ayah.id} onClose={() => setShowNote(false)} />}
        </AnimatePresence>

        {/* Expanded tafseer + related hadiths */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Tafseer panel */}
              <div className="mt-4 rounded-xl border border-border overflow-hidden">
                {/* Source selector tabs */}
                <div className="flex gap-1 p-2 bg-muted/10 border-b border-border overflow-x-auto scrollbar-none">
                  {TAFSEER_SOURCES.map((src) => (
                    <button
                      key={src.id}
                      onClick={() => { setTafseerSource(src.id); localStorage.setItem("al-muhandis-tafseer-source", src.id); }}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                        tafseerSource === src.id
                          ? `${src.activeBg} ${src.color} border ${src.border}`
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {src.isArabic ? (
                        <span className="font-arabic text-sm leading-none">{src.label}</span>
                      ) : (
                        src.label
                      )}
                    </button>
                  ))}
                </div>

                {/* Scholar info bar */}
                {activeSourceMeta && (
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-2.5 border-b border-border/50",
                    activeSourceMeta.activeBg
                  )}>
                    <div className={cn("w-2 h-2 rounded-full shrink-0", activeSourceMeta.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold leading-none", activeSourceMeta.color)}>
                        {activeSourceMeta.labelAr}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {activeSourceMeta.scholar} · {activeSourceMeta.era}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right hidden sm:block max-w-[140px] leading-relaxed">
                      {activeSourceMeta.known}
                    </p>
                    {tafseerLoading && (
                      <Loader2 className={cn("w-3.5 h-3.5 animate-spin shrink-0", activeSourceMeta.color)} />
                    )}
                  </div>
                )}

                {/* Loading skeleton */}
                {tafseerLoading && (
                  <div className="px-4 py-5 space-y-2.5">
                    {activeSourceMeta?.isArabic ? (
                      <>
                        <div className="h-4 rounded-full bg-muted/50 animate-pulse w-full" />
                        <div className="h-4 rounded-full bg-muted/50 animate-pulse w-5/6 ml-auto" />
                        <div className="h-4 rounded-full bg-muted/50 animate-pulse w-full" />
                        <div className="h-4 rounded-full bg-muted/50 animate-pulse w-4/5 ml-auto" />
                        <div className="h-4 rounded-full bg-muted/50 animate-pulse w-full" />
                        <p className="text-xs text-muted-foreground pt-1 text-right" dir="rtl">
                          جاري تحميل التفسير…
                        </p>
                      </>
                    ) : activeSourceMeta?.id === "en.ibn-kathir" ? (
                      <>
                        <div className="h-3 rounded-full bg-orange-400/20 animate-pulse w-full" />
                        <div className="h-3 rounded-full bg-orange-400/20 animate-pulse w-5/6" />
                        <div className="h-3 rounded-full bg-orange-400/20 animate-pulse w-4/6" />
                        <div className="h-3 rounded-full bg-orange-400/20 animate-pulse w-full" />
                        <div className="h-3 rounded-full bg-orange-400/20 animate-pulse w-3/4" />
                        <p className="text-xs text-orange-400/60 pt-1">ከ ተፍሲር ኢብን ከሢር ወደ አማርኛ እየተተረጎመ…</p>
                      </>
                    ) : (
                      <>
                        <div className="h-3 rounded-full bg-muted/50 animate-pulse w-full" />
                        <div className="h-3 rounded-full bg-muted/50 animate-pulse w-5/6" />
                        <div className="h-3 rounded-full bg-muted/50 animate-pulse w-4/6" />
                        <div className="h-3 rounded-full bg-muted/50 animate-pulse w-full" />
                        <div className="h-3 rounded-full bg-muted/50 animate-pulse w-3/4" />
                        <p className="text-xs text-muted-foreground pt-1">Loading classical commentary…</p>
                      </>
                    )}
                  </div>
                )}

                {/* Error state */}
                {tafseerError && !tafseerLoading && (
                  <div className="px-4 py-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-destructive/60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium mb-0.5">Tafseer unavailable</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Could not load commentary for this verse. Please try again.
                      </p>
                      <button
                        onClick={() => refetchTafseer()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* Classical Arabic tafseer content */}
                {tafseer && !tafseerLoading && activeSourceMeta?.isArabic && tafseer.arabicText && (
                  <div className="px-5 py-5">
                    <ArabicTafseerContent
                      text={tafseer.arabicText}
                      color={activeSourceMeta.color}
                      scholarAr={activeSourceMeta.scholarAr}
                      known={activeSourceMeta.known}
                    />
                  </div>
                )}

                {/* English / Amharic content */}
                {tafseer && !tafseerLoading && !activeSourceMeta?.isArabic && tafseer.englishText && (
                  <div className="px-5 py-5">
                    {activeSourceMeta?.id === "en.ibn-kathir" ? (
                      <>
                        <IbnKathirContent html={tafseer.englishText} />
                        <div className="mt-5 pt-3 border-t border-sky-400/15 flex items-center justify-between gap-3">
                          <p className="text-[11px] text-sky-400/60">Classical Commentary · Tafsir Ibn Kathir (774 AH)</p>
                          <p className="text-[11px] text-muted-foreground">Abridged · quran.com</p>
                        </div>
                      </>
                    ) : activeSourceMeta?.id === "am.sadiq" ? (
                      <>
                        <p className="text-[14px] text-foreground/90 leading-[1.9]">{tafseer.englishText}</p>
                        <p className="mt-4 text-[11px] text-muted-foreground border-t border-teal-400/15 pt-2">
                          ትርጉም · ሳዲቅ & ሳኒ ሐቢብ
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", activeSourceMeta?.activeBg ?? "bg-primary/20")}>
                            <div className={cn("w-2 h-2 rounded-full", activeSourceMeta?.dot ?? "bg-primary")} />
                          </div>
                          <span className="text-xs text-muted-foreground">{activeSourceMeta?.known}</span>
                        </div>
                        <p className="text-[14px] text-foreground/90 leading-[1.9] whitespace-pre-line">{tafseer.englishText}</p>
                        <p className="mt-4 text-[11px] text-muted-foreground border-t border-border/30 pt-2">
                          AI-generated · Based on Ibn Kathir, al-Tabari & al-Qurtubi
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* No content fallback */}
                {tafseer && !tafseerLoading && !tafseer.arabicText && !tafseer.englishText && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-muted-foreground">No tafseer content available for this verse.</p>
                  </div>
                )}
              </div>

              {/* Related Hadiths */}
              {relatedHadiths && relatedHadiths.length > 0 && (
                <div className="mt-3 rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20 border-b border-border">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Related Hadiths</p>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {relatedHadiths.slice(0, 2).map((h) => (
                      <div key={h.id}>
                        <p className="text-xs text-muted-foreground leading-relaxed">"{h.translation.slice(0, 180)}…"</p>
                        <Link href={`/hadith/${h.collectionId}/${h.id}`}>
                          <span className="text-xs text-primary hover:underline cursor-pointer">{h.collectionName} · {h.hadithNumber}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SurahPage() {
  const { surahId } = useParams<{ surahId: string }>();
  const id = parseInt(surahId ?? "1", 10);
  const { data: surah, isLoading: surahLoading } = useGetSurah(id);
  const { data: ayahs, isLoading: ayahsLoading } = useListAyahs(id);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { play, isPlaying, current, toggle } = useAudioPlayer();
  const { settings, updateSetting } = useSettings();

  const isSurahPlaying = current?.surahId === surah?.id && isPlaying;

  const arabicFontFamily = settings.mushafFont === "scheherazade"
    ? "'Scheherazade New', serif"
    : "'Amiri Quran', serif";

  if (surahLoading || ayahsLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!surah) return null;

  const handlePlaySurah = () => {
    if (!ayahs || ayahs.length === 0) return;
    if (isSurahPlaying) {
      toggle();
      return;
    }
    const first = ayahs[0];
    play({
      surahId: surah.id,
      surahNumber: surah.number,
      surahName: surah.nameTransliterated,
      ayahNumber: first.ayahNumber,
      arabicText: first.arabicText,
      totalAyahs: surah.ayahCount,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <Link href="/quran">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Surahs
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <p
            className="text-foreground mb-1"
            style={{ fontFamily: arabicFontFamily, fontSize: "2.4rem", lineHeight: 1.8 }}
            dir="rtl"
          >
            {surah.nameArabic}
          </p>
          <h1 className="text-xl font-bold text-foreground">{surah.nameTransliterated}</h1>
          <p className="text-sm text-muted-foreground mt-1">{surah.nameEnglish}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>{surah.revelation}</span>
            <span>·</span>
            <span>{surah.ayahCount} Verses</span>
            <span>·</span>
            <span>Juz {surah.juzNumber}</span>
          </div>
          {surah.description && (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">{surah.description}</p>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button
              onClick={handlePlaySurah}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all",
                isSurahPlaying
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {isSurahPlaying ? (
                <><Pause className="w-4 h-4" />Pause</>
              ) : (
                <><Volume2 className="w-4 h-4" />Play Surah</>
              )}
            </button>
            <button
              onClick={() => updateSetting("tajweedColoring", !settings.tajweedColoring)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                settings.tajweedColoring
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              Tajweed
            </button>
            <Link href={`/hifz/${surah.number}`}>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all">
                <Target className="w-3.5 h-3.5" />
                Memorize
              </button>
            </Link>
            <button
              onClick={() => setIsFullScreen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full Screen
            </button>
          </div>
        </div>

        {surah.number !== 1 && surah.number !== 9 && (
          <div className="text-center py-5">
            <p
              className="text-foreground/60"
              style={{ fontFamily: arabicFontFamily, fontSize: "1.5rem", lineHeight: 2 }}
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </motion.div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {ayahs?.map((ayah) => (
          <AyahRow
            key={ayah.id}
            ayah={ayah}
            surahName={surah.nameTransliterated}
            surahNumber={surah.number}
            totalAyahs={surah.ayahCount}
            isSelected={selectedAyah === ayah.id}
            onSelect={() => setSelectedAyah(selectedAyah === ayah.id ? null : ayah.id)}
          />
        ))}
        {(!ayahs || ayahs.length === 0) && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No ayahs available yet for this surah.
          </div>
        )}
      </div>

      {/* Prev/Next Surah Navigation */}
      <div className="flex items-center justify-between gap-3 mt-6">
        {surah.number > 1 ? (
          <Link href={`/quran/${surah.number - 1}`}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Previous Surah</span>
            </button>
          </Link>
        ) : <div />}
        {surah.number < 114 ? (
          <Link href={`/quran/${surah.number + 1}`}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all group">
              <span>Next Surah</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        ) : <div />}
      </div>

      {/* Full-screen Quran Reading Overlay */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur border-b border-border">
              <div>
                <p className="font-bold text-foreground">{surah.nameTransliterated}</p>
                <p className="text-xs text-muted-foreground">{surah.nameEnglish} · {surah.ayahCount} Verses</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSetting("tajweedColoring", !settings.tajweedColoring)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    settings.tajweedColoring
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Tajweed
                </button>
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  Exit
                </button>
              </div>
            </div>

            {/* Bismillah */}
            {surah.number !== 1 && surah.number !== 9 && (
              <div className="text-center py-6">
                <p
                  className="text-foreground/70"
                  style={{ fontFamily: arabicFontFamily, fontSize: "1.8rem", lineHeight: 2 }}
                  dir="rtl"
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {/* Ayahs in full-screen */}
            <div className="max-w-3xl mx-auto px-6 pb-24 space-y-0">
              {ayahs?.map((ayah, idx) => (
                <div
                  key={ayah.id}
                  className={cn(
                    "py-5 border-b border-border/30 last:border-0 transition-colors",
                    idx % 2 === 0 ? "" : "bg-muted/10 rounded-xl px-4"
                  )}
                >
                  <div className="flex items-start gap-3 justify-end mb-3">
                    <p
                      className="text-right leading-loose text-foreground flex-1"
                      dir="rtl"
                      style={{ fontFamily: arabicFontFamily, fontSize: `${settings.arabicFontSize + 4}px`, lineHeight: 2.4 }}
                      dangerouslySetInnerHTML={{
                        __html: settings.tajweedColoring ? applyTajweed(ayah.arabicText) : ayah.arabicText,
                      }}
                    />
                    <span className="shrink-0 w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-xs text-primary font-semibold mt-2">
                      {ayah.ayahNumber}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" style={{ fontSize: `${settings.translationFontSize}px` }}>
                    {ayah.translation}
                  </p>
                </div>
              ))}
            </div>

            {/* Full-screen Prev/Next */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              {surah.number > 1 && (
                <Link href={`/quran/${surah.number - 1}`}>
                  <button onClick={() => setIsFullScreen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground shadow-lg transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                </Link>
              )}
              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:opacity-90 transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Full Screen
              </button>
              {surah.number < 114 && (
                <Link href={`/quran/${surah.number + 1}`}>
                  <button onClick={() => setIsFullScreen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground shadow-lg transition-all">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
