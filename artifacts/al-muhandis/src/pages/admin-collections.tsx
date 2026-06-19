import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Trash2, Edit3, Eye, EyeOff, Save, X, ChevronRight,
  Headphones, Video, GripVertical, Check, Loader2, AlertTriangle,
  Library, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface CollectionItem {
  id: number;
  collectionId: number;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  position: number;
  type: string;
}

interface Collection {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  items?: CollectionItem[];
}

interface CollectionForm {
  title: string;
  description: string;
  thumbnailUrl: string;
  type: "audio" | "video" | "mixed";
  isPublished: boolean;
}

interface ItemForm {
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  duration: string;
  type: "audio" | "video";
  position: number;
}

const emptyCollectionForm = (): CollectionForm => ({
  title: "", description: "", thumbnailUrl: "", type: "audio", isPublished: false,
});

const emptyItemForm = (position: number = 0): ItemForm => ({
  title: "", description: "", mediaUrl: "", thumbnailUrl: "", duration: "", type: "audio", position,
});

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionForm>(emptyCollectionForm());

  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedCollectionItems, setSelectedCollectionItems] = useState<CollectionItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm());
  const [itemsLoading, setItemsLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchCollections() {
    setLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/api/collections`);
      const data = await r.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }

  async function fetchItems(collectionId: number) {
    setItemsLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/api/collections/${collectionId}`);
      const data = await r.json();
      setSelectedCollectionItems(data.items ?? []);
    } catch {
      showToast("Failed to load items", "error");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => { fetchCollections(); }, []);

  useEffect(() => {
    if (selectedCollectionId) fetchItems(selectedCollectionId);
    else setSelectedCollectionItems([]);
  }, [selectedCollectionId]);

  async function handleSaveCollection() {
    if (!collectionForm.title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const body = {
        title: collectionForm.title.trim(),
        description: collectionForm.description.trim() || undefined,
        thumbnailUrl: collectionForm.thumbnailUrl.trim() || undefined,
        type: collectionForm.type,
        isPublished: collectionForm.isPublished,
      };
      if (editingCollection) {
        await fetch(`${BASE_URL}/api/collections/${editingCollection.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        showToast("Collection updated");
      } else {
        await fetch(`${BASE_URL}/api/collections`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        showToast("Collection created");
      }
      setShowCreateCollection(false);
      setEditingCollection(null);
      setCollectionForm(emptyCollectionForm());
      await fetchCollections();
    } catch {
      showToast("Failed to save collection", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCollection(id: number) {
    if (!confirm("Delete this collection and all its items?")) return;
    try {
      await fetch(`${BASE_URL}/api/collections/${id}`, { method: "DELETE" });
      showToast("Collection deleted");
      if (selectedCollectionId === id) setSelectedCollectionId(null);
      await fetchCollections();
    } catch {
      showToast("Failed to delete collection", "error");
    }
  }

  async function handleTogglePublish(collection: Collection) {
    try {
      await fetch(`${BASE_URL}/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !collection.isPublished }),
      });
      showToast(collection.isPublished ? "Unpublished" : "Published");
      await fetchCollections();
    } catch {
      showToast("Failed to update", "error");
    }
  }

  async function handleSaveItem() {
    if (!selectedCollectionId) return;
    if (!itemForm.title.trim()) { showToast("Title is required", "error"); return; }
    if (!itemForm.mediaUrl.trim()) { showToast("Media URL is required", "error"); return; }
    setSaving(true);
    try {
      const body = {
        title: itemForm.title.trim(),
        description: itemForm.description.trim() || undefined,
        mediaUrl: itemForm.mediaUrl.trim(),
        thumbnailUrl: itemForm.thumbnailUrl.trim() || undefined,
        duration: itemForm.duration ? parseInt(itemForm.duration) : undefined,
        type: itemForm.type,
        position: itemForm.position,
      };
      if (editingItem) {
        await fetch(`${BASE_URL}/api/collections/${selectedCollectionId}/items/${editingItem.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        showToast("Item updated");
      } else {
        await fetch(`${BASE_URL}/api/collections/${selectedCollectionId}/items`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        showToast("Item added");
      }
      setShowAddItem(false);
      setEditingItem(null);
      setItemForm(emptyItemForm());
      await fetchItems(selectedCollectionId);
    } catch {
      showToast("Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(itemId: number) {
    if (!selectedCollectionId) return;
    if (!confirm("Remove this item from the collection?")) return;
    try {
      await fetch(`${BASE_URL}/api/collections/${selectedCollectionId}/items/${itemId}`, { method: "DELETE" });
      showToast("Item removed");
      await fetchItems(selectedCollectionId);
    } catch {
      showToast("Failed to delete item", "error");
    }
  }

  function startEditCollection(c: Collection) {
    setEditingCollection(c);
    setCollectionForm({
      title: c.title, description: c.description ?? "", thumbnailUrl: c.thumbnailUrl ?? "",
      type: c.type as "audio" | "video" | "mixed", isPublished: c.isPublished,
    });
    setShowCreateCollection(true);
  }

  function startEditItem(item: CollectionItem) {
    setEditingItem(item);
    setItemForm({
      title: item.title, description: item.description ?? "", mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl ?? "", duration: item.duration?.toString() ?? "",
      type: item.type as "audio" | "video", position: item.position,
    });
    setShowAddItem(true);
  }

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-4 right-4 z-[100] px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2",
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-destructive text-white"
            )}
          >
            {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin — Collections</h1>
            <p className="text-xs text-muted-foreground">Manage Islamic audio & video collections</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingCollection(null); setCollectionForm(emptyCollectionForm()); setShowCreateCollection(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collections list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Collections ({collections.length})
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && collections.length === 0 && (
            <div className="text-center py-8 border border-dashed border-border rounded-2xl">
              <Library className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No collections yet. Create one above.</p>
            </div>
          )}

          {collections.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCollectionId(c.id === selectedCollectionId ? null : c.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                selectedCollectionId === c.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/10"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                c.type === "video" ? "bg-blue-500/10" : "bg-primary/10"
              )}>
                {c.type === "video" ? <Video className="w-4 h-4 text-blue-500" /> : <Headphones className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full", c.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
                    {c.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleTogglePublish(c); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                  title={c.isPublished ? "Unpublish" : "Publish"}
                >
                  {c.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); startEditCollection(c); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", selectedCollectionId === c.id ? "rotate-90" : "")} />
              </div>
            </div>
          ))}
        </div>

        {/* Items panel */}
        <div className="space-y-3">
          {selectedCollection ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Items in "{selectedCollection.title}"
                </h2>
                <div className="flex items-center gap-2">
                  <Link href={`${BASE_URL}/collections/${selectedCollection.id}`} target="_blank">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all" title="Preview">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => { setEditingItem(null); setItemForm(emptyItemForm(selectedCollectionItems.length)); setShowAddItem(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>
              </div>

              {itemsLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!itemsLoading && selectedCollectionItems.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl">
                  <p className="text-sm text-muted-foreground">No items yet. Add audio or video links above.</p>
                </div>
              )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedCollectionItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.mediaUrl}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEditItem(item)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-all">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">Select a collection to manage its items</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Collection Modal */}
      <AnimatePresence>
        {showCreateCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowCreateCollection(false); setEditingCollection(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{editingCollection ? "Edit Collection" : "New Collection"}</h3>
                <button onClick={() => { setShowCreateCollection(false); setEditingCollection(null); }} className="p-1 rounded text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                  <input
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                    placeholder="e.g. Tafseer Lectures by Sheikh X"
                    value={collectionForm.title}
                    onChange={(e) => setCollectionForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all resize-none"
                    rows={2}
                    placeholder="Brief description of the collection"
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Thumbnail URL</label>
                  <input
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                    placeholder="https://example.com/image.jpg"
                    value={collectionForm.thumbnailUrl}
                    onChange={(e) => setCollectionForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <div className="flex gap-2">
                    {(["audio", "video", "mixed"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setCollectionForm((f) => ({ ...f, type: t }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize",
                          collectionForm.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setCollectionForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                    className={cn(
                      "w-9 h-5 rounded-full border-2 relative transition-all",
                      collectionForm.isPublished ? "bg-emerald-500 border-emerald-500" : "bg-muted border-border"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform",
                      collectionForm.isPublished ? "translate-x-3.5" : "translate-x-0.5"
                    )} />
                  </div>
                  <span className="text-sm text-foreground">Publish (visible to users)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowCreateCollection(false); setEditingCollection(null); }}
                  className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCollection}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingCollection ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAddItem(false); setEditingItem(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{editingItem ? "Edit Item" : "Add Item"}</h3>
                <button onClick={() => { setShowAddItem(false); setEditingItem(null); }} className="p-1 rounded text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                  <input
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                    placeholder="e.g. Episode 1 — Introduction to Tafseer"
                    value={itemForm.title}
                    onChange={(e) => setItemForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Media URL * (audio/video file or stream)</label>
                  <input
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all font-mono"
                    placeholder="https://example.com/lecture.mp3"
                    value={itemForm.mediaUrl}
                    onChange={(e) => setItemForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <input
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                    placeholder="Brief description of this episode"
                    value={itemForm.description}
                    onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration (seconds)</label>
                    <input
                      type="number"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                      placeholder="3600"
                      value={itemForm.duration}
                      onChange={(e) => setItemForm((f) => ({ ...f, duration: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Position</label>
                    <input
                      type="number"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                      value={itemForm.position}
                      onChange={(e) => setItemForm((f) => ({ ...f, position: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Media Type</label>
                  <div className="flex gap-2">
                    {(["audio", "video"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setItemForm((f) => ({ ...f, type: t }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize",
                          itemForm.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowAddItem(false); setEditingItem(null); }}
                  className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
