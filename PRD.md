# PRD — Couple Dashboard ("Futari")

## Vision

The best dashboard for international long-distance couples. Two people,
opposite time zones, different languages, different countries — the app makes
them feel like they live one shared day. Warm, emotional, simple.

## Users

- Primary: couples split across distant time zones (reference pair: Tokyo
  JST ⇄ Santiago CLT/CLST, ~12–13 h apart, Japanese/Spanish speakers with
  English as a bridge).
- Both partners use phones as the primary device (iPhone and Android/Xiaomi).
  Mobile-first is mandatory; desktop is secondary.

## Design principles

1. **Warm over clever.** Photos of the couple are the visual foundation.
2. **Zero-friction.** No logins until a feature truly requires one.
3. **Each partner keeps their own language.** i18n is per-device.
4. **Time-zone math must always be right**, including DST (Chile shifts,
   Japan doesn't). All tz logic is centralized and tested.
5. **Offline-tolerant.** The app is a PWA; cached shell + last data work
   without a network.

## Current version (v0) — shipped

- Couple profile basics (cities, wake/sleep schedules)
- Dual local clocks with day/night sky
- Talk-window overlap timeline ("can we talk now?")
- Anniversaries + "together for N days" + reunion countdown
- Memories: shared Cloudinary stream, upload from both phones,
  random card + ambient background slideshow
- i18n ja/en/es, share-link settings sync, localStorage persistence

## Roadmap

### v0.5 — Foundation (architecture release, no new features)
- Migrate to Vite + TypeScript + React, feature-first structure
- Bottom navigation shell (Home / Same Moment / Map / Memories / More)
- Home becomes a summary-card dashboard; details move to their own pages
- PWA: manifest, icons, service worker, installable on both phones
- Unit tests for time math; CI deploy to Vercel
- **Exit criterion: feature parity with v0, nothing lost**

### v1.1 — Same Moment + Live Map
- Same Moment MVP: both partners upload a photo of "right now"; photos
  unlock together only when both have uploaded; shows each side's local
  time and day/night state
- Requires backend: accounts (lightweight), couple pairing, shared state
  → Supabase (auth + Postgres + realtime + row-level security)
- Live Map v1: static world map, two avatars, cities, local times,
  great-circle distance, day/night terminator

### v1.2 — Context of two countries
- Exchange rate card (JPY ⇄ CLP)
- Both countries' public holidays on a shared calendar view

### v1.3 — AI features
- Translation (ja ⇄ es) tuned for couple conversation
- Conversation starters / date-over-video ideas
- Uses Claude API via a small server route (keys never in the client)

### v1.4 — Relationship analytics
- Data: Same Moment streaks, uploads, calls logged, reunions, messages
- Monthly report + yearly "Wrapped"; date-range filters

### v2.0 — Deep integrations
- Flight price tracking for the couple's route
- Voice translation
- Calendar integration (Google/Apple)
- Push notifications (FCM / Web Push via the PWA)

## Non-goals (for now)

- Social features beyond the couple (feeds, friends)
- Native App Store apps — PWA first; revisit if push on iOS proves limiting
- Monetization

## Success metrics

- Both partners open the app ≥ 4 days/week
- Same Moment completion rate (both sides uploaded) ≥ 50% of started days
- Settings survive device change (backend adoption) without support help
