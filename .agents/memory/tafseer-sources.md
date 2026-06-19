---
name: Tafseer Source IDs
description: Valid tafseer source IDs in surah.tsx — use these, not stale ones
---

Valid IDs (from TAFSEER_SOURCES as const in surah.tsx):
- `ai-generated` — Al-Muhandis AI (default)
- `ar.jalalayn` — Jalalayn (Arabic)
- `ar.muyassar` — Tafsir Muyassar (Arabic)
- `ar.qurtubi` — Al-Qurtubi (Arabic)
- `ar.miqbas` — Ibn Abbas (Arabic)
- `en.ibn-kathir` — Ibn Kathir in English
- `am.sadiq` — Amharic translation

**Why:** Code previously used `am.ibn-kathir` which caused TS errors. The correct ID is `en.ibn-kathir`.
