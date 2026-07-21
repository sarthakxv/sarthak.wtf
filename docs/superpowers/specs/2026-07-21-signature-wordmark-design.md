# Signature Wordmark — Design

**Date:** 2026-07-21
**Status:** Approved

## Goal

Replace the homepage wordmark — currently `LissajousName` rendering "SARTHAK" as
Fourier-traced letters — with the real "Sarthak" signature, drawn on with a
handwriting (pen draw-on) animation, in the style of signaturegen.ai's live
signature tool.

## Source asset

`~/downloads/sarthak.svg` — a signature export containing 4 `<path>` elements
inside `viewBox="283.042 234.317 539.539 141.639"` (~3.8:1 aspect). The paths
are variable-width filled ink outlines. Per the approved direction, they are
rendered **monoline**: `fill="none"`, `stroke="currentColor"`, thin stroke —
matching the site's existing thin-stroke aesthetic and adapting to theme
automatically.

The file is moved into the repo at `public/assets/sarthak-signature.svg` as the
canonical raw asset. Rendering does not load it via `<img>`; the paths are
inlined in a component because CSS can only animate SVG internals that are in
the DOM.

## Component

New `components/home/SignatureName.tsx` (client component, mirrors the
`LissajousName` API shape):

- One inline `<svg>` with the original viewBox and the 4 paths.
- Path styling: `fill="none"`, `stroke="currentColor"`, `strokeWidth ≈ 1.4`,
  `strokeLinecap="round"`, `strokeLinejoin="round"`,
  `vectorEffect="non-scaling-stroke"` — identical line weight to the current
  wordmark at any size.
- `height` prop, default **56** (px). Width follows the aspect ratio (~213px).
- Draw-on animation: each path gets `pathLength={1}` plus a
  `stroke-dasharray: 1; stroke-dashoffset: 1 → 0` animation.
  - Durations are **weighted by real path length** (the "arthak" run is far
    longer than the i-dot). Lengths are precomputed once by a throwaway node
    script and hardcoded as constants in the component.
  - Delays are chained: each stroke starts when the previous one finishes, so
    the signature reads as continuous handwriting, not four parallel strokes.
  - Total draw time ≈ 1.6–2.0s with the existing
    `cubic-bezier(0.65, 0, 0.35, 1)` ease.
- Replay on hover: a `replay` state counter bumps the paths' React `key`,
  remounting them and restarting the animation (same mechanism as
  `LissajousName`).
- Accessibility: wrapper has `role="img"`, `aria-label="Sarthak"`,
  `title="Sarthak"`; the svg itself is `aria-hidden`.

## CSS

`app/globals.css`: replace the `lissajous-draw` keyframes/rule with a
`signature-draw` equivalent (dashoffset → 0, `forwards` fill). The existing
global `prefers-reduced-motion` rule already snaps animations to their final
state, so reduced-motion users see the finished signature immediately.

## Integration & cleanup

- `app/page.tsx`: swap `<LissajousName name="SARTHAK" size={40} gap={8} />`
  for `<SignatureName />` inside the same `fade-in` wrapper.
- Delete `components/home/LissajousName.tsx` (only consumer is the homepage).
- Delete the `lissajous-draw` CSS block.

## Testing

- `pnpm build` passes (type-check + prerender).
- Visual check in dev: draws on load, replays on hover, correct color in both
  themes, sensible size against the subheading, reduced-motion shows the
  finished signature without animation.
