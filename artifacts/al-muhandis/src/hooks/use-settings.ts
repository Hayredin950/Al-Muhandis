import { useState, useCallback } from "react";

export interface AppSettings {
  arabicFontSize: number;
  translationFontSize: number;
  showTransliteration: boolean;
  showWordByWord: boolean;
  reciterId: string;
  playbackSpeed: number;
  translationId: string;
  autoAdvance: boolean;
  mushafFont: "amiri" | "scheherazade" | "noto-naskh";
  tajweedColoring: boolean;
  autoScroll: boolean;
  autoScrollSpeed: number;
  showMushafTranslation: boolean;
  showMushafTransliteration: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  arabicFontSize: 28,
  translationFontSize: 14,
  showTransliteration: true,
  showWordByWord: true,
  reciterId: "mishary-rashid",
  playbackSpeed: 1,
  translationId: "sahih-international",
  autoAdvance: true,
  mushafFont: "amiri",
  tajweedColoring: false,
  autoScroll: false,
  autoScrollSpeed: 2,
  showMushafTranslation: true,
  showMushafTransliteration: false,
};

const STORAGE_KEY = "al-muhandis-settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}

export const TRANSLATIONS = [
  { id: "sahih-international", name: "Sahih International", language: "English", author: "Saheeh International" },
  { id: "pickthall", name: "Pickthall", language: "English", author: "Mohammed Marmaduke Pickthall" },
  { id: "yusuf-ali", name: "Yusuf Ali", language: "English", author: "Abdullah Yusuf Ali" },
  { id: "dr-ghali", name: "Dr. Ghali", language: "English", author: "Dr. Mohammed Ghali" },
  { id: "hilali-khan", name: "Hilali & Khan", language: "English", author: "Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan" },
  { id: "maududi", name: "Maududi", language: "English", author: "Abul Ala Maududi" },
  { id: "urdu-jalandhry", name: "Jalandhry", language: "Urdu", author: "Fateh Muhammad Jalandhry" },
  { id: "urdu-junagarhi", name: "Junagarhi", language: "Urdu", author: "Muhammad Junagarhi" },
  { id: "french-hamidullah", name: "Hamidullah", language: "French", author: "Muhammad Hamidullah" },
  { id: "turkish-ates", name: "Ates", language: "Turkish", author: "Suleyman Ates" },
  { id: "amharic-sadiq", name: "Sadiq & Sani", language: "Amharic", author: "Muhammed Sadiq & Muhammed Sani" },
  { id: "indonesian-depag", name: "Kemenag", language: "Indonesian", author: "Indonesian Ministry of Religious Affairs" },
];
