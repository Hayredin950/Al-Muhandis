import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen, ScrollText, Search, Bookmark, TrendingUp, Moon, Tag, Settings2,
  Flame, CalendarDays, Target, Zap, BookMarked, ShieldX, Pencil, Library, User,
} from "lucide-react";
import { useGetQuranSummary, useGetDailyAyah, useGetHadithSummary } from "@workspace/api-client-react";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { loadTracker, getKhatmahPercentage, type ReadingTracker } from "@/lib/reading-tracker";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface DailyHadith {
  id: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  collectionId: string;
  collectionName: string;
}

export default function Home() {
  const { data: quranSummary } = useGetQuranSummary();
  const { data: dailyAyah } = useGetDailyAyah();
  const { data: hadithSummary } = useGetHadithSummary();
  const { settings } = useSettings();
  const { data: dailyHadith } = useQuery<DailyHadith>({
    queryKey: ["hadith", "daily"],
    queryFn: () => fetch(`${BASE_URL}/api/hadith/daily`).then((r) => r.json()),
    staleTime: 1000 * 60 * 60,
  });

  const [tracker, setTracker] = useState<ReadingTracker | null>(null);
  useEffect(() => {
    setTracker(loadTracker());
  }, []);

  const stats = [
    { label: "Surahs", value: quranSummary?.totalSurahs ?? "114", sub: `${quranSummary?.makkiSurahs ?? 86} Meccan · ${quranSummary?.madaniSurahs ?? 28} Medinan` },
    { label: "Ayahs", value: quranSummary?.totalAyahs?.toLocaleString() ?? "6,236", sub: "Verses of Revelation" },
    { label: "Collections", value: hadithSummary?.totalCollections ?? "9", sub: "Major Hadith Collections" },
    { label: "Hadiths", value: hadithSummary?.totalHadiths?.toLocaleString() ?? "—", sub: "Prophetic Traditions" },
  ];

  const quickLinks = [
    { href: "/quran", label: "Quran Reader", desc: "Read, listen, and reflect on the Holy Quran", icon: BookOpen, color: "bg-emerald-500/10 text-emerald-400", badge: null },
    { href: "/hadith", label: "Hadith Library", desc: "Explore prophetic traditions across 9 major collections", icon: ScrollText, color: "bg-amber-500/10 text-amber-400", badge: null },
    { href: "/search", label: "Unified Search", desc: "Search Quran, Hadith, and Tafseer simultaneously", icon: Search, color: "bg-blue-500/10 text-blue-400", badge: null },
    { href: "/hifz", label: "Memorization", desc: "Hifz practice with guided peeking and progress", icon: Target, color: "bg-violet-500/10 text-violet-400", badge: "New" },
    { href: "/khatmah", label: "Khatmah Planner", desc: "Complete the Quran on a structured schedule", icon: CalendarDays, color: "bg-rose-500/10 text-rose-400", badge: "New" },
    { href: "/analytics", label: "Analytics", desc: "Reading streaks, heatmap and achievements", icon: TrendingUp, color: "bg-blue-500/10 text-blue-400", badge: null },
    { href: "/bookmarks", label: "Bookmarks", desc: "Your saved ayahs, hadiths, and notes", icon: Bookmark, color: "bg-teal-500/10 text-teal-400", badge: null },
    { href: "/topics", label: "Topics & Scholars", desc: "Browse by topic or explore great scholars", icon: Tag, color: "bg-orange-500/10 text-orange-400", badge: null },
    { href: "/hadith/flashcards", label: "Hadith Flash Cards", desc: "Test your knowledge of prophetic traditions", icon: BookMarked, color: "bg-amber-500/10 text-amber-400", badge: "New" },
    { href: "/hadith/weak", label: "Weak Hadiths", desc: "Identify common fabricated and weak narrations", icon: ShieldX, color: "bg-red-500/10 text-red-400", badge: "New" },
    { href: "/collections", label: "My Collections", desc: "Custom playlists and curated hadith sets", icon: Library, color: "bg-indigo-500/10 text-indigo-400", badge: null },
    { href: "/profile", label: "My Profile", desc: "Reading stats, achievements and progress", icon: User, color: "bg-pink-500/10 text-pink-400", badge: null },
    { href: "/journal", label: "My Journal", desc: "Your personal notes and reflections", icon: Pencil, color: "bg-primary/10 text-primary", badge: null },
    { href: "/settings", label: "Settings", desc: "Customize fonts, reciters, translations, and more", icon: Settings2, color: "bg-muted text-muted-foreground", badge: null },
  ];

  const arabicFontFamily = settings.mushafFont === "scheherazade"
    ? "'Scheherazade New', serif"
    : "'Amiri Quran', serif";

  const khatmahPct = tracker ? getKhatmahPercentage(tracker) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Moon className="w-3.5 h-3.5" />
            <span>In the Name of Allah, the Most Gracious, the Most Merciful</span>
          </div>
          {(() => {
            try {
              const hijri = new Intl.DateTimeFormat("en-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
              return <span className="text-xs text-muted-foreground/70 shrink-0">{hijri}</span>;
            } catch { return null; }
          })()}
        </div>
        <h1 className="text-3xl font-bold text-foreground">Al-Muhandis</h1>
        <p className="text-muted-foreground mt-1">Your unified Islamic intelligence companion</p>
      </motion.div>

      {/* Reading Streak + Khatmah progress */}
      {tracker && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{tracker.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{tracker.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Best streak</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{tracker.totalAyahsRead.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ayahs read</p>
              </div>
            </div>
            {tracker.khatmahProgress ? (
              <Link href="/khatmah">
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 cursor-pointer hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-primary">Khatmah</p>
                    <span className="text-xs font-bold text-primary">{khatmahPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${khatmahPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{tracker.khatmahProgress.planName}</p>
                </div>
              </Link>
            ) : (
              <Link href="/khatmah">
                <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-accent/20 transition-all h-full">
                  <CalendarDays className="w-5 h-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Start Khatmah</p>
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Daily Ayah */}
      {dailyAyah && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5 }}>
          <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-4 uppercase tracking-wide">
              <TrendingUp className="w-3.5 h-3.5" />
              Daily Ayah
            </div>
            <p
              className="text-right leading-loose mb-4 text-foreground"
              dir="rtl"
              style={{ fontFamily: arabicFontFamily, fontSize: `${settings.arabicFontSize}px`, lineHeight: 2.2 }}
            >
              {dailyAyah.arabicText}
            </p>
            <p className="text-muted-foreground leading-relaxed italic" style={{ fontSize: `${settings.translationFontSize}px` }}>
              "{dailyAyah.translation}"
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">{dailyAyah.surahName} · Verse {dailyAyah.ayahNumber}</span>
              <Link href={`/quran/${dailyAyah.surahId}?ayah=${dailyAyah.ayahNumber}`}>
                <span className="text-xs text-primary hover:underline cursor-pointer">Read in context →</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prayer Times */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <PrayerTimesWidget />
      </motion.div>

      {/* Daily Hadith */}
      {dailyHadith && dailyHadith.translation && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }}>
          <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            <div className="flex items-center gap-2 text-xs font-medium text-amber-500 mb-4 uppercase tracking-wide">
              <ScrollText className="w-3.5 h-3.5" />
              Daily Hadith
            </div>
            {dailyHadith.arabicText && (
              <p
                className="text-right leading-loose mb-4 text-foreground/90"
                dir="rtl"
                style={{ fontFamily: arabicFontFamily, fontSize: `${Math.min(settings.arabicFontSize, 22)}px`, lineHeight: 2.2 }}
              >
                {dailyHadith.arabicText.slice(0, 300)}{dailyHadith.arabicText.length > 300 ? "..." : ""}
              </p>
            )}
            <p className="text-muted-foreground leading-relaxed italic" style={{ fontSize: `${settings.translationFontSize}px` }}>
              "{dailyHadith.translation.slice(0, 220)}{dailyHadith.translation.length > 220 ? "..." : ""}"
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                {dailyHadith.narrator ? `Narrated by ${dailyHadith.narrator}` : dailyHadith.collectionName}
              </span>
              <Link href={`/hadith/${dailyHadith.collectionId}/${dailyHadith.hadithNumber}`}>
                <span className="text-xs text-amber-500 hover:underline cursor-pointer">Read full hadith →</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{stat.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ href, label, desc, icon: Icon, color, badge }) => (
            <Link key={href} href={href}>
              <div className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all group relative overflow-hidden h-full">
                {badge && (
                  <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                    {badge}
                  </span>
                )}
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recently Viewed Hadiths */}
      {(() => {
        try {
          const recent = JSON.parse(localStorage.getItem("recently-viewed-hadiths") ?? "[]") as Array<{ collectionId: string; hadithNumber: string; collectionName: string; translation: string }>;
          if (recent.length === 0) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.5 }}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Continue Reading</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {recent.slice(0, 5).map((h) => (
                  <Link key={`${h.collectionId}-${h.hadithNumber}`} href={`/hadith/${h.collectionId}/${h.hadithNumber}`}>
                    <div className="flex-shrink-0 w-64 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer">
                      <p className="text-xs font-medium text-primary mb-1.5">{h.collectionName} #{h.hadithNumber}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{h.translation}…</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          );
        } catch { return null; }
      })()}

      {/* Today's Study Plan */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Today's Study Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: "/hadith/bukhari",
              title: "Read Sahih Bukhari",
              desc: "Start with the most authentic collection",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
              icon: "ب",
            },
            {
              href: "/search",
              title: "Search a Topic",
              desc: "Explore patience, gratitude, or prayer",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              icon: "🔍",
            },
            {
              href: "/hadith/flashcards",
              title: "Flash Card Session",
              desc: "Review 20 hadiths and track your score",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
              icon: "📚",
            },
          ].map(({ href, title, desc, color, bg, border, icon }) => (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${border} ${bg} hover:opacity-80 transition-all cursor-pointer group`}>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 text-base font-bold ${color}`}>
                  {icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${color}`}>{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Hadith Grade Breakdown */}
      {hadithSummary && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.5 }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Hadith Authenticity Overview</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-500">{hadithSummary.gradeBreakdown.sahih}</p>
                <p className="text-xs font-medium text-foreground mt-1">Sahih</p>
                <p className="text-xs text-muted-foreground">Authentic</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-400">{hadithSummary.gradeBreakdown.hasan}</p>
                <p className="text-xs font-medium text-foreground mt-1">Hasan</p>
                <p className="text-xs text-muted-foreground">Good</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-500">{hadithSummary.gradeBreakdown.daif}</p>
                <p className="text-xs font-medium text-foreground mt-1">Da'if</p>
                <p className="text-xs text-muted-foreground">Weak</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Islamic Calendar Events */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33, duration: 0.5 }}>
        {(() => {
          const events = [
            { name: "Muharram (Islamic New Year)", arabic: "محرم", month: 0, day: 1, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { name: "Day of Ashura", arabic: "يوم عاشوراء", month: 0, day: 10, color: "text-blue-400", bg: "bg-blue-500/10" },
            { name: "Mawlid al-Nabi ﷺ", arabic: "مولد النبي", month: 2, day: 12, color: "text-amber-400", bg: "bg-amber-500/10" },
            { name: "Isra' wal-Mi'raj", arabic: "الإسراء والمعراج", month: 6, day: 27, color: "text-violet-400", bg: "bg-violet-500/10" },
            { name: "Laylat al-Bara'ah", arabic: "ليلة البراءة", month: 7, day: 15, color: "text-teal-400", bg: "bg-teal-500/10" },
            { name: "Ramadan Begins", arabic: "رمضان", month: 8, day: 1, color: "text-primary", bg: "bg-primary/10" },
            { name: "Laylat al-Qadr", arabic: "ليلة القدر", month: 8, day: 27, color: "text-primary", bg: "bg-primary/15" },
            { name: "Eid al-Fitr", arabic: "عيد الفطر", month: 9, day: 1, color: "text-rose-400", bg: "bg-rose-500/10" },
            { name: "Arafah (Hajj)", arabic: "يوم عرفة", month: 11, day: 9, color: "text-orange-400", bg: "bg-orange-500/10" },
            { name: "Eid al-Adha", arabic: "عيد الأضحى", month: 11, day: 10, color: "text-rose-400", bg: "bg-rose-500/10" },
          ];
          const nowHijri = new Date();
          let hijriMonth = 0;
          try {
            const hm = new Intl.DateTimeFormat("en-u-ca-islamic", { month: "numeric" }).format(nowHijri);
            const hd = new Intl.DateTimeFormat("en-u-ca-islamic", { day: "numeric" }).format(nowHijri);
            hijriMonth = parseInt(hm) - 1;
            const hijriDay = parseInt(hd);
            const upcoming = events
              .map((e) => {
                let diff = (e.month - hijriMonth) * 30 + (e.day - hijriDay);
                if (diff < 0) diff += 360;
                return { ...e, diff };
              })
              .sort((a, b) => a.diff - b.diff)
              .slice(0, 3);
            return (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Islamic Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {upcoming.map((e) => (
                    <div key={e.name} className={`rounded-xl border border-border bg-card p-4`}>
                      <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${e.color}`}>
                        {e.diff === 0 ? "Today" : e.diff === 1 ? "Tomorrow" : `In ~${e.diff} days`}
                      </div>
                      <p style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.1rem" }} dir="rtl" className="text-right text-foreground mb-1">{e.arabic}</p>
                      <p className="text-sm font-medium text-foreground leading-tight">{e.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          } catch { return null; }
        })()}
      </motion.div>

      {/* Did You Know */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        {(() => {
          const facts = [
            { fact: "The word 'Quran' is derived from the Arabic root meaning 'to recite.' It was revealed over 23 years to the Prophet Muhammad ﷺ.", icon: "📖" },
            { fact: "Imam al-Bukhari traveled over 1,000 miles to collect hadiths and authenticated only 7,563 out of 600,000 narrations he examined.", icon: "🕌" },
            { fact: "Surah Al-Fatiha is the most recited chapter in the Quran — a Muslim recites it at least 17 times each day during prayer.", icon: "☀️" },
            { fact: "Imam Muslim spent 15 years compiling Sahih Muslim. He reportedly wept while writing it out of reverence and care.", icon: "📜" },
            { fact: "The longest verse in the Quran is Al-Baqarah 2:282, known as Ayat al-Mudayanah (the verse of debt), spanning many lines of text.", icon: "✍️" },
            { fact: "The Nawawi Forty Hadith collection, compiled by Imam an-Nawawi, contains hadiths that cover every major aspect of Islamic practice.", icon: "🌟" },
          ];
          const today = new Date().getDay();
          const fact = facts[today % facts.length]!;
          return (
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/10 p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0">{fact.icon}</span>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Did You Know?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{fact.fact}</p>
              </div>
            </div>
          );
        })()}
      </motion.div>

      {/* Featured collections */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.5 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Featured Collections</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "bukhari", name: "Sahih Bukhari", arabic: "صحيح البخاري", count: "7,563" },
            { id: "muslim", name: "Sahih Muslim", arabic: "صحيح مسلم", count: "7,500" },
            { id: "nawawi-40", name: "40 Hadith", arabic: "الأربعون النووية", count: "42" },
            { id: "malik", name: "Muwatta Malik", arabic: "موطأ مالك", count: "1,720" },
          ].map((c) => (
            <Link key={c.id} href={`/hadith/${c.id}`}>
              <div className="flex-shrink-0 w-44 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer">
                <p className="text-sm" style={{ fontFamily: arabicFontFamily }} dir="rtl">{c.arabic}</p>
                <p className="text-xs font-semibold text-foreground mt-2">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.count} hadiths</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
