import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  User, Flame, BookOpen, Target, Star, CalendarDays,
  Bookmark, ScrollText, TrendingUp, Clock, ChevronRight,
} from "lucide-react";
import {
  loadTracker, getKhatmahPercentage, getReadingHeatmap, type ReadingTracker,
} from "@/lib/reading-tracker";

import { cn } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
  color: string;
}

function buildAchievements(t: ReadingTracker): Achievement[] {
  return [
    { id: "first-read", icon: "📖", label: "First Step", desc: "Read your first ayah", unlocked: t.totalAyahsRead >= 1, color: "text-emerald-400" },
    { id: "streak-3", icon: "🔥", label: "Consistent", desc: "3-day reading streak", unlocked: t.longestStreak >= 3, color: "text-orange-400" },
    { id: "streak-7", icon: "⚡", label: "Weekly Warrior", desc: "7-day reading streak", unlocked: t.longestStreak >= 7, color: "text-yellow-400" },
    { id: "streak-30", icon: "🌟", label: "Month of Devotion", desc: "30-day reading streak", unlocked: t.longestStreak >= 30, color: "text-amber-400" },
    { id: "ayahs-100", icon: "📜", label: "Century", desc: "Read 100 ayahs total", unlocked: t.totalAyahsRead >= 100, color: "text-blue-400" },
    { id: "ayahs-500", icon: "🏛️", label: "Scholar", desc: "Read 500 ayahs total", unlocked: t.totalAyahsRead >= 500, color: "text-violet-400" },
    { id: "ayahs-1000", icon: "💎", label: "Hafiz Path", desc: "Read 1,000 ayahs total", unlocked: t.totalAyahsRead >= 1000, color: "text-primary" },
    { id: "ayahs-6236", icon: "✨", label: "Khatmah Complete", desc: "Read all 6,236 ayahs", unlocked: t.totalAyahsRead >= 6236, color: "text-amber-500" },
    { id: "days-10", icon: "🗓️", label: "Dedicated", desc: "Read on 10 different days", unlocked: t.totalDaysRead >= 10, color: "text-teal-400" },
    { id: "days-30", icon: "🕌", label: "Monthly Reader", desc: "Read on 30 different days", unlocked: t.totalDaysRead >= 30, color: "text-emerald-500" },
    { id: "khatmah", icon: "🌙", label: "Khatmah Started", desc: "Started a Khatmah plan", unlocked: !!t.khatmahProgress, color: "text-rose-400" },
    { id: "bookmarks-5", icon: "🔖", label: "Collector", desc: "5 items bookmarked", unlocked: (() => { try { return (JSON.parse(localStorage.getItem("bookmarks") ?? "[]") as unknown[]).length >= 5; } catch { return false; } })(), color: "text-indigo-400" },
  ];
}

export default function ProfilePage() {
  const [tracker, setTracker] = useState<ReadingTracker | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);

  useEffect(() => {
    setTracker(loadTracker());
    try {
      const bm = JSON.parse(localStorage.getItem("bookmarks") ?? "[]") as unknown[];
      setBookmarkCount(bm.length);
    } catch { /* ignore */ }
    try {
      const col = JSON.parse(localStorage.getItem("collections-count") ?? "0") as number;
      setCollectionCount(col);
    } catch { /* ignore */ }
  }, []);

  const khatmahPct = tracker ? getKhatmahPercentage(tracker) : 0;
  const heatmap = getReadingHeatmap(60);
  const achievements = tracker ? buildAchievements(tracker) : [];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const hijri = (() => {
    try {
      return new Intl.DateTimeFormat("en-u-ca-islamic", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date());
    } catch { return null; }
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Your Islamic learning journey at a glance
          {hijri && <span className="ml-2 text-muted-foreground/60">· {hijri}</span>}
        </p>
      </motion.div>

      {/* Reading Stats */}
      {tracker && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reading Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Flame} label="Current Streak" value={`${tracker.currentStreak}d`} color="bg-orange-500/10 text-orange-400" />
            <StatCard icon={Star} label="Best Streak" value={`${tracker.longestStreak}d`} color="bg-yellow-500/10 text-yellow-400" />
            <StatCard icon={BookOpen} label="Ayahs Read" value={tracker.totalAyahsRead.toLocaleString()} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={CalendarDays} label="Days Active" value={tracker.totalDaysRead} color="bg-blue-500/10 text-blue-400" />
          </div>
        </motion.div>
      )}

      {/* Khatmah Progress */}
      {tracker?.khatmahProgress && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Khatmah Progress</h2>
          <Link href="/khatmah">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 cursor-pointer hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{tracker.khatmahProgress.planName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{khatmahPct}% complete</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${khatmahPct}%` }} />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Activity Heatmap */}
      {heatmap.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Reading Activity
            <span className="ml-2 font-normal normal-case text-muted-foreground/60">last 60 days</span>
          </h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-1">
              {heatmap.slice(-60).map((cell, i) => {
                const intensity = cell.count === 0 ? 0 : cell.count < 5 ? 1 : cell.count < 15 ? 2 : cell.count < 30 ? 3 : 4;
                return (
                  <div
                    key={i}
                    title={`${cell.date}: ${cell.count} ayahs`}
                    className={cn(
                      "w-3.5 h-3.5 rounded-sm transition-colors",
                      intensity === 0 && "bg-muted/50",
                      intensity === 1 && "bg-emerald-500/25",
                      intensity === 2 && "bg-emerald-500/50",
                      intensity === 3 && "bg-emerald-500/75",
                      intensity === 4 && "bg-emerald-500",
                    )}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    i === 0 && "bg-muted/50",
                    i === 1 && "bg-emerald-500/25",
                    i === 2 && "bg-emerald-500/50",
                    i === 3 && "bg-emerald-500/75",
                    i === 4 && "bg-emerald-500",
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Achievements
            </h2>
            <span className="text-xs text-primary font-medium">{unlockedCount}/{achievements.length} unlocked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  a.unlocked
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card opacity-40 grayscale"
                )}
              >
                <span className="text-2xl block mb-2">{a.icon}</span>
                <p className={cn("text-sm font-semibold", a.unlocked ? a.color : "text-muted-foreground")}>{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/analytics", label: "Full Analytics", desc: "Detailed charts and heatmap", icon: TrendingUp, color: "text-blue-400 bg-blue-500/10" },
            { href: "/bookmarks", label: "Bookmarks", desc: bookmarkCount > 0 ? `${bookmarkCount} saved items` : "Save ayahs & hadiths", icon: Bookmark, color: "text-teal-400 bg-teal-500/10" },
            { href: "/hadith/flashcards", label: "Flash Cards", desc: "Test your knowledge", icon: ScrollText, color: "text-amber-400 bg-amber-500/10" },
            { href: "/hifz/1", label: "Memorization", desc: "Hifz practice mode", icon: Target, color: "text-violet-400 bg-violet-500/10" },
            { href: "/khatmah", label: "Khatmah", desc: "Complete the Quran", icon: CalendarDays, color: "text-rose-400 bg-rose-500/10" },
            { href: "/collections", label: "Collections", desc: "My curated sets", icon: Clock, color: "text-indigo-400 bg-indigo-500/10" },
          ].map(({ href, label, desc, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* No tracker state */}
      {!tracker && (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-sm text-muted-foreground">Start reading to see your progress here</p>
          <Link href="/quran">
            <button className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
              Open Quran
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
