const STORAGE_KEY = "al-muhandis-reading-tracker";

export interface ReadingSession {
  date: string;
  surahIds: number[];
  ayahCount: number;
  minutesSpent: number;
}

export interface ReadingTracker {
  currentStreak: number;
  longestStreak: number;
  totalDaysRead: number;
  totalAyahsRead: number;
  lastReadDate: string | null;
  sessions: Record<string, ReadingSession>;
  khatmahProgress: KhatmahProgress | null;
}

export interface KhatmahProgress {
  startDate: string;
  targetDays: number;
  totalPages: number;
  completedSurahs: number[];
  completedPages: number;
  planName: string;
}

const DEFAULT_TRACKER: ReadingTracker = {
  currentStreak: 0,
  longestStreak: 0,
  totalDaysRead: 0,
  totalAyahsRead: 0,
  lastReadDate: null,
  sessions: {},
  khatmahProgress: null,
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round(Math.abs(da - db) / 86400000);
}

export function loadTracker(): ReadingTracker {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRACKER;
    return { ...DEFAULT_TRACKER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRACKER;
  }
}

export function saveTracker(t: ReadingTracker): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {}
}

export function recordReading(surahId: number, ayahCount = 1): ReadingTracker {
  const tracker = loadTracker();
  const todayStr = today();

  if (!tracker.sessions[todayStr]) {
    tracker.sessions[todayStr] = {
      date: todayStr,
      surahIds: [],
      ayahCount: 0,
      minutesSpent: 0,
    };
    tracker.totalDaysRead++;

    if (tracker.lastReadDate === null) {
      tracker.currentStreak = 1;
    } else {
      const diff = daysBetween(tracker.lastReadDate, todayStr);
      if (diff === 1) {
        tracker.currentStreak++;
      } else if (diff > 1) {
        tracker.currentStreak = 1;
      }
    }

    if (tracker.currentStreak > tracker.longestStreak) {
      tracker.longestStreak = tracker.currentStreak;
    }

    tracker.lastReadDate = todayStr;
  }

  const session = tracker.sessions[todayStr]!;
  if (!session.surahIds.includes(surahId)) {
    session.surahIds.push(surahId);
  }
  session.ayahCount += ayahCount;
  tracker.totalAyahsRead += ayahCount;

  saveTracker(tracker);
  return tracker;
}

export function getReadingHeatmap(days = 90): Array<{ date: string; count: number }> {
  const tracker = loadTracker();
  const result: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const session = tracker.sessions[dateStr];
    result.push({ date: dateStr, count: session?.ayahCount ?? 0 });
  }
  return result;
}

export function startKhatmah(planName: string, targetDays: number): ReadingTracker {
  const tracker = loadTracker();
  tracker.khatmahProgress = {
    startDate: today(),
    targetDays,
    totalPages: 604,
    completedSurahs: [],
    completedPages: 0,
    planName,
  };
  saveTracker(tracker);
  return tracker;
}

export function markSurahComplete(surahId: number, surahPages: number): ReadingTracker {
  const tracker = loadTracker();
  if (!tracker.khatmahProgress) return tracker;
  if (!tracker.khatmahProgress.completedSurahs.includes(surahId)) {
    tracker.khatmahProgress.completedSurahs.push(surahId);
    tracker.khatmahProgress.completedPages += surahPages;
  }
  saveTracker(tracker);
  return tracker;
}

export function getKhatmahPercentage(tracker: ReadingTracker): number {
  if (!tracker.khatmahProgress) return 0;
  return Math.min(100, Math.round((tracker.khatmahProgress.completedPages / 604) * 100));
}

export function getDailyTarget(tracker: ReadingTracker): number {
  if (!tracker.khatmahProgress) return 0;
  const start = new Date(tracker.khatmahProgress.startDate);
  const now = new Date();
  const daysPassed = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000));
  const remaining = tracker.khatmahProgress.targetDays - daysPassed;
  const pagesLeft = tracker.khatmahProgress.totalPages - tracker.khatmahProgress.completedPages;
  if (remaining <= 0 || pagesLeft <= 0) return 0;
  return Math.ceil(pagesLeft / remaining);
}
