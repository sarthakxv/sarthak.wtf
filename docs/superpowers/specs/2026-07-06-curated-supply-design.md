# /curated — Curated Supply (design)

Date: 2026-07-06
Status: Approved for planning

## Summary

A new route `/curated` presenting a personally curated collection of physical
items Sarthak owns, styled after the austere, text-forward ideology of
yeezy.com and curated.supply. Each item's product photo is rendered as an
interactive **2.5D depth-parallax object** in three.js / react-three-fiber
(R3F): a flat cutout gains sculpted relief from a generated depth map and tilts
toward the cursor, reading as genuinely 3D without any real 3D models.

The page slots in alongside the existing `/work`, `/stash`, and `/essay`
routes and reuses the site's established design system (ink color tokens,
Departure Mono for meta text, `SoundLink` hover/click sound, themeable
`bg-base`).

## Goals

- A "things I own" index that feels like a supply drop / lookbook, not a store.
- Each item's photo reads as a 3D object without sourcing or modeling real 3D
  geometry.
- Zero ML or heavy compute at request time — the deployed page is static
  assets and ships on Vercel like the rest of the site.
- Data-driven and additive: new items are a JSON entry + a cutout image.

## Non-goals

- No true walk-around 360° / orbitable meshes.
- No real GLB/GLTF models, no photogrammetry, no image-to-mesh generation.
- No per-item narrative/prose — the detail view is a clinical spec sheet only.
- No e-commerce, cart, or pricing.

## Experience

### Layout — "The Index" (yeezy brutalist)

Landing at `/curated` is a bare monospace list, generous whitespace:

```
curated / supply              ‹ back

001   LEICA M6              2019
002   HERMAN MILLER AERON   2021
003   RIMOWA ORIGINAL       2020
```

Each row: zero-padded code · name · acquired year. Rows use `SoundLink` for
the site's hover/click sounds. One 3D object is shown at a time (best
performance and truest to the ideology).

### Detail — object takeover

Clicking a name transitions that item's object into the center of the
viewport, big, where it tilts/parallaxes toward the cursor with a subtle idle
float. Beside it, a **spec sheet only** (no prose):

```
003  RIMOWA ORIGINAL

maker      Rimowa
material   aluminium
category   travel
acquired   2020
```

Back returns to the Index. Detail has a real, shareable, deep-linkable URL.

## The 3D technique (2.5D depth parallax)

Per item there are two assets: the **clean cutout PNG** (subject on a
transparent background, supplied by Sarthak) and a **grayscale depth map**
(near = light, far = dark) generated offline from the cutout.

Rendering (R3F):

- A finely-subdivided `planeGeometry` (e.g. ~200×200 segments).
- `meshStandardMaterial` with:
  - `map` = cutout, `transparent`, `alphaTest` tuned so the silhouette stays
    clean (transparent regions are discarded at the fragment stage, so
    displaced-but-invisible vertices don't dirty the outline).
  - `displacementMap` = depth map, `displacementScale` tuned (~0.3–0.6) for
    sculpted relief.
- **Parallax to cursor**: the object group lerps its rotation toward the
  pointer within a small range (~±0.15 rad). Motion parallax is the strongest
  depth cue and is what sells "flat photo → 3D object."
- Subtle idle float, soft studio lighting (key/fill/rim or a drei
  `Environment`), and a soft contact shadow to ground the object.
- Canvas background is transparent so the themeable `bg-base` shows through.

Decided recipe: **displacement-relief + cursor-tilt** (rather than a pure
UV-parallax occlusion shader) — it looks more sculptural under lighting and
casts a real shadow.

### Fallbacks / accessibility

- `prefers-reduced-motion`: no tilt/float; render the object static (or the
  plain cutout).
- WebGL unavailable / mobile low-power: fall back to the static cutout image.
- Mobile: tilt driven by touch drag (device-orientation optional, later).
- The R3F `Canvas` is client-only (`ssr: false`) and lazy-loaded so it never
  blocks first paint or SSR.

## Depth-map pipeline (one-time, offline)

A Node script (`scripts/gen-depth.mjs`) uses **transformers.js
Depth-Anything** running in-process (no Python, no paid API) to read each
cutout in `public/curated/` and write a `<name>-depth.png` beside it, using
`sharp` for image I/O. Workflow: drop cutouts into `public/curated/`, run
`node scripts/gen-depth.mjs`, commit the generated depth maps. The runtime
page consumes only static PNGs.

## Architecture

### Routing & canvas persistence

Single `/curated` page. Selected item lives in a **query param**
(`/curated?item=rimowa-original`), not a path segment. Changing a query param
re-renders the same route segment without remounting it, so the R3F `Canvas`
mounts once and persists across index ↔ detail — no `layout.tsx` canvas and no
shared store needed. This is the best-of-both: single-page simplicity plus a
shareable, deep-linkable, back-button-friendly URL.

- `app/curated/page.tsx` — the whole page (index list + detail takeover),
  toggled by the `item` query param.
- Read selection with `useSearchParams()`; write it with
  `router.push('/curated?item=<slug>', { scroll: false })`. Back button
  returns to the Index because `push` adds a history entry.
- **Caveat:** `useSearchParams()` must sit under a `<Suspense>` boundary or
  Next's build errors — wrap the reading component accordingly.
- No item selected → Index list. `item` present and valid → that object takes
  over. `item` present but unknown → fall back to the Index.

### Components (`components/curated/`)

- `CuratedCanvas` — the R3F `Canvas`, lighting, shadow, environment; renders
  the currently focused `DepthObject`.
- `DepthObject` — the plane + material + displacement + cursor-tilt/idle-float
  interaction for one item.
- `IndexList` — the monospace list of rows (uses `SoundLink`).
- `SpecSheet` — the clinical metadata block for the detail view.

### Data (`content/curated.json`)

Array of items; each item:

```json
{
  "code": "003",
  "slug": "rimowa-original",
  "name": "RIMOWA ORIGINAL",
  "maker": "Rimowa",
  "material": "aluminium",
  "category": "travel",
  "acquired": "2020",
  "image": "/curated/rimowa-original.png"
}
```

The depth map path is derived by convention (`-depth.png`) or stored
explicitly — the plan will decide.

### Entry point

Add a `curated` link into the home page (`app/page.tsx`) list sections so the
route is discoverable.

## Dependencies

- Runtime: `three`, `@react-three/fiber`, `@react-three/drei`. Introduces a
  WebGL stack the site does not yet have, isolated to `/curated`.
- Dev-only (depth script): `@huggingface/transformers`, `sharp`.

## Design system fit

- Typography: Departure Mono for codes/specs (matches existing meta usage),
  sans for names.
- Color: ink tokens (`--ink-fg`, `--ink-mid`, `--ink-soft`) on `bg-base`;
  transparent canvas so themeable backgrounds show through.
- Sound: `SoundLink` on list rows and back button, consistent with the rest
  of the site.

## Success criteria

- `/curated` renders the Index list from `content/curated.json`.
- Clicking an item shows its cutout as a depth-displaced object that visibly
  tilts/parallaxes toward the cursor and reads as 3D.
- Spec sheet renders beside the object; back returns to the Index; detail URLs
  are shareable and deep-linkable.
- Reduced-motion and no-WebGL fall back to a static cutout.
- Depth maps are generated by `scripts/gen-depth.mjs` with no runtime ML.
- No SSR/first-paint regression on `/curated`; other routes unaffected.
