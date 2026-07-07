# TODO

## Phase 0 — Hygiene (before any refactor) ✅
- [x] `git init` + first commit of current v0
- [x] Move project to `~/dev/couple-dashboard`
- [x] Private GitHub repo: https://github.com/eco-libra/couple-dashboard
- [x] Vercel connected to the repo (push to main = production deploy)

## Phase 1 — v0.5 Foundation ✅ (shipped)
- [x] Scaffold Vite + React + TypeScript
- [x] Design tokens + component styles in `src/styles/global.css`
- [x] `shared/time` pure functions with 15 Vitest tests (DST both seasons,
      midnight wrap, overlap, anniversaries)
- [x] i18n dictionaries in `shared/i18n` (ja/en/es)
- [x] App shell: BrowserRouter + bottom nav (Home / Moment / Map / Memories / More)
- [x] v0 features ported to `features/*`; ambient photo background kept globally
- [x] Home = summary cards linking to /clocks, /milestones, /memories
- [x] PWA: manifest, generated icons, service worker (autoUpdate,
      runtime cache for Cloudinary media)
- [ ] Install test on iPhone Safari and Xiaomi Chrome (user to confirm)
- [x] v0 preserved at `legacy/v0.html`

## Phase 2 — v1.1 Same Moment + Map ✅ (shipped, backend-free)
- [x] Same Moment MVP: upload → lock → unlock when both uploaded
      (Cloudinary tags `m-<day>-<role>`, day = Tokyo date, role picker per device)
- [x] Live Map v1: canvas world map, avatars, great-circle route,
      day/night terminator, distance
- Decision: Supabase deferred until notifications/streak/realtime (v1.2+):
  - [ ] Supabase project: auth (magic link), `couples`, `moments` tables, RLS
  - [ ] Pairing flow: one partner invites via link, both devices linked
  - [ ] Migrate settings sync from URL-hash to backend (keep hash as fallback)
  - [ ] Same Moment: notifications + streak (needs backend)

## Later
- [ ] Exchange rate + holidays (v1.2)
- [ ] AI translation & suggestions via server route (v1.3)
- [ ] Analytics + Wrapped (v1.4)
- [ ] Flights, voice, calendar, push (v2.0)

## Known debt / bugs to watch
- [ ] Cloudinary list endpoint is CDN-cached → new uploads can take minutes
      to appear on the partner's device (acceptable for now; fix with backend)
- [ ] Upload has no client-side image compression → large videos are slow
- [ ] `confirm()`-based share-link import should become a proper dialog
