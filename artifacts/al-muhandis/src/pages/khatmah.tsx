import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, CheckCircle, RotateCcw, Star, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useListSurahs } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  loadTracker, startKhatmah, markSurahComplete,
  getKhatmahPercentage, getDailyTarget, getReadingHeatmap,
  saveTracker, type ReadingTracker,
} from "@/lib/reading-tracker";

const SURAH_PAGES: Record<number, number> = {
  1: 1, 2: 22, 3: 20, 4: 18, 5: 12, 6: 13, 7: 16, 8: 9, 9: 12, 10: 11,
  11: 11, 12: 11, 13: 6, 14: 5, 15: 6, 16: 13, 17: 12, 18: 12, 19: 8, 20: 8,
  21: 9, 22: 9, 23: 7, 24: 9, 25: 7, 26: 11, 27: 8, 28: 9, 29: 7, 30: 6,
  31: 4, 32: 3, 33: 9, 34: 6, 35: 5, 36: 5, 37: 7, 38: 5, 39: 8, 40: 9,
  41: 7, 42: 6, 43: 7, 44: 3, 45: 4, 46: 5, 47: 4, 48: 4, 49: 3, 50: 3,
  51: 3, 52: 3, 53: 3, 54: 3, 55: 4, 56: 3, 57: 5, 58: 5, 59: 4, 60: 3,
  61: 2, 62: 2, 63: 2, 64: 3, 65: 2, 66: 2, 67: 3, 68: 2, 69: 2, 70: 2,
  71: 2, 72: 2, 73: 2, 74: 2, 75: 1, 76: 2, 77: 2, 78: 2, 79: 1, 80: 1,
  81: 1, 82: 1, 83: 2, 84: 1, 85: 1, 86: 1, 87: 1, 88: 1, 89: 1, 90: 1,
  91: 1, 92: 1, 93: 1, 94: 1, 95: 1, 96: 1, 97: 1, 98: 1, 99: 1, 100: 1,
  101: 1, 102: 1, 103: 1, 104: 1, 105: 1, 106: 1, 107: 1, 108: 1, 109: 1, 110: 1,
  111: 1, 112: 1, 113: 1, 114: 1,
};

const PLANS = [
  { id: "30", label: "30 Days", days: 30, desc: "~20 pages/day — intensive", pages: 20, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "60", label: "60 Days", days: 60, desc: "~10 pages/day — moderate", pages: 10, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "90", label: "90 Days", days: 90, desc: "~7 pages/day — relaxed", pages: 7, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { id: "180", label: "6 Months", days: 180, desc: "~4 pages/day — leisurely", pages: 4, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "365", label: "1 Year", days: 365, desc: "~2 pages/day — steady", pages: 2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
];

export default function KhatmahPage() {
  const [tracker, setTracker] = useState<ReadingTracker>(loadTracker);
  const [view, setView] = useState<"plan" | "progress">(tracker.khatmahProgress ? "progress" : "plan");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]!);
  const { data: surahs } = useListSurahs();

  const heatmap = getReadingHeatmap(60);
  const completedSurahs = tracker.khatmahProgress?.completedSurahs ?? [];
  const percentage = getKhatmahPercentage(tracker);
  const dailyTarget = getDailyTarget(tracker);

  const handleStartKhatmah = () => {
    const updated = startKhatmah(selectedPlan.label, selectedPlan.days);
    setTracker(updated);
    setView("progress");
  };

  const handleSurahComplete = (surahNumber: number) => {
    const pages = SURAH_PAGES[surahNumber] ?? 1;
    const updated = markSurahComplete(surahNumber, pages);
    setTracker(updated);
  };

  const handleReset = () => {
    const t = loadTracker();
    t.khatmahProgress = null;
    saveTracker(t);
    setTracker({ ...t });
    setView("plan");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Khatmah Planner</h1>
            <p className="text-sm text-muted-foreground">Complete the entire Quran on schedule</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-primary">{tracker.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Day Streak 🔥</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{tracker.totalAyahsRead.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ayahs Read</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{tracker.totalDaysRead}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Days Active</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reading Activity (60 days)</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {heatmap.map(({ date, count }) => (
              <div
                key={date}
                title={`${date}: ${count} ayahs`}
                className={cn(
                  "w-4 h-4 rounded-sm transition-all cursor-default",
                  count === 0 ? "bg-muted/40" :
                  count < 5 ? "bg-primary/30" :
                  count < 20 ? "bg-primary/60" :
                  "bg-primary"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted/40 inline-block" /> None</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/30 inline-block" /> Light</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Active</span>
          </div>
        </div>

        {view === "plan" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Choose Your Khatmah Schedule</p>
              <div className="space-y-2">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                      selectedPlan.id === plan.id
                        ? `${plan.bg} ${plan.border} ${plan.color}`
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div>
                      <p className={cn("text-sm font-semibold", selectedPlan.id !== plan.id && "text-foreground")}>{plan.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{plan.pages}</p>
                      <p className="text-xs text-muted-foreground">pages/day</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-accent/10 text-xs text-muted-foreground leading-relaxed">
              The Quran has 604 pages. Your selected plan targets completion in{" "}
              <span className="text-foreground font-medium">{selectedPlan.days} days</span> at{" "}
              <span className="text-foreground font-medium">~{selectedPlan.pages} pages per day</span>.
            </div>

            <button
              onClick={handleStartKhatmah}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Start {selectedPlan.label} Khatmah
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {percentage === 100 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-foreground">Khatmah Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">Congratulations! You have completed the entire Quran.</p>
              </motion.div>
            )}

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tracker.khatmahProgress?.planName} Khatmah</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Started {tracker.khatmahProgress?.startDate}
                    {dailyTarget > 0 && <span> · {dailyTarget} pages/day remaining</span>}
                  </p>
                  {tracker.khatmahProgress?.startDate && (() => {
                    const plan = PLANS.find((p) => tracker.khatmahProgress?.planName?.startsWith(p.label));
                    if (!plan) return null;
                    const start = new Date(tracker.khatmahProgress.startDate);
                    const end = new Date(start.getTime() + plan.days * 86400000);
                    return <p className="text-xs text-primary mt-0.5">Est. completion: {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>;
                  })()}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">complete</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {tracker.khatmahProgress?.completedPages ?? 0} / 604 pages · {completedSurahs.length} / 114 surahs
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Surah Checklist</p>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-border">
                {surahs?.map((s) => {
                  const done = completedSurahs.includes(s.number);
                  return (
                    <div key={s.number} className={cn("flex items-center gap-3 px-4 py-2.5 transition-all", done && "bg-emerald-500/5")}>
                      <div className={cn("w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0", done ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground")}>
                        {done ? <CheckCircle className="w-4 h-4" /> : s.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", done ? "text-emerald-400" : "text-foreground")}>{s.nameTransliterated}</p>
                        <p className="text-xs text-muted-foreground">{s.ayahCount} verses · {SURAH_PAGES[s.number] ?? 1}p</p>
                      </div>
                      {!done ? (
                        <button
                          onClick={() => handleSurahComplete(s.number)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400 transition-all whitespace-nowrap"
                        >
                          Done
                        </button>
                      ) : (
                        <Link href={`/quran/${s.number}`}>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium cursor-pointer">Re-read</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={handleReset} className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Khatmah Progress
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
