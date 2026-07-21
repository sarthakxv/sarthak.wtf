# Signature Wordmark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage `LissajousName` wordmark with the real "Sarthak" signature SVG, drawn on with a chained pen-stroke animation.

**Architecture:** The raw SVG moves to `public/assets/`; its 4 path `d` strings are extracted into a generated TS data module so a client component can inline them (CSS can only animate SVG that's in the DOM). The component renders the paths monoline (`fill:none`, `stroke:currentColor`) with a `stroke-dashoffset` draw animation whose per-path durations are weighted by real arc length and whose delays chain sequentially.

**Tech Stack:** Next.js (App Router), React client component, plain CSS keyframes in `app/globals.css`, pnpm.

## Global Constraints

- Commit messages: conventional commits format. **Never add a `Co-Authored-By` trailer** (user preference).
- Spec: `docs/superpowers/specs/2026-07-21-signature-wordmark-design.md`.
- No new dependencies.
- This repo has no unit-test framework; the test cycle per task is `pnpm build` (type-check + prerender) plus the stated grep/visual checks.
- Working branch: `feat-sign`.

---

### Task 1: Signature asset, data module, component, and CSS

**Files:**
- Create: `public/assets/sarthak-signature.svg` (moved from `~/downloads/sarthak.svg`)
- Create: `components/home/signaturePaths.ts` (generated)
- Create: `components/home/SignatureName.tsx`
- Modify: `app/globals.css` (add `signature-draw` block after the `lissajous-draw` block, around line 206 — do NOT remove the lissajous block yet; that's Task 2)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  - `SignatureName({ height?: number }): JSX.Element` — named export of `components/home/SignatureName.tsx`. Default `height = 56`.
  - `SIGNATURE_VIEWBOX: string` and `SIGNATURE_PATHS: string[]` — named exports of `components/home/signaturePaths.ts`.
  - CSS class `signature-path` in `app/globals.css`.

- [ ] **Step 1: Move the SVG into the asset dir**

```bash
mv ~/downloads/sarthak.svg public/assets/sarthak-signature.svg
```

Verify: `rg -c "<path" public/assets/sarthak-signature.svg` prints `1` (single line, 4 path elements on it) and `rg -o 'viewBox="[^"]+"' public/assets/sarthak-signature.svg` prints `viewBox="283.042 234.317 539.539 141.639"`.

- [ ] **Step 2: Generate the path data module**

```bash
node --input-type=module -e '
import { readFileSync, writeFileSync } from "fs";
const svg = readFileSync("public/assets/sarthak-signature.svg", "utf8");
const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
const ds = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const out = `// Path data extracted from public/assets/sarthak-signature.svg — do not hand-edit.
// Regenerate with the script in docs/superpowers/plans/2026-07-21-signature-wordmark.md (Task 1, Step 2).
export const SIGNATURE_VIEWBOX = ${JSON.stringify(viewBox)};

export const SIGNATURE_PATHS: string[] = ${JSON.stringify(ds, null, 2)};
`;
writeFileSync("components/home/signaturePaths.ts", out);
console.log("wrote", ds.length, "paths, viewBox:", viewBox);
'
```

Expected output: `wrote 4 paths, viewBox: 283.042 234.317 539.539 141.639`

- [ ] **Step 3: Create the component**

Create `components/home/SignatureName.tsx` with exactly:

```tsx
"use client";

import { useState } from "react";
import { SIGNATURE_PATHS, SIGNATURE_VIEWBOX } from "./signaturePaths";

/**
 * The signature's four strokes, drawn on in sequence like live handwriting.
 * WEIGHTS are each stroke's share of the total arc length (precomputed from
 * the path data; they sum to 1), so long strokes take proportionally longer
 * and each stroke starts as the previous one ends.
 */
const WEIGHTS = [0.188, 0.309, 0.497, 0.006];
const TOTAL_DRAW_S = 1.8;
const MIN_DRAW_S = 0.08; // floor so the final i-dot registers as a stroke

// viewBox is "minX minY width height" — width/height set the aspect ratio.
const [, , VB_W, VB_H] = SIGNATURE_VIEWBOX.split(" ").map(Number);

export function SignatureName({ height = 56 }: { height?: number }) {
  // Bumping this remounts the paths, restarting the draw on each hover.
  const [replay, setReplay] = useState(0);
  let elapsed = 0;

  return (
    <div
      aria-label="Sarthak"
      role="img"
      title="Sarthak"
      className="inline-flex cursor-pointer"
      onMouseEnter={() => setReplay((r) => r + 1)}
    >
      <svg
        width={(height * VB_W) / VB_H}
        height={height}
        viewBox={SIGNATURE_VIEWBOX}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {SIGNATURE_PATHS.map((d, i) => {
          const duration = Math.max(WEIGHTS[i] * TOTAL_DRAW_S, MIN_DRAW_S);
          const delay = elapsed;
          elapsed += duration;
          return (
            <path
              key={`${replay}-${i}`}
              d={d}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              className="signature-path"
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Add the CSS block**

In `app/globals.css`, directly AFTER the closing `}` of the `.lissajous-letter path { ... }` rule (currently ends around line 206), insert:

```css
/* Signature wordmark: each stroke draws itself on, then holds.
   pathLength is normalised to 1, so dashoffset animates 1 (hidden) -> 0 (drawn).
   Per-stroke duration/delay are set inline by SignatureName.tsx.
   The global reduced-motion rule below snaps this to the finished signature. */
@keyframes signature-draw {
  to { stroke-dashoffset: 0; }
}
.signature-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation-name: signature-draw;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: forwards;
}
```

- [ ] **Step 5: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds with no type errors. (The component isn't rendered anywhere yet — that's Task 2.)

- [ ] **Step 6: Commit**

```bash
git add public/assets/sarthak-signature.svg components/home/signaturePaths.ts components/home/SignatureName.tsx app/globals.css
git commit -m "feat(home): add SignatureName animated signature component"
```

---

### Task 2: Swap the homepage wordmark and remove LissajousName

**Files:**
- Modify: `app/page.tsx` (import at line 4, usage at line 44)
- Modify: `app/globals.css` (delete the `lissajous-draw` keyframes + `.lissajous-letter path` rule and their comment, lines ~195-206)
- Delete: `components/home/LissajousName.tsx`

**Interfaces:**
- Consumes: `SignatureName({ height?: number })` named export from `components/home/SignatureName.tsx` (Task 1). Renders at default height (no props needed).
- Produces: nothing consumed by later tasks (final task).

- [ ] **Step 1: Swap the import in `app/page.tsx`**

Replace line 4:

```tsx
import { LissajousName } from "@/components/home/LissajousName";
```

with:

```tsx
import { SignatureName } from "@/components/home/SignatureName";
```

- [ ] **Step 2: Swap the usage in `app/page.tsx`**

Replace (around line 42-46, keep the wrapper div unchanged):

```tsx
          {/* 1. Wordmark — name spelled as Lissajous curves */}
          <div className="fade-in text-[color:var(--ink-fg)]" style={{ animationDelay: "0ms" }}>
            <LissajousName name="SARTHAK" size={40} gap={8} />
          </div>
```

with:

```tsx
          {/* 1. Wordmark — signature drawn on like live handwriting */}
          <div className="fade-in text-[color:var(--ink-fg)]" style={{ animationDelay: "0ms" }}>
            <SignatureName />
          </div>
```

- [ ] **Step 3: Delete the old component and CSS**

```bash
git rm components/home/LissajousName.tsx
```

In `app/globals.css`, delete this entire block (comment + keyframes + rule):

```css
/* Fourier-traced wordmark: each glyph's path draws itself on, then holds.
   pathLength is normalised to 1, so dashoffset animates 1 (hidden) -> 0 (drawn).
   The global reduced-motion rule below snaps this to the finished letter. */
@keyframes lissajous-draw {
  to { stroke-dashoffset: 0; }
}
.lissajous-letter path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: lissajous-draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
```

- [ ] **Step 4: Verify no dangling references**

Run: `rg -i "lissajous" --glob '!node_modules' --glob '!.next' .`
Expected: no matches in `app/` or `components/` (matches inside `docs/` spec/plan files are fine).

- [ ] **Step 5: Build**

Run: `pnpm build`
Expected: build succeeds; `/` prerenders without errors.

- [ ] **Step 6: Visual smoke check**

```bash
pnpm start & sleep 3
curl -s http://localhost:3000 | rg -o 'signature-path' | head -1
curl -s http://localhost:3000 | rg -c 'lissajous' || echo "no lissajous — good"
kill %1
```

Expected: `signature-path` found; `no lissajous — good`. (If port 3000 is busy, use `pnpm start -p 3010` and curl 3010.)

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat(home): replace Lissajous wordmark with animated signature"
```
