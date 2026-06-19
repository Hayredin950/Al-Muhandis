import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const PRAYER_ARABIC: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.replace(" (BST)", "").replace(" (GMT)", "").split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function getNextPrayer(times: PrayerTimes): string {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const name of PRAYER_ORDER) {
    const pMin = parseTime(times[name]);
    if (nowMin < pMin) return name;
  }
  return "Fajr";
}

function formatCountdown(times: PrayerTimes, next: string): string {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let pMin = parseTime(times[next as keyof PrayerTimes]);
  if (next === "Fajr" && pMin <= nowMin) pMin += 24 * 60;
  let diff = pMin - nowMin;
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function PrayerTimesWidget() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem("prayer-times-cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { times: PrayerTimes; city: string; date: string };
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setTimes(parsed.times);
          setCity(parsed.city);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const ts = Math.floor(Date.now() / 1000);
          const res = await fetch(
            `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=2`
          );
          const data = await res.json() as { data: { timings: PrayerTimes; meta: { timezone: string } } };
          const t = data.data.timings;
          const tz = data.data.meta.timezone;
          const cityName = tz.split("/").pop()?.replace(/_/g, " ") ?? "Your Location";
          setTimes(t);
          setCity(cityName);
          sessionStorage.setItem("prayer-times-cache", JSON.stringify({ times: t, city: cityName, date: new Date().toDateString() }));
        } catch {
          setError("Could not fetch prayer times");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
        <span className="text-sm text-muted-foreground">Fetching prayer times…</span>
      </div>
    );
  }

  if (error || !times) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Prayer Times</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {error === "Location access denied"
            ? "Enable location access in your browser to see prayer times."
            : "Prayer times unavailable. Please try again later."}
        </p>
      </div>
    );
  }

  const nextPrayer = getNextPrayer(times);
  const countdown = formatCountdown(times, nextPrayer);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Prayer Times</p>
        </div>
        {city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <p className="text-sm font-semibold text-emerald-400">
          {nextPrayer} in {countdown}
        </p>
        <span className="text-xs text-muted-foreground ml-auto">{times[nextPrayer as keyof PrayerTimes]}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {PRAYER_ORDER.map((name) => {
          const pMin = parseTime(times[name]);
          const isPast = pMin < nowMin;
          const isNext = name === nextPrayer;
          return (
            <div
              key={name}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all",
                isNext ? "bg-emerald-500/15 border border-emerald-500/30" : isPast ? "opacity-40" : "bg-muted/30"
              )}
            >
              <span
                className={cn("text-[10px] font-arabic leading-none", isNext ? "text-emerald-400" : "text-muted-foreground/80")}
                style={{ fontFamily: "'Amiri Quran', serif", fontSize: "0.9rem" }}
              >
                {PRAYER_ARABIC[name]}
              </span>
              <p className={cn("text-[10px] font-semibold", isNext ? "text-emerald-400" : "text-foreground")}>
                {times[name]}
              </p>
              <p className={cn("text-[9px]", isNext ? "text-emerald-400/70" : "text-muted-foreground/60")}>{name}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
