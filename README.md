# Couple Dashboard — "Futari"

A dashboard for international long-distance couples (currently Tokyo ⇄ Santiago).
Helps two people in opposite time zones feel connected: shared clocks, talk-window
finder, anniversaries, reunion countdown, and a shared photo memory stream.

**Production:** https://couple-dashboard-kappa.vercel.app

## Current state (v0)

Single self-contained `index.html` (vanilla JS/CSS, no build step) deployed to
Vercel as a static site.

Features:
- Dual city clocks with day/night sky cards (DST-safe via `Intl` time zones)
- Wake/sleep schedules → "can we talk now?" overlap timeline
- Reunion countdown, "together for N days", recurring anniversaries
- Random memories card + ambient background slideshow (Cloudinary)
- Direct photo/video upload from both phones (unsigned Cloudinary preset)
- i18n: Japanese / English / Spanish (es-CL)
- Settings sync between devices via share-link (state encoded in URL hash)
- Persistence: `localStorage` only — there is no backend yet

## Target architecture (v0.5+)

See `PRD.md` for the product roadmap and the architecture section below for
rationale. Planned stack:

```
Vite + TypeScript + React (+ vite-plugin-pwa)
src/
  app/            # shell: router, bottom nav, providers, PWA setup
  features/       # one folder per feature, independent of each other
    home/         # summary cards (tap-through to detail pages)
    clocks/       # city time, sky state, overlap timeline
    same-moment/  # the core feature (v1.1)
    map/          # live map (v1.1)
    memories/     # photo stream, upload, slideshow
    milestones/   # anniversaries, countdowns
    settings/     # profile, schedules, language, share/sync
  shared/
    ui/           # design-system components (Card, Pill, TimeText, ...)
    i18n/         # dictionaries + hooks
    time/         # tz math (offset, overlap segments) — pure, unit-tested
    services/     # cloudinary.ts, storage.ts, (later) backend client
  styles/         # design tokens (CSS custom properties)
```

Rules:
- Features may import from `shared/`, never from each other.
- All time-zone math lives in `shared/time` as pure functions with tests.
- All user-visible strings go through `shared/i18n`.
- Backend (accounts, couple pairing, Same Moment unlock, notifications) is
  planned on Supabase from v1.1; until then storage stays local + Cloudinary.

## Development

v0 has no build step: edit `index.html`, open it in a browser.

Deploy:
```bash
npx --yes vercel@latest deploy --prod --yes
```

## Docs

- `PRD.md` — product vision, personas, versioned roadmap
- `TODO.md` — actionable next steps per phase
- `CHANGELOG.md` — release history
- `IDEAS.md` — unprioritized backlog
