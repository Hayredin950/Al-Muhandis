import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Loader2, BookOpen, Tag, Sparkles, MessageCircle } from "lucide-react";
import { TOPICS, type TopicDef } from "./topics";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface TopicHadith {
  id?: number | string;
  hadithNumber: string;
  arabicText?: string;
  translation: string;
  narrator?: string;
  grade: string;
  collectionId: string;
  collectionName?: string;
  collectionname?: string;
}

interface SearchResult {
  hadiths?: TopicHadith[];
  quranResults?: unknown[];
  total?: number;
}

const GRADE_STYLES: Record<string, string> = {
  "Sahih":      "text-emerald-400 bg-emerald-500/10",
  "Hasan Sahih":"text-teal-400 bg-teal-500/10",
  "Hasan":      "text-blue-400 bg-blue-500/10",
  "Da'if":      "text-amber-400 bg-amber-500/10",
  "Da'if Jiddan":"text-orange-400 bg-orange-500/10",
  "Munkar":     "text-red-400 bg-red-500/10",
  "Mawdu'":     "text-rose-500 bg-rose-600/10",
  "Unknown":    "text-muted-foreground bg-muted",
};

function TopicAiIntroButton({ topic }: { topic: TopicDef }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const load = async () => {
    if (text) { setOpen((v) => !v); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a concise scholarly introduction (3-4 short paragraphs) to the Islamic topic of "${topic.name}" (${topic.nameArabic}).\n\nInclude:\n1. Definition and importance in Islam\n2. Key Quranic and hadith evidence\n3. How classical scholars approached this topic\n4. Practical relevance for Muslims today\n\nBe academic yet readable. Do not use headers — just flowing paragraphs.`,
          history: [],
        }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string };
            if (data.content) { result += data.content; setText(result); }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setText("Unable to generate introduction at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {!open ? (
        <button onClick={() => void load()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-background/30 text-muted-foreground hover:text-foreground border border-white/10 transition-all">
          <Sparkles className="w-3 h-3" />
          AI Scholarly Introduction
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-xl bg-background/30 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wide">AI Scholarly Introduction</p>
            {loading && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
            <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>
          {loading && !text ? (
            <div className="space-y-1.5">
              {[90, 70, 85, 55, 80].map((w, i) => (
                <div key={i} className="h-2.5 rounded-full bg-white/10 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <MarkdownRenderer content={text} size="sm" />
          )}
        </div>
      )}
    </div>
  );
}

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [, navigate] = useLocation();
  const topic = TOPICS.find((t) => t.id === topicId);

  const [hadiths, setHadiths] = useState<TopicHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [keywordIdx, setKeywordIdx] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [customSearch, setCustomSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const limit = 15;

  const keywords = topic?.keywords ?? [];
  const currentKeyword = activeSearch || keywords[keywordIdx] || topic?.name || "";

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    setHadiths([]);
    const kw = activeSearch || keywords[keywordIdx] || topic.name;
    const url = `${BASE_URL}/api/search?q=${encodeURIComponent(kw)}&type=hadith&page=${page}&limit=${limit}`;
    fetch(url)
      .then((r) => r.ok ? r.json() as Promise<SearchResult> : Promise.reject())
      .then((data) => {
        setHadiths(data.hadiths ?? []);
        setTotal(data.total ?? data.hadiths?.length ?? 0);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [topic, keywordIdx, activeSearch, page]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearch.trim()) {
      setActiveSearch(customSearch.trim());
      setPage(1);
    }
  };

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Topic not found.</p>
        <Link href="/topics"><button className="mt-4 text-xs text-primary hover:underline">← Topics</button></Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href="/topics">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Topics & Scholars
        </button>
      </Link>

      {/* Topic header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className={cn("rounded-2xl border p-6", topic.bg, topic.color)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <h1 className={cn("text-xl font-bold", topic.textColor)}>{topic.name}</h1>
                  <p className="text-xs text-muted-foreground">{topic.desc}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{topic.longDesc}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <TopicAiIntroButton topic={topic} />
                <Link href={`/ask-scholar?q=${encodeURIComponent(`Give a scholarly introduction to the Islamic concept of ${topic.name} (${topic.nameArabic}): ${topic.longDesc}`)}`}>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-background/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all mt-2">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Ask Scholar
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {topic.collections.map((c) => (
                  <Link key={c} href={`/hadith/${c}`}>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background/30 text-muted-foreground hover:text-foreground transition-all cursor-pointer capitalize">
                      {c.replace("-", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-3xl", topic.textColor)} style={{ fontFamily: "'Amiri Quran', serif" }} dir="rtl">
                {topic.nameArabic}
              </p>
              <p className={cn("text-xs mt-1", topic.textColor)}>~{topic.count.toLocaleString()} hadiths</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyword filter pills */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Browse by keyword</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <button
              key={kw}
              onClick={() => { setKeywordIdx(i); setActiveSearch(""); setPage(1); }}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-all",
                (activeSearch ? false : keywordIdx === i)
                  ? cn("border-opacity-100 font-semibold", topic.bg, topic.color, topic.textColor)
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Custom search */}
      <form onSubmit={handleCustomSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <input
            type="text" value={customSearch} onChange={(e) => setCustomSearch(e.target.value)}
            placeholder={`Search within ${topic.name}…`}
            className="w-full px-4 py-2 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
          Search
        </button>
        {activeSearch && (
          <button type="button" onClick={() => { setActiveSearch(""); setCustomSearch(""); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
            ✕
          </button>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : hadiths.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hadiths found for "{currentKeyword}".</p>
          <p className="text-xs mt-1">Try a different keyword above.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              Showing results for <span className={cn("font-semibold", topic.textColor)}>"{currentKeyword}"</span>
              {total > 0 && <span className="ml-1">· {total.toLocaleString()} found</span>}
            </p>
          </div>
          <div className="space-y-3">
            {hadiths.map((hadith, i) => {
              const colId = hadith.collectionId;
              const hadithNum = hadith.hadithNumber;
              const href = `/hadith/${colId}/${hadithNum}`;
              const colName = hadith.collectionName ?? hadith.collectionname ?? colId;
              return (
                <motion.div key={`${colId}-${hadithNum}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={href}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/10 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                            {colName} #{hadithNum}
                          </span>
                          {hadith.grade && hadith.grade !== "Unknown" && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", GRADE_STYLES[hadith.grade] ?? "text-muted-foreground bg-muted")}>
                              {hadith.grade}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      {hadith.arabicText && (
                        <p className="text-right text-muted-foreground mb-2 text-sm leading-loose line-clamp-1" dir="rtl"
                          style={{ fontFamily: "'Amiri Quran', serif" }}>
                          {hadith.arabicText.slice(0, 100)}{hadith.arabicText.length > 100 ? "..." : ""}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{hadith.translation}</p>
                      {hadith.narrator && (
                        <p className="text-xs text-muted-foreground mt-1.5">Narrated by {hadith.narrator}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-sm text-muted-foreground px-2">
                Page <span className="font-semibold text-foreground">{page}</span> of {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/30 disabled:opacity-40 transition-all">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Related Topics */}
      {(() => {
        const related = TOPICS.filter((t) => t.id !== topic.id).slice(0, 6);
        if (related.length === 0) return null;
        return (
          <div className="mt-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Explore Related Topics</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {related.map((t) => (
                <button key={t.id} onClick={() => navigate(`/topics/${t.id}`)}
                  className={cn("flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm text-left", t.bg, t.color)}>
                  <span className="text-lg shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold truncate", t.textColor)}>{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">~{t.count.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
