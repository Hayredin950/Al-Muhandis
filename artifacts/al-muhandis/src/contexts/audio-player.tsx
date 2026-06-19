import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export const RECITERS: { id: string; name: string; nameArabic: string; style: string; folder: string }[] = [
  { id: "mishary-rashid", name: "Mishary Rashid Alafasy", nameArabic: "مشاري راشد العفاسي", style: "Murattal", folder: "Mishary_Rashid_Alafasy_128kbps" },
  { id: "maher-al-muaiqly", name: "Maher Al-Muaiqly", nameArabic: "ماهر المعيقلي", style: "Murattal", folder: "Maher_Al_Muaiqly_128kbps" },
  { id: "abdulbasit", name: "Abdul Basit Murattal", nameArabic: "عبد الباسط عبد الصمد", style: "Murattal", folder: "Abdul_Basit_Murattal_128kbps" },
  { id: "saad-al-ghamdi", name: "Saad Al-Ghamdi", nameArabic: "سعد الغامدي", style: "Murattal", folder: "Saad_Al-Ghamdi_128kbps" },
  { id: "minshawi", name: "Mohamed Siddiq El-Minshawi", nameArabic: "محمد صديق المنشاوي", style: "Murattal", folder: "Minshawi_Murattal_128kbps" },
  { id: "yasser-dosari", name: "Yasser Al-Dosari", nameArabic: "ياسر الدوسري", style: "Murattal", folder: "Yasser_Ad-Dussary_128kbps" },
  { id: "hani-rifai", name: "Hani Ar-Rifai", nameArabic: "هاني الرفاعي", style: "Murattal", folder: "Hani_Rifai_128kbps" },
  { id: "ali-huthaify", name: "Ali Al-Huthaify", nameArabic: "علي الحذيفي", style: "Murattal", folder: "Ali_Alhuthaify_128kbps" },
];

export function getAudioUrl(reciterFolder: string, surahNumber: number, ayahNumber: number): string {
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciterFolder}/${s}${a}.mp3`;
}

export interface PlayParams {
  surahId: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  totalAyahs: number;
}

export type RepeatMode = "off" | "one" | "surah";

export interface LoopRange {
  start: number;
  end: number;
}

interface AudioPlayerContextType {
  isPlaying: boolean;
  current: PlayParams | null;
  reciterId: string;
  speed: number;
  repeatMode: RepeatMode;
  loopRange: LoopRange | null;
  play: (params: PlayParams) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  setReciterId: (id: string) => void;
  setSpeed: (s: number) => void;
  setRepeatMode: (m: RepeatMode) => void;
  setLoopRange: (range: LoopRange | null) => void;
  playNext: () => void;
  playPrev: () => void;
  close: () => void;
  isCurrentAyah: (surahId: number, ayahNumber: number) => boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<PlayParams | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciterId, setReciterIdState] = useState(() => {
    try { const s = localStorage.getItem("al-muhandis-settings"); return s ? (JSON.parse(s).reciterId ?? "mishary-rashid") : "mishary-rashid"; } catch { return "mishary-rashid"; }
  });
  const [speed, setSpeedState] = useState(() => {
    try { const s = localStorage.getItem("al-muhandis-settings"); return s ? (JSON.parse(s).playbackSpeed ?? 1) : 1; } catch { return 1; }
  });
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentRef = useRef<PlayParams | null>(null);
  const repeatRef = useRef<RepeatMode>("off");
  const loopRangeRef = useRef<LoopRange | null>(null);
  const reciterIdRef = useRef(reciterId);
  const speedRef = useRef(speed);

  currentRef.current = current;
  repeatRef.current = repeatMode;
  loopRangeRef.current = loopRange;

  const loadAndPlay = useCallback((params: PlayParams) => {
    const rId = reciterIdRef.current;
    const spd = speedRef.current;
    const reciter = RECITERS.find((r) => r.id === rId) ?? RECITERS[0]!;
    const url = getAudioUrl(reciter.folder, params.surahNumber, params.ayahNumber);

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = url;
    audio.playbackRate = spd;
    audio.load();

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, []);

  const handleEnded = useCallback(() => {
    const cur = currentRef.current;
    const mode = repeatRef.current;
    const loop = loopRangeRef.current;
    if (!cur) return;

    if (mode === "one") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return;
    }

    if (loop) {
      const nextAyah = cur.ayahNumber >= loop.end ? loop.start : cur.ayahNumber + 1;
      const next = { ...cur, ayahNumber: nextAyah, arabicText: "" };
      setCurrent(next);
      loadAndPlay(next);
      return;
    }

    if (mode === "surah" && cur.ayahNumber >= cur.totalAyahs) {
      const next = { ...cur, ayahNumber: 1, arabicText: "" };
      setCurrent(next);
      loadAndPlay(next);
    } else if (cur.ayahNumber < cur.totalAyahs) {
      const next = { ...cur, ayahNumber: cur.ayahNumber + 1, arabicText: "" };
      setCurrent(next);
      loadAndPlay(next);
    } else {
      setIsPlaying(false);
    }
  }, [loadAndPlay]);

  const play = useCallback((params: PlayParams) => {
    setCurrent(params);
    loadAndPlay(params);
  }, [loadAndPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.src) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  const playNext = useCallback(() => {
    const cur = currentRef.current;
    if (!cur || cur.ayahNumber >= cur.totalAyahs) return;
    const next = { ...cur, ayahNumber: cur.ayahNumber + 1, arabicText: "" };
    setCurrent(next);
    loadAndPlay(next);
  }, [loadAndPlay]);

  const playPrev = useCallback(() => {
    const cur = currentRef.current;
    if (!cur || cur.ayahNumber <= 1) return;
    const prev = { ...cur, ayahNumber: cur.ayahNumber - 1, arabicText: "" };
    setCurrent(prev);
    loadAndPlay(prev);
  }, [loadAndPlay]);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrent(null);
    setIsPlaying(false);
  }, []);

  const handleSetReciterId = useCallback((id: string) => {
    setReciterIdState(id);
    reciterIdRef.current = id;
    const cur = currentRef.current;
    const audio = audioRef.current;
    if (cur && audio && !audio.paused) {
      loadAndPlay(cur);
    }
  }, [loadAndPlay]);

  const handleSetSpeed = useCallback((s: number) => {
    setSpeedState(s);
    speedRef.current = s;
    const audio = audioRef.current;
    if (audio) audio.playbackRate = s;
  }, []);

  const isCurrentAyah = useCallback((surahId: number, ayahNumber: number) => {
    return currentRef.current?.surahId === surahId && currentRef.current?.ayahNumber === ayahNumber;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{
      isPlaying, current, reciterId, speed, repeatMode, loopRange,
      play, pause, resume, toggle,
      setReciterId: handleSetReciterId,
      setSpeed: handleSetSpeed,
      setRepeatMode,
      setLoopRange,
      playNext, playPrev, close,
      isCurrentAyah,
    }}>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={() => setIsPlaying(false)}
        style={{ display: "none" }}
        preload="auto"
        crossOrigin="anonymous"
      />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextType {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
