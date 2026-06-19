---
name: Prayer Times Widget
description: How prayer times are fetched and cached in Al-Muhandis
---

Component: `artifacts/al-muhandis/src/components/prayer-times-widget.tsx`

## Approach
- Uses `navigator.geolocation.getCurrentPosition` to get lat/lng
- Calls Aladhan free API: `https://api.aladhan.com/v1/timings/{timestamp}?latitude={lat}&longitude={lng}&method=2`
- Method 2 = ISNA (Islamic Society of North America)
- Caches result in `sessionStorage` key `prayer-times-cache` with the date string to avoid repeat calls
- Timezone city extracted from `data.meta.timezone` (e.g. "America/New_York" → "New York")
- Highlights next prayer with countdown using 30-second interval refresh

**Why:** Free API, no auth required. Session cache prevents repeated geolocation requests on page refresh.
