import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  TrendingUp, Flame, BookOpen, Target, Star, Zap, Award,
  Calendar, BarChart2, ChevronRight,
} from "lucide-react";
import {
  loadTracker, getReadingHeatmap, getKhatmahPercentage,
  type ReadingTracker,
} from "@/lib/reading-tracker";
import { cn } from "@/lib/utils";

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
    { id: "days-10", icon: "🗓️", label: "Dedicated", desc: "Read on 10 different days", unlocked: t.totalDaysRead >= 10, color: "text-teal-400" },
    { id: "khatmah", icon: "✨", label: "Khatmah Started", desc: "Started a Khatmah plan", unlocked: !!t.khatmahProgress, color: "text-rose-400" },
  ];
}

function HeatmapCell({ count }: { count: number }) {
  const intensity = count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 30 ? 3 : 4;
  return (
    <div
      className={cn(
        "w-3 h-3 rounded-[3px] transition-all",
        intensity === 0 && "bg-muted/30",
        intensity === 1 && "bg-primary/25",
        intensity === 2 && "bg-primary/50",
        intensity === 3 && "bg-primary/75",
        intensity === 4 && "bg-primary",
      )}
      title={`${count} ayahs`}
    />
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tracker, setTracker] = useState<ReadingTracker | null>(null);

  useEffect(() => { setTracker(loadTracker()); }, []);

  if (!tracker) return null;

  const heatmap = getReadingHeatmap(91);
  const achievements = buildAchievements(tracker);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const khatmahPct = getKhatmahPercentage(tracker);

  const sessionDates = Object.keys(tracker.sessions).sort().slice(-7);
  const weeklyData = sessionDates.map((d) => ({
    date: new Date(d).toLocaleDateString("en", { weekday: "short" }),
    count: tracker.sessions[d]?.ayahCount ?? 0,
  }));

  const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);

  const weeks: Array<Array<{ date: string; count: number }>> = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  const monthLabels: Array<{ label: string; col: number }> = [];
  heatmap.forEach(({ date }, i) => {
    const d = new Date(date);
    if (d.getDate() <= 7) {
      const col = Math.floor(i / 7);
      if (!monthLabels.find((m) => m.label === d.toLocaleDateString("en", { month: "short" }))) {
        monthLabels.push({ label: d.toLocaleDateString("en", { month: "short" }), col });
      }
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reading Analytics</h1>
            <p className="text-sm text-muted-foreground">Your Quran reading journey at a glance</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Flame} value={tracker.currentStreak} label="Day Streak" color="bg-orange-500/10 text-orange-400" />
          <StatCard icon={Zap} value={tracker.longestStreak} label="Best Streak" color="bg-yellow-500/10 text-yellow-400" />
          <StatCard icon={BookOpen} value={tracker.totalAyahsRead.toLocaleString()} label="Ayahs Read" color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={Calendar} value={tracker.totalDaysRead} label="Days Active" color="bg-blue-500/10 text-blue-400" />
        </div>
      </motion.div>

      {/* Reading Heatmap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Reading Activity</p>
              <p className="text-xs text-muted-foreground mt-0.5">Last 91 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>None</span>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((l) => (
                  <div key={l} className={cn("w-3 h-3 rounded-[3px]",
                    l === 0 && "bg-muted/30",
                    l === 1 && "bg-primary/25",
                    l === 2 && "bg-primary/50",
                    l === 3 && "bg-primary/75",
                    l === 4 && "bg-primary",
                  )} />
                ))}
              </div>
              <span>Active</span>
            </div>
          </div>

          {/* Month labels */}
          <div className="relative overflow-x-auto pb-1">
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map(({ date, count }) => (
                    <HeatmapCell key={date} count={count} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Khatmah Progress */}
      {tracker.khatmahProgress && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Khatmah Progress</p>
              </div>
              <Link href="/khatmah">
                <span className="text-xs text-primary hover:underline flex items-center gap-1">
                  Manage <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-primary">{khatmahPct}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tracker.khatmahProgress.planName} plan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">{tracker.khatmahProgress.completedSurahs.length}</p>
                <p className="text-xs text-muted-foreground">surahs done</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${khatmahPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {tracker.khatmahProgress.completedPages} / {tracker.khatmahProgress.totalPages} pages completed
            </p>
          </div>
        </motion.div>
      )}

      {!tracker.khatmahProgress && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link href="/khatmah">
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 flex items-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-accent/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Start a Khatmah Plan</p>
                <p className="text-xs text-muted-foreground mt-0.5">Complete the entire Quran on a structured schedule</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Hadith Study Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Hadith Study Progress</p>
          </div>
          {(() => {
            const flashcardHistory = (() => { try { return JSON.parse(localStorage.getItem("flashcard-history") ?? "[]") as Array<{ deck: string; score: number; total: number; date: number }>; } catch { return []; } })();
            const journalCount = (() => { let c = 0; for (let i = 0; i < localStorage.length; i++) { if (localStorage.key(i)?.startsWith("note-hadith-")) c++; } return c; })();
            const bookmarkCount = (() => { try { return (JSON.parse(localStorage.getItem("bookmarks") ?? "[]") as unknown[]).length; } catch { return 0; } })();
            const totalFlashcards = flashcardHistory.reduce((s, h) => s + h.total, 0);
            const knownCards = flashcardHistory.reduce((s, h) => s + h.score, 0);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-border bg-muted/10 py-3 px-2">
                    <p className="text-xl font-bold text-amber-500">{flashcardHistory.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Flash Card Sessions</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/10 py-3 px-2">
                    <p className="text-xl font-bold text-emerald-500">{totalFlashcards > 0 ? Math.round((knownCards / totalFlashcards) * 100) : 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg. Score</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/10 py-3 px-2">
                    <p className="text-xl font-bold text-primary">{journalCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Journal Notes</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-border bg-muted/10 py-3 px-2">
                    <p className="text-xl font-bold text-blue-400">{bookmarkCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bookmarks</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/10 py-3 px-2">
                    <p className="text-xl font-bold text-violet-400">{totalFlashcards}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cards Studied</p>
                  </div>
                </div>
                {flashcardHistory.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    No flash card sessions yet. <Link href="/hadith/flashcards"><span className="text-primary hover:underline cursor-pointer">Start studying →</span></Link>
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* Weekly Bar Chart */}
      {weeklyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Recent Sessions</p>
            <p className="text-xs text-muted-foreground mb-4">Ayahs read per session (last 7 active days)</p>
            <div className="flex items-end gap-2 h-28">
              {weeklyData.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] text-muted-foreground">{count > 0 ? count : ""}</p>
                  <div
                    className="w-full rounded-t-md bg-primary/70 transition-all hover:bg-primary"
                    style={{ height: `${Math.max(4, (count / maxWeekly) * 80)}px` }}
                    title={`${count} ayahs`}
                  />
                  <p className="text-[10px] text-muted-foreground">{date}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Achievements</p>
          <span className="text-xs text-muted-foreground">{unlockedCount} / {achievements.length} unlocked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                a.unlocked
                  ? "border-border bg-card"
                  : "border-border/40 bg-card/30 opacity-40"
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn("text-2xl leading-none", !a.unlocked && "grayscale")}>{a.icon}</span>
                <div>
                  <p className={cn("text-sm font-semibold", a.unlocked ? "text-foreground" : "text-muted-foreground")}>
                    {a.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  {a.unlocked && (
                    <span className={cn("text-xs font-semibold mt-1.5 block", a.color)}>
                      ✓ Unlocked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recently Viewed Hadiths in Analytics */}
      {(() => {
        const recentHadiths = (() => { try { return JSON.parse(localStorage.getItem("recently-viewed-hadiths") ?? "[]") as Array<{ collectionId: string; hadithNumber: string; collectionName: string; translation: string }>; } catch { return []; } })();
        if (recentHadiths.length === 0) return null;
        return (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">Recently Viewed Hadiths</p>
                </div>
                <span className="text-xs text-muted-foreground">{recentHadiths.length} total</span>
              </div>
              <div className="space-y-2">
                {recentHadiths.slice(0, 5).map((h) => (
                  <Link key={`${h.collectionId}-${h.hadithNumber}`} href={`/hadith/${h.collectionId}/${h.hadithNumber}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/20 transition-all cursor-pointer group border border-transparent hover:border-border">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">{h.collectionName} #{h.hadithNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{h.translation}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Streak motivator */}
      {tracker.currentStreak === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-5 text-center">
            <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground mb-1">Start your streak today</p>
            <p className="text-sm text-muted-foreground mb-4">Even a single ayah builds the habit of daily connection</p>
            <Link href="/quran">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                <BookOpen className="w-4 h-4" />
                Read Now
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {tracker.currentStreak > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 flex items-center gap-4">
            <Flame className="w-10 h-10 text-orange-400 shrink-0" />
            <div>
              <p className="text-base font-bold text-foreground">
                {tracker.currentStreak}-day streak — keep it going!
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You're {tracker.longestStreak - tracker.currentStreak > 0
                  ? `${tracker.longestStreak - tracker.currentStreak} days away from your record of ${tracker.longestStreak}`
                  : "at your all-time record 🎉"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
