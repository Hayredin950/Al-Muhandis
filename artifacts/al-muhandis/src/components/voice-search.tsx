import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Loader2, Search } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useListSurahs } from "@workspace/api-client-react";

interface MatchResult {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  surahNameEnglish: string;
  score: number;
}

function stripTashkeel(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");
}

function normalizeArabic(text: string): string {
  return stripTashkeel(text)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, "").replace(/\s+/g, " ").trim();
}

function matchScore(query: string, surahName: string, surahNameArabic: string, surahNameEnglish: string): number {
  const q = normalize(query);
  const qAr = normalizeArabic(query);

  const nameNorm = normalize(surahName);
  const engNorm = normalize(surahNameEnglish);
  const arNorm = normalizeArabic(surahNameArabic);

  if (nameNorm === q || engNorm === q || arNorm === qAr) return 1.0;
  if (nameNorm.startsWith(q) || engNorm.startsWith(q)) return 0.9;
  if (nameNorm.includes(q) || engNorm.includes(q)) return 0.75;
  if (arNorm.includes(qAr) && qAr.length > 1) return 0.85;

  let charMatches = 0;
  for (const c of q) {
    if (nameNorm.includes(c) || engNorm.includes(c)) charMatches++;
  }
  const charScore = q.length > 0 ? charMatches / q.length : 0;
  return charScore > 0.7 ? charScore * 0.6 : 0;
}

interface VoiceSearchProps {
  onClose?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type Status = "idle" | "listening" | "processing" | "results" | "error";
type Lang = "ar-SA" | "en-US";

export function VoiceSearch({ onClose }: VoiceSearchProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [lang, setLang] = useState<Lang>("ar-SA");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { data: surahs } = useListSurahs();

  const findMatches = useCallback((text: string): MatchResult[] => {
    if (!surahs) return [];
    return surahs
      .map((s) => ({
        surahNumber: s.number,
        surahName: s.nameTransliterated,
        surahNameArabic: s.nameArabic,
        surahNameEnglish: s.nameEnglish,
        score: matchScore(text, s.nameTransliterated, s.nameArabic, s.nameEnglish),
      }))
      .filter((r) => r.score > 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [surahs]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const startListening = useCallback(() => {
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg("Voice recognition is not supported. Use Chrome or Edge.");
      setStatus("error");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    recognitionRef.current = rec;

    rec.onstart = () => { setStatus("listening"); setTranscript(""); setInterimText(""); setResults([]); };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) final += r[0]!.transcript;
        else interim += r[0]!.transcript;
      }
      if (interim) setInterimText(interim);
      if (final) {
        setTranscript(final);
        setInterimText("");
        setStatus("processing");
        setTimeout(() => {
          const m = findMatches(final);
          setResults(m);
          setStatus(m.length > 0 ? "results" : "error");
          if (m.length === 0) setErrorMsg(`No surah matched "${final}". Try speaking more clearly.`);
        }, 300);
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      const msgs: Record<string, string> = {
        "no-speech": "No speech detected. Please try again.",
        "not-allowed": "Microphone access denied. Please allow microphone permissions.",
        "network": "Network error. Check your connection.",
        "audio-capture": "Microphone not found.",
      };
      setErrorMsg(msgs[e.error] ?? `Error: ${e.error}`);
      setStatus("error");
    };

    rec.onend = () => {
      if (status === "listening") setStatus("processing");
    };

    rec.start();
  }, [lang, findMatches, status]);

  const retry = () => {
    setStatus("idle");
    setTranscript("");
    setInterimText("");
    setResults([]);
    setErrorMsg("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Surah Voice Search</p>
            <p className="text-xs text-muted-foreground">Speak a surah name to navigate</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Language toggle */}
        <div className="flex items-center gap-2 mb-5 bg-muted/30 rounded-lg p-1 border border-border">
          <button onClick={() => setLang("ar-SA")} className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-all", lang === "ar-SA" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            Arabic 🇸🇦
          </button>
          <button onClick={() => setLang("en-US")} className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-all", lang === "en-US" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            English 🇺🇸
          </button>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="relative">
            {status === "listening" && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping scale-[1.6]" />
                <div className="absolute inset-0 rounded-full bg-red-400/10 animate-ping scale-[1.35] [animation-delay:150ms]" />
              </>
            )}
            <button
              onClick={status === "listening" ? stopListening : startListening}
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all z-10",
                status === "listening"
                  ? "bg-red-500 border-2 border-red-400"
                  : status === "processing"
                  ? "bg-primary/20 border-2 border-primary/40 animate-pulse"
                  : "bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
              )}
            >
              {status === "listening"
                ? <MicOff className="w-8 h-8 text-white" />
                : status === "processing"
                ? <div className="w-5 h-5 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
                : <Mic className="w-8 h-8 text-primary" />
              }
            </button>
          </div>

          {/* Live waveform */}
          {status === "listening" && (
            <div className="flex items-end gap-1 h-7">
              {Array.from({ length: 11 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-red-400"
                  animate={{ height: [3, Math.random() * 20 + 6, 3] }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.4, delay: i * 0.05 }}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {status === "idle" && "Tap the mic and say a surah name"}
            {status === "listening" && (interimText ? `"${interimText}"` : "Listening… speak clearly")}
            {status === "processing" && "Searching…"}
            {status === "results" && `${results.length} match${results.length !== 1 ? "es" : ""} found`}
            {status === "error" && "No match found"}
          </p>
        </div>

        {/* Heard transcript */}
        <AnimatePresence>
          {transcript && (status === "results" || status === "error") && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-muted/30 border border-border text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">Heard</p>
              <p className="text-sm text-foreground font-medium">"{transcript}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{errorMsg}</p>
              <button onClick={retry} className="text-xs text-primary mt-1 hover:underline">Try again</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {results.map((r) => (
                <Link key={r.surahNumber} href={`/quran/${r.surahNumber}`} onClick={onClose}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/20 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {r.surahNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{r.surahName}</p>
                      <p className="text-xs text-muted-foreground">{r.surahNameArabic} · {r.surahNameEnglish}</p>
                    </div>
                    <div className="shrink-0">
                      <span className={cn("text-xs font-bold",
                        r.score >= 0.85 ? "text-emerald-400" :
                        r.score >= 0.65 ? "text-amber-400" : "text-muted-foreground"
                      )}>
                        {Math.round(r.score * 100)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <button onClick={retry} className="w-full text-xs text-muted-foreground hover:text-foreground pt-1 transition-all">
                Search again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle suggestions */}
        {status === "idle" && results.length === 0 && (
          <div className="mt-1">
            <p className="text-xs text-muted-foreground mb-2">Try saying:</p>
            <div className="flex flex-wrap gap-1.5">
              {["Al-Fatihah", "Yasin", "Al-Mulk", "Al-Ikhlas", "Al-Kahf", "Al-Baqarah"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-lg bg-muted/40 border border-border text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
