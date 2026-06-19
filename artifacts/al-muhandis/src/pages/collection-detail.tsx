import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Play, Pause, SkipBack, SkipForward, Headphones, Video,
  Volume2, VolumeX, Loader2, AlertTriangle, Clock, ListMusic, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface CollectionItem {
  id: number;
  collectionId: number;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  position: number;
  type: string;
}

interface Collection {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  items: CollectionItem[];
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}:${rm.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/collections/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCollection(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load collection");
        setLoading(false);
      });
  }, [id]);

  const currentItem = collection?.items[currentIndex];
  const isVideo = currentItem?.type === "video" || currentItem?.mediaUrl?.includes(".mp4") || currentItem?.mediaUrl?.includes(".webm");
  const mediaRef = isVideo ? videoRef : audioRef;

  function getMediaEl(): HTMLMediaElement | null {
    return isVideo ? videoRef.current : audioRef.current;
  }

  useEffect(() => {
    const el = getMediaEl();
    if (!el || !currentItem) return;
    el.src = currentItem.mediaUrl;
    el.load();
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentItem?.mediaUrl]);

  function togglePlay() {
    const el = getMediaEl();
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }

  function playItem(index: number) {
    setCurrentIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
    const el = getMediaEl();
    if (el) {
      el.currentTime = 0;
    }
  }

  function handlePrev() {
    if (currentIndex > 0) playItem(currentIndex - 1);
  }

  function handleNext() {
    if (collection && currentIndex < collection.items.length - 1) {
      playItem(currentIndex + 1);
    } else {
      setIsPlaying(false);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = getMediaEl();
    const val = parseFloat(e.target.value);
    if (el && isFinite(val)) {
      el.currentTime = val;
      setCurrentTime(val);
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = getMediaEl();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (el) {
      el.volume = val;
      el.muted = val === 0;
      setMuted(val === 0);
    }
  }

  function toggleMute() {
    const el = getMediaEl();
    if (!el) return;
    const next = !muted;
    el.muted = next;
    setMuted(next);
  }

  const mediaEvents = {
    onTimeUpdate: (e: React.SyntheticEvent<HTMLMediaElement>) => setCurrentTime(e.currentTarget.currentTime),
    onDurationChange: (e: React.SyntheticEvent<HTMLMediaElement>) => setDuration(e.currentTarget.duration),
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onWaiting: () => setBuffering(true),
    onCanPlay: () => setBuffering(false),
    onEnded: handleNext,
    onError: () => { setIsPlaying(false); setBuffering(false); },
    onVolumeChange: (e: React.SyntheticEvent<HTMLMediaElement>) => {
      setVolume(e.currentTarget.volume);
      setMuted(e.currentTarget.muted);
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading collection…</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive">{error ?? "Collection not found"}</p>
          <Link href={`${BASE_URL}/collections`}>
            <button className="text-sm text-primary hover:underline">← Back to Collections</button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link href={`${BASE_URL}/collections`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all">
          <ChevronLeft className="w-4 h-4" />
          Collections
        </button>
      </Link>

      {/* Hidden audio/video elements */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" {...(isVideo ? {} : mediaEvents as any)} style={{ display: "none" }} />
      <video ref={videoRef} preload="auto" crossOrigin="anonymous" {...(isVideo ? mediaEvents as any : {})} style={{ display: isVideo ? undefined : "none" }}
        className="w-full rounded-2xl max-h-[400px] bg-black"
      />

      {/* Player Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {/* Thumbnail / video player */}
        {!isVideo && (
          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
            {(currentItem?.thumbnailUrl ?? collection.thumbnailUrl) ? (
              <img
                src={currentItem?.thumbnailUrl ?? collection.thumbnailUrl}
                alt={currentItem?.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : null}
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-border">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground">{collection.title}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2">{currentItem?.title ?? "No item selected"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-5 space-y-4">
          {/* Track info */}
          <div className="text-center">
            <p className="font-semibold text-foreground line-clamp-1">{currentItem?.title ?? "—"}</p>
            {currentItem?.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{currentItem.description}</p>
            )}
          </div>

          {/* Seek bar */}
          <div className="space-y-1">
            <input
              ref={seekRef}
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              step={0.5}
              onChange={handleSeek}
              className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Play controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              {buffering ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={!collection || currentIndex >= collection.items.length - 1}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-all shrink-0">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 accent-primary cursor-pointer rounded-full"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{Math.round((muted ? 0 : volume) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Playlist */}
      {collection.items.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowPlaylist((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Playlist</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{collection.items.length}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showPlaylist ? "rotate-180" : "")} />
          </button>

          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {collection.items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => playItem(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-accent/20",
                        index === currentIndex ? "bg-primary/5 border-l-2 border-primary" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        index === currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {index === currentIndex && isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : index === currentIndex ? (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        ) : (
                          <span className="text-xs font-mono">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", index === currentIndex ? "text-primary" : "text-foreground")}>
                          {item.title}
                        </p>
                        {item.duration && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{formatTime(item.duration)}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
