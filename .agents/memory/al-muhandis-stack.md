---
name: Al-Muhandis Stack
description: Core stack, file layout, and non-obvious conventions for the Al-Muhandis Islamic app
---

## Stack
- Frontend: React + Vite + Tailwind v4 at `artifacts/al-muhandis/`
- API: Express + TypeScript at `artifacts/api-server/`
- DB: PostgreSQL + Drizzle ORM at `lib/db/` — push schema with `cd lib/db && pnpm run push`
- Auth: Clerk dev keys (401s are non-blocking in dev)
- AI: OpenAI via Replit integration proxy

## Key conventions
- Arabic audio: everyayah.com CDN
- Audio context: `artifacts/al-muhandis/src/contexts/audio-player.tsx`
- Reading tracker: `artifacts/al-muhandis/src/lib/reading-tracker.ts` — `getReadingHeatmap(days)` loads its own tracker internally, no arg needed
- Tafseer source preference persisted to `localStorage` key `al-muhandis-tafseer-source`
- Theme persisted to `localStorage` key `al-muhandis-theme` via ThemeProvider

## Routes added (beyond scaffold)
- /collections — admin collections page
- /collections/:id — collection detail player
- /admin/collections — admin collections management
- /profile — profile page with stats, heatmap, achievements

**Why:** Needed to track these for consistent routing and avoid duplicate routes.
