# sarthak.wtf — redesign

Personal site for Sarthak Verma. Built with Next.js 16, TypeScript, Tailwind v4, and framer-motion.

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Stack

| Layer          | Tool                                      |
|----------------|-------------------------------------------|
| Framework      | Next.js 16 (App Router)                   |
| Language       | TypeScript                                |
| Styles         | Tailwind v4                               |
| Motion         | framer-motion                             |
| Icons          | @phosphor-icons/react                     |
| Audio          | @web-kits/audio                           |
| Fonts          | Caveat, Pacifico, JetBrains Mono (Google) |

## Routes

- `/` — single-column home with intro, work carousel, live commit graph, experience, artifacts, experiments, bookshelf, elsewhere, plus a T-Rex game at the bottom.
- `/work` — full work list with imagery (xaut.cool, pills.trade, Eido App, Genie DEX, plus sketches).
- `/stash` — curated sites worth seeing.
- `/api/commits` — proxies `github.com/sarthakxv` public events into a 30-day commit graph.

## Content

All content lives under `content/*.json` (work, bookshelf, stash) or as hardcoded arrays in `app/page.tsx` (experience, artifacts, experiments). Project cover images live in `public/work/`.

## Notes

- Dappled-light overlay is a looping muted MP4 (`public/leaves.mp4`) with `mix-blend-mode: multiply`.
- Lissajous wordmark animates via `requestAnimationFrame`; hovers speed up the phase and dim the trailing letters.
- Bookshelf is a 3D CSS port of the grizz.fyi technique — closed spines rotate 90° around their left edge; click to open.
- Sound toggle (bottom-left) persists in `localStorage["sarthak.muted"]`.
- T-Rex high score persists in `localStorage["sarthak.dino.hi"]`.
