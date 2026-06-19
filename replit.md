# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (Replit-managed, `@clerk/react` v6 + `@clerk/express`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed all core data (surahs, hadiths, tafseer)
- `pnpm --filter @workspace/scripts run seed-quran-api` — import all 6,236 ayahs from alquran.cloud

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Al-Muhandis — Islamic Intelligence Ecosystem

### Artifacts
- `artifacts/al-muhandis` — React + Vite frontend (port via `$PORT`, preview `/`)
- `artifacts/api-server` — Express 5 backend API (port via `$PORT`, path `/api`)

### Features Implemented

#### Authentication (Clerk)
- **Replit-managed Clerk** provisioned — separate dev/prod user stores
- Sign-in page (`/sign-in`) and sign-up page (`/sign-up`) with custom dark theme matching app
- `UserButton` in sidebar for signed-in users; "Sign In" link for guests
- ClerkProvider wraps the entire app in `App.tsx`
- Server wired with `clerkMiddleware` + `clerkProxyMiddleware` in `app.ts`
- `@clerk/react` v6 API: use `<Show when="signed-in">` / `<Show when="signed-out">` (NOT `SignedIn`/`SignedOut`)

#### Quran
- **Complete Quran Database**: All 114 surahs + 6,236 ayahs with full Arabic (Uthmani) + Sahih International translation (imported from alquran.cloud)
- **Quran Reader** (`/quran`, `/quran/:surahId`): Verse-by-verse with tafseer panel, word-by-word analysis, audio recitation
- **Mushaf Reader** (`/mushaf`): Production-ready Mushaf layout with collapsible surah index (all 114 surahs), continuous flowing Arabic text, Arabic verse markers (۝), Juz indicators, translation toggle, Listen button
- **Audio Player**: everyayah.com integration, 8 reciters, repeat/speed controls, persistent bottom bar
- **Word-by-Word Analysis**: Arabic morphology for Al-Fatihah and Al-Ikhlas
- **Tafseer**: DB entries + AI-generated fallback (cached to DB)

#### Hadith — **36,347 real hadiths across 9 proxy collections**

**Proxy Collections** (all served from Fawaz CDN: `eng-{edition}` + `ara-{edition}`):
- Sahih al-Bukhari: 7,563 (Sahih) — `eng-bukhari`
- Sahih Muslim: 7,470 (Sahih) — `eng-muslim`
- Sunan Abi Dawud: 5,274 (Mixed) — `eng-abudawud`
- Sunan an-Nasa'i: 5,758 (Mixed) — `eng-nasai`
- Sunan Ibn Majah: 4,341 (Mixed) — `eng-ibnmajah`
- Jami' at-Tirmidhi: 3,956 (Mixed) — `eng-tirmidhi`
- Muwatta Malik: 1,851 (Sahih) — `eng-malik`
- Nawawi-40: 42 (Sahih) — `eng-nawawi`
- Hadith Qudsi: 40 (Sahih) — `eng-qudsi`
- **Musnad Ahmad**: No Fawaz CDN edition exists — shows chapter navigation (by Companion)

**Grade Breakdown UI** — all 12 levels of ʿUlūm al-Ḥadīth always shown:
`Sahih | Hasan | Hasan Sahih | Da'if | Da'if Jiddan | Munkar | Matruk | Mawdu' | Mursal | Munqati' | Shadh | Unclassified`

- **Live Proxy Architecture**: `artifacts/api-server/src/services/hadith-proxy.ts`
- CDN: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}/{n}.min.json`
- In-memory cache per hadith, TTL 24 hours
- **Hadith Collection page** (`/hadith/:collectionId`): Chapter/book browser with Arabic names + All Hadiths view
- **Hadith Detail page** (`/hadith/:collectionId/:hadithId`): 4-tab interface — Hadith text, Isnad chain, Hadith Science, AI Scholar streaming
- **Narrator Database**: ~15 key narrators with Rijal al-Hadith data
- **Isnad Parser**: Parses Arabic hadith text, extracts narrator names, computes chain grade

#### AI Features (OpenAI via Replit Integration)
- **Ask Scholar** (`/ask-scholar`): Streaming SSE chat with conversation history
- **AI Tafseer** (`GET /api/ai/tafseer/:ayahId`): AI-generated tafseer cached to DB
- **AI Word Analysis** (`POST /api/ai/analyze-word`): Arabic root/grammar/morphology
- **AI Hadith Explanation**: Scholarly sharh streamed in real-time
- **Model**: `gpt-5-mini` (Replit AI Integration proxy)

#### Topics & Scholars
- **Topics page** (`/topics`): 18 real Islamic topics (Tawhid, Prayer, Fasting, etc.) with icons, colors, hadith counts, keyword chips; 9 detailed scholar bios; topic search; tab navigation
- **Topic Detail page** (`/topics/:topicId`): keyword filter pills, custom search, paginated hadith results from `/api/search`

#### Study Tools
- **Hadith Flash Cards** (`/hadith/flashcards`): Pick a collection (6 decks), 20 random cards, reveal Arabic→translation, mark Known/Review, session summary with score
- **Weak Hadiths encyclopedia** (`/hadith/weak`): 10 common weak/fabricated hadiths with scholar verdicts, explanations, authentic alternatives; filterable by verdict type
- **My Journal** (`/journal`): Personal notes on any Quran verse or hadith, stored in localStorage; edit/delete/filter/search; links back to original sources

#### Hadith Detail Enhancements
- **Fiqh Ruling Extractor**: AI-powered panel in the AI Scholar tab — streams fiqh rulings, madhab positions, practical applications
- **Narrator Bios** (NARRATOR_BIOS): 8 major companion bios displayed in the Isnad tab
- **Inline AI Sharh**: Trigger button in text tab for quick AI explanation
- **Restructured AI Tab**: Sparkles icon, loading skeleton, structured sections, fiqh panel, disclaimer

#### Other Features
- **Search** (`/search`): Full-text search across Quran + Hadith; popular topic suggestion chips; voice search; AI Scholar Insight panel
- **Bookmarks** (`/bookmarks`): Save ayahs and hadiths
- **Settings** (`/settings`): Font choice, font size, reciter selection
- **Analytics** (`/analytics`): Reading progress dashboard
- **Khatmah** (`/khatmah`): Quran completion plans
- **Hifz** (`/hifz`): Memorization mode
- **Daily Ayah + Daily Hadith**: Random content on homepage

#### Home Page Quick Links
- Flash Cards, Weak Hadiths, My Journal added to feature grid

### OpenAI Integration
- Uses Replit AI Integration (no user API key needed)
- Client: `import { openai } from "@workspace/integrations-openai-ai-server"`
- **Model name**: `gpt-5-mini` (Replit integration alias — use this, NOT `gpt-4o-mini`)
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

### Database Schema
- `surahs` — 114 surahs
- `ayahs` — 6,236 ayahs (Uthmani Arabic + Sahih International)
- `ayah_words` — word-by-word analysis (partial)
- `tafseer` — AI-generated tafseer (cached)
- `hadith_collections` — 9 collection metadata records
- `hadiths` — DB hadiths (seed data); bulk via live CDN proxy
- `narrators`, `hadith_isnad` — narrator chain data
- `ayah_hadith_links` — cross-references
- `bookmarks` — user bookmarks (tied to Clerk userId)
- `conversations`, `messages` — AI chat history

### Clerk Notes
- Status: Replit-managed (`not_configured` → provisioned)
- Env vars set: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- `@clerk/react` v6: exports `Show`, `UserButton`, `ClerkProvider`, `SignIn`, `SignUp` — does NOT export `SignedIn`/`SignedOut`
- CSS: `@layer theme, base, clerk, components, utilities;` before `@import "tailwindcss"`
- Vite: `tailwindcss({ optimize: false })` to prevent prod broken styles
- Clerk proxy middleware runs server-side for production; dev connects directly to Clerk cloud
