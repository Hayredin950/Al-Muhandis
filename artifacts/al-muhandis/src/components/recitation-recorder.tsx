import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, RotateCcw, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecitationRecorderProps {
  surahName?: string;
  ayahNumber?: number;
  arabicText?: string;
  onClose?: () => void;
}

type RecordingState = "idle" | "recording" | "recorded" | "playing";

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function RecitationRecorder({ surahName, ayahNumber, arabicText, onClose }: RecitationRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => { cleanup(); if (audioUrl) URL.revokeObjectURL(audioUrl); }, []);

  const trackVolume = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setVolume(Math.min(100, Math.round((avg / 128) * 100)));
    animFrameRef.current = requestAnimationFrame(trackVolume);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("recorded");
        cleanup();
        setVolume(0);
      };

      mr.start(100);
      startTimeRef.current = Date.now();
      setState("recording");

      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);

      trackVolume();
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions.");
      setState("idle");
    }
  }, [audioUrl, cleanup, trackVolume]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setDuration(Date.now() - startTimeRef.current);
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onplay = () => setState("playing");
    audio.onended = () => setState("recorded");
    audio.onerror = () => setState("recorded");
    audio.play();
  }, [audioUrl]);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setState("recorded");
  }, []);

  const deleteRecording = useCallback(() => {
    audioRef.current?.pause();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setState("idle");
    setDuration(0);
  }, [audioUrl]);

  const downloadRecording = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `recitation-${surahName ?? "quran"}-${ayahNumber ?? ""}.webm`;
    a.click();
  }, [audioUrl, surahName, ayahNumber]);

  const bars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground text-sm">Recitation Recorder</p>
          {surahName && ayahNumber && (
            <p className="text-xs text-muted-foreground mt-0.5">{surahName} · Verse {ayahNumber}</p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-6">
        {arabicText && (
          <div className="p-4 rounded-xl bg-muted/20 border border-border mb-5 text-right" dir="rtl">
            <p className="text-foreground leading-loose" style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.4rem", lineHeight: 2 }}>
              {arabicText}
            </p>
          </div>
        )}

        {/* Waveform visualizer */}
        <div className="flex items-center justify-center gap-1 mb-6 h-12">
          {bars.map((i) => {
            const isActive = state === "recording";
            const height = isActive
              ? Math.max(4, Math.random() * volume + 4)
              : state === "playing"
              ? Math.max(4, Math.sin((Date.now() / 100 + i) * 0.5) * 20 + 20)
              : 4;
            return (
              <motion.div
                key={i}
                animate={{ height: isActive ? `${height}px` : "4px" }}
                transition={{ duration: 0.1 }}
                className={cn(
                  "w-1.5 rounded-full",
                  state === "recording" ? "bg-red-400" :
                  state === "playing" ? "bg-primary" :
                  "bg-muted-foreground/30"
                )}
              />
            );
          })}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <p className={cn("text-4xl font-mono font-bold", state === "recording" ? "text-red-400" : "text-foreground")}>
            {formatTime(duration)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {state === "idle" && "Ready to record"}
            {state === "recording" && "Recording…"}
            {state === "recorded" && "Recording saved"}
            {state === "playing" && "Playing back…"}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {state === "idle" && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/40 hover:bg-red-500/20 hover:border-red-500/60 flex items-center justify-center transition-all group"
            >
              <Mic className="w-7 h-7 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {state === "recording" && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 border-2 border-red-400 flex items-center justify-center transition-all relative"
            >
              <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
              <Square className="w-7 h-7 text-white" fill="white" />
            </button>
          )}

          {(state === "recorded" || state === "playing") && (
            <>
              <button
                onClick={deleteRecording}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {state === "recorded" ? (
                <button
                  onClick={playRecording}
                  className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 flex items-center justify-center transition-all"
                >
                  <Play className="w-7 h-7 text-primary" fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="w-16 h-16 rounded-full bg-primary border-2 border-primary/60 flex items-center justify-center transition-all"
                >
                  <Square className="w-7 h-7 text-primary-foreground" fill="white" />
                </button>
              )}

              <button
                onClick={downloadRecording}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {state === "recorded" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { deleteRecording(); startRecording(); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Record again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
