import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, X, Repeat, Repeat1,
  ChevronUp, ChevronDown, Music2, Volume2, VolumeX,
} from "lucide-react";
import { useAudioPlayer, RECITERS } from "@/contexts/audio-player";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const {
    isPlaying, current, reciterId, speed, repeatMode,
    toggle, playNext, playPrev, close,
    setReciterId, setSpeed, setRepeatMode,
  } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const seekingRef = useRef(false);

  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];

  // Tap into the hidden <audio> element that AudioPlayerProvider renders
  const getAudioEl = useCallback((): HTMLAudioElement | null => {
    return document.querySelector("audio[preload='auto']") as HTMLAudioElement | null;
  }, []);

  useEffect(() => {
    const audio = getAudioEl();
    if (!audio) return;

    const onTime = () => { if (!seekingRef.current) setCurrentTime(audio.currentTime); };
    const onDur = () => setDuration(audio.duration || 0);
    const onVol = () => { setVolume(audio.volume); setMuted(audio.muted); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("volumechange", onVol);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("volumechange", onVol);
    };
  }, [getAudioEl, current]);

  // Reset time when track changes
  useEffect(() => { setCurrentTime(0); setDuration(0); }, [current?.surahId, current?.ayahNumber]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = getAudioEl();
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audio && isFinite(val)) audio.currentTime = val;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = getAudioEl();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audio) { audio.volume = val; audio.muted = val === 0; }
  };

  const toggleMute = () => {
    const audio = getAudioEl();
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  const cycleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("one");
    else if (repeatMode === "one") setRepeatMode("surah");
    else setRepeatMode("off");
  };

  if (!current) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:left-60"
      >
        <div className="bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl">
          {/* Expanded panel — Reciter Selector */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-border"
              >
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Select Reciter</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RECITERS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setReciterId(r.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          reciterId === r.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 hover:bg-accent/20 text-foreground"
                        )}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Music2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-xs font-medium leading-tight line-clamp-2">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.style}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Seekable progress bar */}
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onMouseDown={() => { seekingRef.current = true; }}
              onMouseUp={() => { seekingRef.current = false; }}
              onTouchStart={() => { seekingRef.current = true; }}
              onTouchEnd={() => { seekingRef.current = false; }}
              onChange={handleSeek}
              className="absolute bottom-0 left-0 right-0 w-full h-1 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-runnable-track]:bg-transparent"
            />
            <div className="h-1 bg-border">
              <div
                className="h-full bg-primary/70 transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Time tooltip on hover */}
            <div className="absolute right-2 -top-5 hidden group-hover:flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              {duration > 0 && <><span>/</span><span>{formatTime(duration)}</span></>}
            </div>
          </div>

          {/* Main player bar */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Left — ayah info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Music2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {current.surahName} · Verse {current.ayahNumber}
                  </p>
                  {current.arabicText ? (
                    <p
                      className="text-xs text-muted-foreground truncate"
                      dir="rtl"
                      style={{ fontFamily: "'Amiri Quran', serif" }}
                    >
                      {current.arabicText.slice(0, 40)}{current.arabicText.length > 40 ? "…" : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Loading…</p>
                  )}
                </div>
              </div>
            </div>

            {/* Center — Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={playPrev}
                disabled={current.ayahNumber <= 1}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                disabled={current.ayahNumber >= current.totalAyahs}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right — Speed, Repeat, Volume, Reciter, Close */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Time display (small screens hide) */}
              {duration > 0 && (
                <span className="hidden lg:inline text-[10px] font-mono text-muted-foreground tabular-nums w-[72px] text-center">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}

              <button
                onClick={nextSpeed}
                className="hidden sm:flex items-center px-2 py-1 rounded-md text-xs font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
              >
                {speed}×
              </button>

              <button
                onClick={cycleRepeat}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  repeatMode !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title={repeatMode === "off" ? "No repeat" : repeatMode === "one" ? "Repeat one" : "Repeat surah"}
              >
                {repeatMode === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>

              {/* Volume control */}
              <div className="relative hidden sm:flex items-center">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolume(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      onMouseLeave={() => setShowVolume(false)}
                      className="absolute bottom-full mb-2 right-0 bg-card border border-border rounded-xl shadow-xl p-3 w-32 z-20"
                    >
                      <p className="text-[10px] text-muted-foreground mb-2 font-medium">Volume</p>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 accent-primary cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-right font-mono">
                        {Math.round((muted ? 0 : volume) * 100)}%
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setExpanded((e) => !e)}
                className="hidden sm:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all items-center gap-1 text-xs"
                title="Select reciter"
              >
                <span className="hidden md:inline max-w-[70px] truncate">{reciter.name.split(" ")[0]}</span>
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={close}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
