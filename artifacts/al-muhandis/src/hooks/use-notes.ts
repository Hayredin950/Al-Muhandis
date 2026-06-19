import { useState, useCallback, useEffect } from "react";

interface Note {
  text: string;
  updatedAt: string;
}

function getNoteKey(type: "ayah" | "hadith", referenceId: number): string {
  return `al-muhandis-note:${type}:${referenceId}`;
}

export function useNote(type: "ayah" | "hadith", referenceId: number) {
  const key = getNoteKey(type, referenceId);

  const [note, setNote] = useState<Note | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setNote(raw ? JSON.parse(raw) : null);
    } catch {
      setNote(null);
    }
  }, [key]);

  const saveNote = useCallback((text: string) => {
    if (!text.trim()) {
      localStorage.removeItem(key);
      setNote(null);
      return;
    }
    const n: Note = { text: text.trim(), updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(n));
    setNote(n);
  }, [key]);

  const deleteNote = useCallback(() => {
    localStorage.removeItem(key);
    setNote(null);
  }, [key]);

  return { note, saveNote, deleteNote };
}

export function getAllNotes(): { type: string; referenceId: number; note: Note }[] {
  const results: { type: string; referenceId: number; note: Note }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("al-muhandis-note:")) continue;
    try {
      const parts = key.split(":");
      const type = parts[1];
      const referenceId = parseInt(parts[2], 10);
      const raw = localStorage.getItem(key);
      if (raw && type && !isNaN(referenceId)) {
        results.push({ type, referenceId, note: JSON.parse(raw) });
      }
    } catch {}
  }
  return results.sort((a, b) => new Date(b.note.updatedAt).getTime() - new Date(a.note.updatedAt).getTime());
}
