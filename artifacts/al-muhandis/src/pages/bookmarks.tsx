import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Bookmark, BookOpen, ScrollText, Trash2, ExternalLink, Search } from "lucide-react";
import { useListBookmarks, useDeleteBookmark, getListBookmarksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type AyahMeta = { _meta: true; surahId: number; ayahNumber: number; surahName: string; translationSnippet?: string };
type HadithMeta = { _meta: true; collectionId: string; hadithNumber: string | number; collectionName?: string; translationSnippet?: string };

function parseAyahMeta(note: string | null | undefined): AyahMeta | null {
  if (!note) return null;
  try { const p = JSON.parse(note); return p._meta && p.surahId ? p as AyahMeta : null; } catch { return null; }
}
function parseHadithMeta(note: string | null | undefined): HadithMeta | null {
  if (!note) return null;
  try { const p = JSON.parse(note); return p._meta && p.collectionId ? p as HadithMeta : null; } catch { return null; }
}

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useListBookmarks();
  const { mutate: deleteBookmark } = useDeleteBookmark();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "ayah" | "hadith">("all");
  const [search, setSearch] = useState("");

  const allBookmarks = bookmarks ?? [];
  const ayahBookmarks = allBookmarks.filter((b) => b.type === "ayah");
  const hadithBookmarks = allBookmarks.filter((b) => b.type === "hadith");
  const byFilter = filter === "all" ? allBookmarks : filter === "ayah" ? ayahBookmarks : hadithBookmarks;
  const filteredBookmarks = search
    ? byFilter.filter((b) => b.title?.toLowerCase().includes(search.toLowerCase()) || b.note?.toLowerCase().includes(search.toLowerCase()))
    : byFilter;

  const handleDelete = (id: number) => {
    deleteBookmark({ bookmarkId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const isEmpty = !bookmarks || bookmarks.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{bookmarks?.length ?? 0} saved items</p>
        {!isEmpty && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
              <p className="text-xl font-bold text-foreground">{allBookmarks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{ayahBookmarks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quran</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
              <p className="text-xl font-bold text-amber-400">{hadithBookmarks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hadith</p>
            </div>
          </div>
        )}

        {/* Search bar */}
        {!isEmpty && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Filter tabs */}
        {!isEmpty && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {[
              { id: "all", label: "All", count: allBookmarks.length },
              { id: "ayah", label: "Quran", count: ayahBookmarks.length },
              { id: "hadith", label: "Hadith", count: hadithBookmarks.length },
            ].map(({ id, label, count }) => (
              <button key={id} onClick={() => setFilter(id as "all" | "ayah" | "hadith")}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                  filter === id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}>
                {label}
                <span className={cn("text-[10px] px-1 rounded-full", filter === id ? "bg-primary-foreground/20" : "bg-muted")}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {isEmpty ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
            <p className="text-xs text-muted-foreground mt-2">Bookmark ayahs and hadiths while reading to save them here</p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link href="/quran">
                <span className="text-xs text-primary hover:underline cursor-pointer">Browse Quran</span>
              </Link>
              <span className="text-muted-foreground text-xs">·</span>
              <Link href="/hadith">
                <span className="text-xs text-primary hover:underline cursor-pointer">Browse Hadith</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBookmarks.map((b, i) => {
              const isAyah = b.type === "ayah";
              const ayahMeta = isAyah ? parseAyahMeta(b.note) : null;
              const hadithMeta = !isAyah ? parseHadithMeta(b.note) : null;
              const href = isAyah
                ? ayahMeta ? `/quran/${ayahMeta.surahId}?ayah=${ayahMeta.ayahNumber}` : "/quran"
                : hadithMeta ? `/hadith/${hadithMeta.collectionId}/${hadithMeta.hadithNumber}` : "/hadith";
              const preview = isAyah ? ayahMeta?.translationSnippet : hadithMeta?.translationSnippet;
              const userNote = (isAyah && !ayahMeta) ? b.note : (!isAyah && !hadithMeta) ? b.note : null;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card group hover:border-primary/30 transition-all">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isAyah ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                      {isAyah ? <BookOpen className="w-4 h-4 text-emerald-500" /> : <ScrollText className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold", isAyah ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                          {isAyah ? "Quran" : "Hadith"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{b.title}</p>
                      {preview && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{preview}{preview.length >= 160 ? "…" : ""}</p>}
                      {userNote && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">{userNote}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={href}>
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100" title="Open">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
