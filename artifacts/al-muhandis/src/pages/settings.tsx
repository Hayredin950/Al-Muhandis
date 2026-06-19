import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings2, Type, Music2, Languages, Download, RotateCcw,
  Check, ChevronRight, Volume2, Eye, EyeOff, Palette,
} from "lucide-react";
import { useSettings, TRANSLATIONS, type AppSettings } from "@/hooks/use-settings";
import { RECITERS, useAudioPlayer } from "@/contexts/audio-player";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "display", label: "Display", icon: Type },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "audio", label: "Recitation", icon: Music2 },
  { id: "translation", label: "Translations", icon: Languages },
  { id: "downloads", label: "Downloads", icon: Download },
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const FONTS = [
  { id: "amiri", label: "Amiri Quran", sublabel: "Madinah script", arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", family: "'Amiri Quran', serif" },
  { id: "scheherazade", label: "Scheherazade", sublabel: "Naskh script", arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", family: "'Scheherazade New', serif" },
  { id: "noto-naskh", label: "Noto Naskh", sublabel: "IndoPak style", arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", family: "'Noto Naskh Arabic', serif" },
];

const DOWNLOAD_ITEMS = [
  {
    category: "Reciters",
    items: [
      { id: "mishary", name: "Mishary Rashid Alafasy", size: "2.8 GB", downloaded: false },
      { id: "maher", name: "Maher Al-Muaiqly", size: "2.4 GB", downloaded: false },
      { id: "abdulbasit", name: "Abdul Basit Murattal", size: "2.1 GB", downloaded: false },
      { id: "saad", name: "Saad Al-Ghamdi", size: "1.9 GB", downloaded: false },
    ],
  },
  {
    category: "Translations",
    items: [
      { id: "sahih-int", name: "Sahih International (English)", size: "1.2 MB", downloaded: true },
      { id: "pickthall", name: "Pickthall (English)", size: "1.1 MB", downloaded: false },
      { id: "amharic", name: "Sadiq & Sani (Amharic)", size: "1.4 MB", downloaded: false },
      { id: "urdu", name: "Jalandhry (Urdu)", size: "1.3 MB", downloaded: false },
    ],
  },
  {
    category: "Tafseer",
    items: [
      { id: "ibn-kathir-en", name: "Ibn Kathir (English)", size: "15 MB", downloaded: false },
      { id: "jalalayn", name: "Tafseer al-Jalalayn", size: "12 MB", downloaded: false },
      { id: "tabari", name: "Tafseer at-Tabari (Arabic)", size: "48 MB", downloaded: false },
    ],
  },
];

const THEME_OPTIONS = [
  {
    id: "dark" as const,
    label: "Dark",
    desc: "Dark background, easy on the eyes at night",
    preview: "bg-slate-900 border-slate-700",
    dot: "bg-slate-200",
  },
  {
    id: "light" as const,
    label: "Light",
    desc: "Clean white background for daytime reading",
    preview: "bg-white border-slate-200",
    dot: "bg-slate-800",
  },
  {
    id: "system" as const,
    label: "System",
    desc: "Automatically matches your device setting",
    preview: "bg-gradient-to-br from-slate-900 to-white border-slate-400",
    dot: "bg-primary",
  },
];

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { reciterId, setReciterId, speed: audioSpeed, setSpeed } = useAudioPlayer();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("display");
  const [downloadStates, setDownloadStates] = useState<Record<string, "idle" | "downloading" | "done">>({
    "sahih-int": "done",
  });

  const handleDownload = (id: string) => {
    setDownloadStates((prev) => ({ ...prev, [id]: "downloading" }));
    setTimeout(() => {
      setDownloadStates((prev) => ({ ...prev, [id]: "done" }));
    }, 2000);
  };

  const arabicFontFamily =
    settings.mushafFont === "scheherazade" ? "'Scheherazade New', serif" :
    settings.mushafFont === "noto-naskh" ? "'Noto Naskh Arabic', serif" :
    "'Amiri Quran', serif";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Customize your reading and listening experience</p>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center",
                activeTab === id
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Theme Settings */}
        {activeTab === "theme" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-1">App Theme</p>
              <p className="text-xs text-muted-foreground mb-4">Choose how Al-Muhandis looks on your device</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      theme === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {/* Mini preview */}
                    <div className={cn("w-full h-12 rounded-lg border-2 flex items-center justify-center gap-1.5", opt.preview)}>
                      <div className={cn("w-3 h-3 rounded-full", opt.dot)} />
                      <div className={cn("w-3 h-3 rounded-full opacity-60", opt.dot)} />
                      <div className={cn("w-3 h-3 rounded-full opacity-30", opt.dot)} />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className={cn("text-sm font-semibold", theme === opt.id ? "text-primary" : "text-foreground")}>{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                      {theme === opt.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-1">Color Accent</p>
              <p className="text-xs text-muted-foreground mb-4">The primary color used throughout the app</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Amber (default)", value: "#d97706", cls: "bg-amber-600" },
                  { label: "Emerald", value: "#10b981", cls: "bg-emerald-500" },
                  { label: "Blue", value: "#3b82f6", cls: "bg-blue-500" },
                  { label: "Rose", value: "#f43f5e", cls: "bg-rose-500" },
                  { label: "Violet", value: "#8b5cf6", cls: "bg-violet-500" },
                  { label: "Teal", value: "#14b8a6", cls: "bg-teal-500" },
                ].map((accent) => (
                  <button
                    key={accent.value}
                    title={accent.label}
                    onClick={() => {
                      document.documentElement.style.setProperty("--primary-raw", accent.value);
                      localStorage.setItem("al-muhandis-accent", accent.value);
                    }}
                    className={cn("w-8 h-8 rounded-full border-2 transition-all", accent.cls,
                      localStorage.getItem("al-muhandis-accent") === accent.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-110"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Color accent applies on next page load</p>
            </div>
          </motion.div>
        )}

        {/* Display Settings */}
        {activeTab === "display" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Arabic font size */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Arabic Font Size</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Adjust size of Quranic text</p>
                </div>
                <span className="text-sm font-mono text-primary">{settings.arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min={18}
                max={44}
                step={2}
                value={settings.arabicFontSize}
                onChange={(e) => updateSetting("arabicFontSize", parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border text-right" dir="rtl">
                <p style={{ fontFamily: arabicFontFamily, fontSize: `${settings.arabicFontSize}px`, lineHeight: 2 }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            </div>

            {/* Translation font size */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Translation Font Size</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Adjust size of translation text</p>
                </div>
                <span className="text-sm font-mono text-primary">{settings.translationFontSize}px</span>
              </div>
              <input
                type="range"
                min={11}
                max={20}
                step={1}
                value={settings.translationFontSize}
                onChange={(e) => updateSetting("translationFontSize", parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                <p style={{ fontSize: `${settings.translationFontSize}px`, lineHeight: 1.7 }} className="text-muted-foreground">
                  In the name of Allah, the Most Gracious, the Most Merciful.
                </p>
              </div>
            </div>

            {/* Arabic font */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-1">Arabic Font</p>
              <p className="text-xs text-muted-foreground mb-4">Choose the Quranic typeface</p>
              <div className="grid grid-cols-2 gap-3">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSetting("mushafFont", f.id as AppSettings["mushafFont"])}
                    className={cn(
                      "p-4 rounded-xl border text-right transition-all",
                      settings.mushafFont === f.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    )}
                    dir="rtl"
                  >
                    <p style={{ fontFamily: f.family, fontSize: "1.2rem", lineHeight: 2 }}>{f.arabic}</p>
                    <p className="text-xs text-muted-foreground mt-1 text-left">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 text-left">{f.sublabel}</p>
                    {settings.mushafFont === f.id && (
                      <div className="flex justify-end mt-1">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quran Reader Toggles */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/20 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quran Reader</p>
              </div>
              <div className="divide-y divide-border">
                {([
                  { key: "showTransliteration" as const, label: "Show Transliteration", desc: "Display phonetic pronunciation below Arabic" },
                  { key: "showWordByWord" as const, label: "Word-by-Word Analysis", desc: "Enable word analysis when ayah is expanded" },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(key, !settings[key])}
                      className={cn("relative w-11 h-6 rounded-full transition-all", settings[key] ? "bg-primary" : "bg-muted")}
                    >
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: settings[key] ? "calc(100% - 22px)" : "2px" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mushaf Toggles */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/20 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mushaf View</p>
              </div>
              <div className="divide-y divide-border">
                {([
                  { key: "tajweedColoring" as const, label: "Tajweed Colors", desc: "Color-code Arabic text by Tajweed rules (Qalqalah, Madd, Ghunna, etc.)" },
                  { key: "showMushafTranslation" as const, label: "Show Translation Block", desc: "Display full translation below the Arabic Mushaf text" },
                  { key: "showMushafTransliteration" as const, label: "Show Transliteration", desc: "Show phonetic pronunciation in the Mushaf translation block" },
                  { key: "autoScroll" as const, label: "Auto-Scroll with Audio", desc: "Automatically scroll to the current ayah while playing" },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(key, !settings[key])}
                      className={cn("relative w-11 h-6 rounded-full transition-all shrink-0", settings[key] ? "bg-primary" : "bg-muted")}
                    >
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: settings[key] ? "calc(100% - 22px)" : "2px" }} />
                    </button>
                  </div>
                ))}
                {/* Auto-scroll speed (shown only when auto-scroll is on) */}
                {settings.autoScroll && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Auto-Scroll Speed</p>
                      <span className="text-xs font-mono text-primary">{settings.autoScrollSpeed}x</span>
                    </div>
                    <input
                      type="range" min={1} max={5} step={1}
                      value={settings.autoScrollSpeed}
                      onChange={(e) => updateSetting("autoScrollSpeed", parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Slow</span><span>Fast</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Settings */}
        {activeTab === "audio" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Select Reciter</p>
              <div className="space-y-2">
                {RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setReciterId(r.id); updateSetting("reciterId", r.id); }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      reciterId === r.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30 hover:bg-accent/20"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      reciterId === r.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", reciterId === r.id ? "text-primary" : "text-foreground")}>
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground" dir="rtl">{r.nameArabic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{r.style}</span>
                      {reciterId === r.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Playback Speed</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); updateSetting("playbackSpeed", s); }}
                    className={cn(
                      "py-2.5 rounded-xl border text-sm font-mono font-semibold transition-all",
                      (audioSpeed === s)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Advance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatically play the next verse when finished</p>
                </div>
                <button
                  onClick={() => updateSetting("autoAdvance", !settings.autoAdvance)}
                  className={cn("relative w-11 h-6 rounded-full transition-all", settings.autoAdvance ? "bg-primary" : "bg-muted")}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: settings.autoAdvance ? "calc(100% - 22px)" : "2px" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Translation Settings */}
        {activeTab === "translation" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Active Translation</p>
              <p className="text-xs text-muted-foreground mb-3">This translation will appear under each verse in the Quran reader</p>
              <div className="space-y-2">
                {TRANSLATIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSetting("translationId", t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      settings.translationId === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30 hover:bg-accent/20"
                    )}
                  >
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", settings.translationId === t.id ? "text-primary" : "text-foreground")}>
                        {t.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t.language}</span>
                        <span className="text-xs text-muted-foreground">{t.author}</span>
                      </div>
                    </div>
                    {settings.translationId === t.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Downloads */}
        {activeTab === "downloads" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-accent/10">
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download content for offline access. Reciters require significant storage space. 
                  Translations and Tafseer are small files.
                </p>
              </div>
            </div>

            {DOWNLOAD_ITEMS.map((section) => (
              <div key={section.category} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/20">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{section.category}</p>
                </div>
                <div className="divide-y divide-border">
                  {section.items.map((item) => {
                    const state = downloadStates[item.id] ?? (item.downloaded ? "done" : "idle");
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>
                        </div>
                        {state === "done" ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Downloaded</span>
                          </div>
                        ) : state === "downloading" ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="hidden sm:inline">Downloading…</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownload(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:border-primary/40 hover:bg-accent/20 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Data management */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Data Management</p>
          <p className="text-xs text-muted-foreground mb-4">Manage your locally stored app data</p>
          <div className="space-y-2">
            {[
              { key: "search-history", label: "Search History", desc: "Recent search queries" },
              { key: "recently-viewed-hadiths", label: "Recently Viewed Hadiths", desc: "Hadith reading history" },
              { key: "ask-scholar-history", label: "Ask Scholar Conversation", desc: "AI chat history" },
              { key: "flashcard-history", label: "Flashcard Session History", desc: "Past flashcard scores" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
                <button
                  onClick={() => { localStorage.removeItem(key); window.dispatchEvent(new Event("storage")); }}
                  className="px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="mt-4">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-all px-4 py-2 rounded-lg hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reset display settings to defaults
          </button>
        </div>

        {/* About */}
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-1">About Al-Muhandis</p>
          <p className="text-xs text-muted-foreground mb-4">Islamic Intelligence Platform</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="text-foreground font-mono">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Quran data</span>
              <span className="text-foreground">114 Surahs · 6,236 Verses</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hadith collections</span>
              <span className="text-foreground">9 Major Collections</span>
            </div>
            <div className="flex items-center justify-between">
              <span>AI model</span>
              <span className="text-foreground">GPT-5 Mini</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed border-t border-border pt-3">
            Al-Muhandis is built for Muslims who want a comprehensive, modern, and AI-powered Islamic study companion. All AI-generated content is for educational purposes — always verify with qualified scholars.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
