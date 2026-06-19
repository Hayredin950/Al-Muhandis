import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Library, Play, Headphones, Video, Plus, ChevronRight, Clock, BookOpen,
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/collections/published`)
      .then((r) => r.json())
      .then((data) => {
        setCollections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load collections");
        setLoading(false);
      });
  }, []);

  const audioCollections = collections.filter((c) => c.type === "audio" || c.type === "mixed");
  const videoCollections = collections.filter((c) => c.type === "video");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading collections…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Collections</h1>
            <p className="text-sm text-muted-foreground">Curated Islamic audio & video content</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {collections.length === 0 && !loading && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Library className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-foreground font-medium">No collections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Collections of Islamic lectures, Quran recitations, and more will appear here.
            </p>
          </div>
          <Link href={`${BASE_URL}/admin/collections`}>
            <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
              <Plus className="w-4 h-4" />
              Add a Collection
            </button>
          </Link>
        </div>
      )}

      {audioCollections.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Audio Collections</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{audioCollections.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {audioCollections.map((c, i) => (
              <CollectionCard key={c.id} collection={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {videoCollections.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Video Collections</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{videoCollections.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videoCollections.map((c, i) => (
              <CollectionCard key={c.id} collection={c} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
  const typeIcon = collection.type === "video" ? Video : Headphones;
  const TypeIcon = typeIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`${BASE_URL}/collections/${collection.id}`}>
        <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer">
          {collection.thumbnailUrl ? (
            <div className="h-40 overflow-hidden">
              <img
                src={collection.thumbnailUrl}
                alt={collection.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-primary/40" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">{collection.title}</h3>
                {collection.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
                )}
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className={cn(
                "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                collection.type === "video"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-primary/10 text-primary"
              )}>
                <TypeIcon className="w-2.5 h-2.5" />
                {collection.type}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
