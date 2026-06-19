import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, Pencil, Trash2, ScrollText, Search, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEntry {
  type: "hadith" | "ayah";
  referenceId: number;
  text: string;
  savedAt: number;
}

interface EntryMeta {
  surahId?: number;
  ayahNumber?: number;
  surahName?: string;
  collectionId?: string;
  hadithNumber?: string | number;
  collectionName?: string;
}

function loadJournal(): JournalEntry[] {
  try {
    const entries: JournalEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("al-muhandis-note:")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { text: string; updatedAt?: string; savedAt?: number };
        const parts = key.replace("al-muhandis-note:", "").split(":");
        const type = parts[0] as "hadith" | "ayah";
        const refId = parseInt(parts[1] ?? "0", 10);
        if (!["hadith", "ayah"].includes(type) || isNaN(refId)) continue;
        const savedAt = parsed.updatedAt
          ? new Date(parsed.updatedAt).getTime()
          : (parsed.savedAt ?? Date.now());
        entries.push({ type, referenceId: refId, text: parsed.text, savedAt });
      } catch { }
    }
    return entries.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

function readMeta(type: "hadith" | "ayah", referenceId: number): EntryMeta | null {
  try {
    const raw = localStorage.getItem(`al-muhandis-meta:${type}:${referenceId}`);
    return raw ? JSON.parse(raw) as EntryMeta : null;
  } catch {
    return null;
  }
}

function getHref(entry: JournalEntry): string {
  const meta = readMeta(entry.type, entry.referenceId);
  if (entry.type === "ayah" && meta?.surahId) {
    return `/quran/${meta.surahId}?ayah=${meta.ayahNumber ?? ""}`;
  }
  if (entry.type === "hadith" && meta?.collectionId && meta?.hadithNumber) {
    return `/hadith/${meta.collectionId}/${meta.hadithNumber}`;
  }
  return entry.type === "ayah" ? "/quran" : "/hadith";
}

function getEntryLabel(entry: JournalEntry): string {
  const meta = readMeta(entry.type, entry.referenceId);
  if (entry.type === "ayah" && meta?.surahName) {
    return `${meta.surahName} ${meta.ayahNumber ?? ""}`.trim();
  }
  if (entry.type === "hadith" && meta?.collectionName) {
    return `${meta.collectionName} #${meta.hadithNumber ?? ""}`.trim();
  }
  return `#${entry.referenceId}`;
}

function deleteNoteFromStorage(type: "hadith" | "ayah", referenceId: number) {
  localStorage.removeItem(`al-muhandis-note:${type}:${referenceId}`);
}

export default function HadithJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "hadith" | "ayah">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    setEntries(loadJournal());
  }, []);

  const refresh = () => setEntries(loadJournal());

  const handleExport = () => {
    const text = entries.map((e) => {
      const d = new Date(e.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const label = getEntryLabel(e);
      return `[${e.type === "hadith" ? "Hadith" : "Quran"} — ${label}] — ${d}\n${e.text}\n`;
    }).join("\n---\n\n");
    const blob = new Blob([`AL-MUHANDIS JOURNAL EXPORT\nExported: ${new Date().toLocaleDateString()}\n${"=".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "al-muhandis-journal.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (entry: JournalEntry) => {
    deleteNoteFromStorage(entry.type, entry.referenceId);
    refresh();
  };

  const handleSaveEdit = (entry: JournalEntry) => {
    const key = `al-muhandis-note:${entry.type}:${entry.referenceId}`;
    const existing = localStorage.getItem(key);
    let parsed: { text: string; updatedAt?: string } | null = null;
    try { parsed = existing ? JSON.parse(existing) : null; } catch { }
    localStorage.setItem(key, JSON.stringify({ ...(parsed ?? {}), text: editDraft, updatedAt: new Date().toISOString() }));
    setEditingId(null);
    setEditDraft("");
    refresh();
  };

  const filtered = entries
    .filter((e) => {
      const matchesFilter = filter === "all" || e.type === filter;
      const matchesSearch = !search || e.text.toLowerCase().includes(search.toLowerCase()) || getEntryLabel(e).toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => sortOrder === "newest" ? b.savedAt - a.savedAt : a.savedAt - b.savedAt);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const hadithCount = entries.filter((e) => e.type === "hadith").length;
  const ayahCount = entries.filter((e) => e.type === "ayah").length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Home
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Islamic Journal</h1>
              <p className="text-xs text-muted-foreground">Your personal notes on Quran verses and Hadiths</p>
            </div>
          </div>
          {entries.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shrink-0">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-lg">
          Notes are stored locally on your device. Add them by opening any hadith or verse and clicking the pencil icon.
        </p>
      </motion.div>

      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground">{entries.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Notes</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
            <p className="text-xl font-bold text-amber-400">{hadithCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hadith Notes</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center">
            <p className="text-xl font-bold text-emerald-400">{ayahCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quran Notes</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "all", label: "All Notes", count: entries.length },
            { id: "hadith", label: "Hadiths", count: hadithCount },
            { id: "ayah", label: "Quran", count: ayahCount },
          ].map(({ id, label, count }) => (
            <button key={id} onClick={() => setFilter(id as "all" | "hadith" | "ayah")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                filter === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}>
              {label}
              {count > 0 && (
                <span className={cn("text-[10px] px-1 rounded-full", filter === id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
        {entries.length > 1 && (
          <button
            onClick={() => setSortOrder((o) => o === "newest" ? "oldest" : "newest")}
            className="text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-all"
          >
            {sortOrder === "newest" ? "↓ Newest" : "↑ Oldest"}
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your notes…"
          className="w-full px-4 py-2.5 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Pencil className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm">
            {entries.length === 0
              ? "No notes yet. Open any hadith or verse to add a personal note."
              : "No notes match your search."}
          </p>
          {entries.length === 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link href="/hadith">
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <ScrollText className="w-3 h-3" /> Browse Hadiths
                </span>
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/quran">
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Read Quran
                </span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const id = `${entry.type}-${entry.referenceId}`;
            const isEditing = editingId === id;
            const label = getEntryLabel(entry);
            const href = getHref(entry);
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1",
                        entry.type === "hadith" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {entry.type === "hadith" ? <ScrollText className="w-2.5 h-2.5" /> : <BookOpen className="w-2.5 h-2.5" />}
                        {entry.type === "hadith" ? "Hadith" : "Quran"}
                      </div>
                      <span className="text-xs font-medium text-foreground">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(entry.savedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={href}>
                        <button title="View original" className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button onClick={() => { setEditingId(id); setEditDraft(entry.text); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(entry)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="w-full text-sm text-foreground bg-muted/20 rounded-lg border border-border p-3 resize-none outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] leading-relaxed"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg">Cancel</button>
                          <button onClick={() => handleSaveEdit(entry)}
                            className="text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:opacity-90">
                            Save
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {entry.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
