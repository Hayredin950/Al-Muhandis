import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, ChevronRight, BookOpen, Star, Users, Flame, Search, ExternalLink, GitCompare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopicDef {
  id: string;
  name: string;
  nameArabic: string;
  desc: string;
  longDesc: string;
  count: number;
  color: string;
  bg: string;
  textColor: string;
  icon: string;
  keywords: string[];
  collections: string[];
}

export const TOPICS: TopicDef[] = [
  {
    id: "tawhid", name: "Tawḥīd", nameArabic: "التوحيد", icon: "☀️",
    desc: "Oneness of Allah, monotheism",
    longDesc: "The foundational pillar of Islam — the absolute oneness of Allah, His attributes, His names, and the prohibition of associating partners with Him.",
    count: 1247, color: "border-amber-500/30", bg: "bg-amber-500/10", textColor: "text-amber-400",
    keywords: ["tawhid", "monotheism", "oneness", "la ilaha illallah", "shirk", "polytheism", "allah alone"],
    collections: ["bukhari", "muslim", "nawawi-40"],
  },
  {
    id: "salah", name: "Prayer", nameArabic: "الصلاة", icon: "🕌",
    desc: "Obligatory and voluntary prayers",
    longDesc: "The second pillar of Islam — the five daily prayers, their conditions, times, physical postures, and the spiritual dimensions of standing before Allah.",
    count: 892, color: "border-emerald-500/30", bg: "bg-emerald-500/10", textColor: "text-emerald-400",
    keywords: ["prayer", "salah", "salat", "prostration", "sujud", "rakat", "wudu", "ablution", "mosque"],
    collections: ["bukhari", "muslim", "abu-dawud"],
  },
  {
    id: "fasting", name: "Fasting", nameArabic: "الصيام", icon: "🌙",
    desc: "Ramadan and voluntary fasting",
    longDesc: "Fasting in Ramadan and voluntary fasts — the spiritual discipline of abstaining from food, drink, and desires from dawn to sunset in worship of Allah.",
    count: 392, color: "border-blue-500/30", bg: "bg-blue-500/10", textColor: "text-blue-400",
    keywords: ["fasting", "ramadan", "sawm", "iftar", "suhoor", "laylat al-qadr", "night of power"],
    collections: ["bukhari", "muslim", "abu-dawud", "tirmidhi"],
  },
  {
    id: "zakat", name: "Zakāt", nameArabic: "الزكاة", icon: "💛",
    desc: "Obligatory charity and wealth purification",
    longDesc: "The third pillar — purification of wealth through obligatory charity given to those in need, with precise rules on nisab, calculation, and eligible recipients.",
    count: 421, color: "border-green-500/30", bg: "bg-green-500/10", textColor: "text-green-400",
    keywords: ["zakat", "charity", "alms", "nisab", "sadaqah", "giving", "poor"],
    collections: ["bukhari", "muslim", "abu-dawud"],
  },
  {
    id: "hajj", name: "Ḥajj", nameArabic: "الحج", icon: "🕋",
    desc: "Pilgrimage to Makkah",
    longDesc: "The fifth pillar — the annual pilgrimage to Makkah that every able Muslim must perform once in a lifetime, including tawaf, sa'i, and standing at Arafah.",
    count: 287, color: "border-stone-500/30", bg: "bg-stone-500/10", textColor: "text-stone-400",
    keywords: ["hajj", "pilgrimage", "makkah", "kaaba", "ihram", "tawaf", "arafah", "mina"],
    collections: ["bukhari", "muslim", "abu-dawud"],
  },
  {
    id: "iman", name: "Faith", nameArabic: "الإيمان", icon: "✨",
    desc: "Pillars and branches of faith",
    longDesc: "The six pillars of iman — belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree — and the seventy-odd branches of faith.",
    count: 723, color: "border-violet-500/30", bg: "bg-violet-500/10", textColor: "text-violet-400",
    keywords: ["faith", "belief", "iman", "pillars of faith", "angels", "qadar", "decree", "certainty"],
    collections: ["bukhari", "muslim", "nawawi-40"],
  },
  {
    id: "quran", name: "Qurʾān", nameArabic: "القرآن", icon: "📖",
    desc: "Virtues and recitation of the Quran",
    longDesc: "The virtues of reading, memorizing, and acting upon the Quran — the speech of Allah revealed to the Prophet ﷺ, a guidance and mercy for all of humanity.",
    count: 512, color: "border-primary/30", bg: "bg-primary/10", textColor: "text-primary",
    keywords: ["quran", "recitation", "tilawah", "memorize", "hafiz", "surah", "ayah"],
    collections: ["bukhari", "muslim", "tirmidhi"],
  },
  {
    id: "akhlaq", name: "Ethics", nameArabic: "الأخلاق", icon: "⚖️",
    desc: "Character, manners, and moral conduct",
    longDesc: "Islamic ethics and character — truthfulness, humility, generosity, patience, good treatment of others, and the Prophet's ﷺ description as the best of character.",
    count: 634, color: "border-cyan-500/30", bg: "bg-cyan-500/10", textColor: "text-cyan-400",
    keywords: ["manners", "character", "ethics", "morals", "truthfulness", "honesty", "patience", "anger", "kindness"],
    collections: ["bukhari", "muslim", "abu-dawud", "tirmidhi"],
  },
  {
    id: "ilm", name: "Knowledge", nameArabic: "العلم", icon: "📚",
    desc: "Seeking and spreading knowledge",
    longDesc: "The obligation and virtue of seeking Islamic knowledge, the responsibility of scholars to teach, and the Prophet's ﷺ emphasis on learning from the cradle to the grave.",
    count: 289, color: "border-indigo-500/30", bg: "bg-indigo-500/10", textColor: "text-indigo-400",
    keywords: ["knowledge", "seek", "scholar", "learn", "teach", "wisdom", "ignorance"],
    collections: ["bukhari", "muslim", "tirmidhi", "ibn-majah"],
  },
  {
    id: "family", name: "Family", nameArabic: "الأسرة", icon: "👨‍👩‍👧",
    desc: "Marriage, children, and family life",
    longDesc: "Marriage as half of one's deen, rights of spouses, raising children in Islam, treating parents with excellence, and maintaining family ties (silat al-rahim).",
    count: 512, color: "border-pink-500/30", bg: "bg-pink-500/10", textColor: "text-pink-400",
    keywords: ["marriage", "wife", "husband", "children", "family", "parents", "kinship", "divorce", "dowry"],
    collections: ["bukhari", "muslim", "abu-dawud", "tirmidhi"],
  },
  {
    id: "akhirah", name: "Afterlife", nameArabic: "الآخرة", icon: "🌟",
    desc: "Day of Judgment, Paradise, Hell",
    longDesc: "The reality of death, the grave, the Day of Resurrection, the weighing of deeds, the Sirat, intercession, and the eternal abodes of Jannah and Jahannam.",
    count: 534, color: "border-orange-500/30", bg: "bg-orange-500/10", textColor: "text-orange-400",
    keywords: ["paradise", "hell", "judgment", "resurrection", "death", "grave", "jannah", "jahannam", "hereafter"],
    collections: ["bukhari", "muslim", "tirmidhi"],
  },
  {
    id: "dua", name: "Supplication", nameArabic: "الدعاء", icon: "🤲",
    desc: "Duʿāʾ, dhikr, and remembrance of Allah",
    longDesc: "The weapon of the believer — specific supplications taught by the Prophet ﷺ for every occasion, from morning to evening, and the etiquette of asking Allah.",
    count: 445, color: "border-rose-500/30", bg: "bg-rose-500/10", textColor: "text-rose-400",
    keywords: ["supplication", "dua", "dhikr", "remembrance", "prayer to allah", "morning", "evening", "supplicate"],
    collections: ["abu-dawud", "tirmidhi", "nasai", "ibn-majah"],
  },
  {
    id: "prophets", name: "Prophets", nameArabic: "الأنبياء", icon: "⭐",
    desc: "Stories of the prophets and messengers",
    longDesc: "The stories and teachings of the prophets — Ibrahim, Musa, Isa, Yusuf, and others — and what the Prophet Muhammad ﷺ taught about them and their missions.",
    count: 312, color: "border-teal-500/30", bg: "bg-teal-500/10", textColor: "text-teal-400",
    keywords: ["prophet", "messenger", "ibrahim", "musa", "isa", "yusuf", "adam", "nuh", "previous nations"],
    collections: ["bukhari", "muslim"],
  },
  {
    id: "trade", name: "Trade", nameArabic: "التجارة", icon: "🏪",
    desc: "Business, transactions, and ḥalāl earnings",
    longDesc: "Islamic commercial law — halal and haram transactions, avoiding riba (usury), honesty in trade, and the Prophet's ﷺ guidance for righteous business conduct.",
    count: 176, color: "border-lime-500/30", bg: "bg-lime-500/10", textColor: "text-lime-500",
    keywords: ["trade", "business", "buying", "selling", "transaction", "riba", "interest", "usury", "halal"],
    collections: ["bukhari", "abu-dawud", "tirmidhi"],
  },
  {
    id: "medicine", name: "Medicine", nameArabic: "الطب النبوي", icon: "🌿",
    desc: "Prophetic medicine and health guidance",
    longDesc: "Prophetic medicine (al-Tibb al-Nabawi) — guidance on honey, black seed, cupping, and general health practices taught by the Prophet ﷺ for physical wellbeing.",
    count: 198, color: "border-red-500/30", bg: "bg-red-500/10", textColor: "text-red-400",
    keywords: ["medicine", "cure", "honey", "black seed", "cupping", "healing", "illness", "sickness"],
    collections: ["bukhari", "abu-dawud", "tirmidhi", "ibn-majah"],
  },
  {
    id: "jihad", name: "Striving", nameArabic: "الجهاد", icon: "🛡️",
    desc: "Striving in the path of Allah",
    longDesc: "The broader concept of jihad — striving against one's own nafs, maintaining justice, as well as the specific rulings and ethics of physical defense in Islam.",
    count: 423, color: "border-yellow-500/30", bg: "bg-yellow-500/10", textColor: "text-yellow-500",
    keywords: ["jihad", "striving", "path of allah", "fighting", "struggle", "nafs", "self"],
    collections: ["bukhari", "muslim", "abu-dawud"],
  },
  {
    id: "death", name: "Death & Grave", nameArabic: "الموت والقبر", icon: "🌑",
    desc: "Reminders of mortality and the grave",
    longDesc: "Hadiths reminding us of death's certainty, the trials of the grave, Munkar and Nakir, and the importance of preparation for meeting Allah.",
    count: 245, color: "border-slate-500/30", bg: "bg-slate-500/10", textColor: "text-slate-400",
    keywords: ["death", "grave", "funeral", "burial", "dead", "mourning", "angel of death", "barzakh"],
    collections: ["bukhari", "muslim", "abu-dawud", "tirmidhi"],
  },
  {
    id: "purification", name: "Purification", nameArabic: "الطهارة", icon: "💧",
    desc: "Ritual purity and cleanliness in Islam",
    longDesc: "The detailed laws of taharah (ritual purity) — wudu, ghusl, tayammum, istinja, and what invalidates purity — the gateway to all acts of worship.",
    count: 389, color: "border-sky-500/30", bg: "bg-sky-500/10", textColor: "text-sky-400",
    keywords: ["purity", "wudu", "ablution", "ghusl", "tayammum", "cleanliness", "tahara", "purification"],
    collections: ["bukhari", "muslim", "abu-dawud", "nasai"],
  },
];

export const FEATURED_SCHOLARS = [
  {
    name: "Imam al-Bukhārī", nameArabic: "الإمام البخاري", died: "256 AH", born: "194 AH",
    known: "Ṣaḥīḥ al-Bukhārī", bio: "Compiled the most authenticated collection of hadiths after the Quran, reportedly memorizing 600,000 hadiths and selecting only those with the most rigorous chains.",
    collections: ["bukhari"], icon: "ب",
  },
  {
    name: "Imam Muslim", nameArabic: "الإمام مسلم", died: "261 AH", born: "204 AH",
    known: "Ṣaḥīḥ Muslim", bio: "Compiled the second-most authenticated hadith collection. His methodology of grouping narrations of the same hadith together is considered his distinct contribution.",
    collections: ["muslim"], icon: "م",
  },
  {
    name: "Imam Abū Dāwūd", nameArabic: "الإمام أبو داود", died: "275 AH", born: "202 AH",
    known: "Sunan Abī Dāwūd", bio: "Focused heavily on fiqh-related hadiths. Reportedly reviewed 500,000 hadiths and selected 4,800 for his Sunan, a key reference for Islamic jurisprudence.",
    collections: ["abu-dawud"], icon: "د",
  },
  {
    name: "Imam at-Tirmidhī", nameArabic: "الإمام الترمذي", died: "279 AH", born: "209 AH",
    known: "Jāmiʿ at-Tirmidhī", bio: "Known for including grade assessments on each hadith and noting scholarly opinions, making his collection a unique reference for comparative fiqh.",
    collections: ["tirmidhi"], icon: "ت",
  },
  {
    name: "Imam an-Nasāʾī", nameArabic: "الإمام النسائي", died: "303 AH", born: "215 AH",
    known: "Sunan an-Nasāʾī", bio: "Known for his strict standards in narrators. His Sunan al-Mujtaba is considered the most critical in selecting narrators among the Six Books.",
    collections: ["nasai"], icon: "ن",
  },
  {
    name: "Imam Ibn Mājah", nameArabic: "الإمام ابن ماجه", died: "273 AH", born: "209 AH",
    known: "Sunan Ibn Mājah", bio: "Compiled a Sunan that fills gaps in the other five books. Though it contains some weak hadiths, it is invaluable for its unique narrations not found elsewhere.",
    collections: ["ibn-majah"], icon: "ه",
  },
  {
    name: "Imam Mālik", nameArabic: "الإمام مالك", died: "179 AH", born: "93 AH",
    known: "Muwaṭṭaʾ Imām Mālik", bio: "The earliest surviving hadith collection, compiled by the Imam of Madinah. Imam Shafi'i said: 'There is no book after the Quran more authentic than the Muwatta.'",
    collections: ["malik"], icon: "م",
  },
  {
    name: "Imam an-Nawawī", nameArabic: "الإمام النووي", died: "676 AH", born: "631 AH",
    known: "Forty Hadith, Riyāḍ aṣ-Ṣāliḥīn", bio: "The great scholar of the 7th century AH who selected 42 comprehensive hadiths that together encompass the fundamentals of the deen.",
    collections: ["nawawi-40"], icon: "ن",
  },
  {
    name: "Shaykh al-Albānī", nameArabic: "الشيخ الألباني", died: "1420 AH", born: "1333 AH",
    known: "Silsilah al-Ṣaḥīḥah & al-Ḍaʿīfah", bio: "The foremost hadith scholar of the 20th century, who re-graded thousands of hadiths and produced critical studies of weak and fabricated hadiths circulating among Muslims.",
    collections: [], icon: "ا",
  },
];

export default function TopicsPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<"topics" | "scholars" | "compare">("topics");
  const [compareA, setCompareA] = useState<typeof FEATURED_SCHOLARS[0] | null>(null);
  const [compareB, setCompareB] = useState<typeof FEATURED_SCHOLARS[0] | null>(null);

  const filtered = search
    ? TOPICS.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase()) ||
        t.nameArabic.includes(search) ||
        t.keywords.some((k) => k.includes(search.toLowerCase()))
      )
    : TOPICS;

  const topStudied = [...TOPICS].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Topics & Scholars</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Browse hadiths by topic or explore the great scholars of Islam</p>

        {/* Section tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {[
            { id: "topics", label: "Topics", icon: Tag },
            { id: "scholars", label: "Scholars", icon: Users },
            { id: "compare", label: "Compare Scholars", icon: GitCompare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as "topics" | "scholars" | "compare")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30 border border-border"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TOPICS ── */}
        {activeSection === "topics" && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics…"
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            {/* Most studied */}
            {!search && (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Most Studied</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {topStudied.map((t) => (
                    <button key={t.id} onClick={() => navigate(`/topics/${t.id}`)}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer transition-all hover:opacity-80 shrink-0", t.bg, t.color)}>
                      <span className="text-sm">{t.icon}</span>
                      <span className={cn("text-xs font-semibold", t.textColor)}>{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.count.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {search && (
              <p className="text-xs text-muted-foreground mb-3">
                {filtered.length} {filtered.length === 1 ? "topic" : "topics"} matching <span className="text-foreground font-medium">"{search}"</span>
              </p>
            )}

            {/* Topic grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((topic, i) => (
                <motion.div key={topic.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <button onClick={() => navigate(`/topics/${topic.id}`)} className="w-full text-left">
                    <div className={cn("group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm hover:scale-[1.01]", topic.bg, topic.color)}>
                      <div className="text-2xl shrink-0">{topic.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn("text-sm font-semibold", topic.textColor)}>{topic.name}</p>
                          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">{topic.nameArabic}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{topic.desc}</p>
                        <p className={cn("text-xs font-medium mt-1", topic.textColor)}>~{topic.count.toLocaleString()} hadiths</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0.5", topic.textColor)} />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No topics match your search.</p>
              </div>
            )}
          </>
        )}

        {/* ── COMPARE SCHOLARS ── */}
        {activeSection === "compare" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-xs text-muted-foreground max-w-xl">
              Select two hadith scholars to compare their methodology, era, collections, and approach to authentication.
            </p>

            {/* Picker row */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { slot: "A", selected: compareA, setSelected: setCompareA, other: compareB },
                { slot: "B", selected: compareB, setSelected: setCompareB, other: compareA },
              ].map(({ slot, selected, setSelected, other }) => (
                <div key={slot} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scholar {slot}</p>
                  {selected ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0" style={{ fontFamily: "'Amiri Quran', serif" }}>{selected.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{selected.name}</p>
                        <p className="text-xs text-muted-foreground">{selected.died}</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {FEATURED_SCHOLARS.filter((s) => s.name !== other?.name).map((s) => (
                        <button key={s.name} onClick={() => setSelected(s)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-accent/10 transition-all text-left">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0" style={{ fontFamily: "'Amiri Quran', serif" }}>{s.icon}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.born}–{s.died}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <AnimatePresence>
              {compareA && compareB && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                      <div className="p-3 bg-muted/20" />
                      {[compareA, compareB].map((s) => (
                        <div key={s.name} className="p-3 text-center">
                          <p className="text-xs font-bold text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif" }}>{s.nameArabic}</p>
                        </div>
                      ))}
                    </div>
                    {[
                      { label: "Era", valA: `${compareA.born}–${compareA.died}`, valB: `${compareB.born}–${compareB.died}` },
                      { label: "Known For", valA: compareA.known, valB: compareB.known },
                      { label: "Collections", valA: compareA.collections.join(", ") || "—", valB: compareB.collections.join(", ") || "—" },
                      { label: "Bio", valA: compareA.bio.slice(0, 100) + "…", valB: compareB.bio.slice(0, 100) + "…" },
                    ].map(({ label, valA, valB }) => (
                      <div key={label} className="grid grid-cols-3 divide-x divide-border border-b border-border last:border-b-0">
                        <div className="p-3 bg-muted/10">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                        </div>
                        <div className="p-3"><p className="text-xs text-muted-foreground leading-relaxed">{valA}</p></div>
                        <div className="p-3"><p className="text-xs text-muted-foreground leading-relaxed">{valB}</p></div>
                      </div>
                    ))}
                  </div>

                  {/* View collections */}
                  <div className="grid grid-cols-2 gap-3">
                    {[compareA, compareB].map((s) => (
                      s.collections.length > 0 && (
                        <Link key={s.name} href={`/hadith/${s.collections[0]}`}>
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
                            <p className="text-xs font-semibold text-primary">{s.name}</p>
                            <span className="text-xs text-primary flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> View
                            </span>
                          </div>
                        </Link>
                      )
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(!compareA || !compareB) && (
              <div className="text-center py-8 text-muted-foreground">
                <GitCompare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select two scholars above to see a side-by-side comparison</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── SCHOLARS ── */}
        {activeSection === "scholars" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4 max-w-xl">
              The great muhaddithun — scholars who preserved the Sunnah through rigorous chain-of-transmission methodology across fourteen centuries.
            </p>
            {FEATURED_SCHOLARS.map((scholar, i) => (
              <motion.div key={scholar.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/10 transition-all">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-lg"
                    style={{ fontFamily: "'Amiri Quran', serif" }}>
                    {scholar.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{scholar.name}</p>
                          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">{scholar.nameArabic}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{scholar.born}–{scholar.died} · Known for: <span className="text-foreground">{scholar.known}</span></p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{scholar.bio}</p>
                    {scholar.collections.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {scholar.collections.map((c) => (
                          <Link key={c} href={`/hadith/${c}`}>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-all">
                              <BookOpen className="w-2.5 h-2.5" />
                              View Collection
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
