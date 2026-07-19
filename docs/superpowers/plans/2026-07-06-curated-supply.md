# /curated — Curated Supply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/curated` route — a yeezy-brutalist index of items Sarthak owns, where each item's cutout photo renders as an interactive 2.5D depth-parallax object in react-three-fiber.

**Architecture:** A single client-driven `/curated` page. The selected item lives in a `?item=<slug>` query param (shareable, deep-linkable, back-button friendly). A single R3F `<Canvas>` stays mounted the whole time (changing a query param re-renders the same route segment without remounting it), so the 3D object "takes over" smoothly. Each object is a subdivided plane whose vertices are displaced by a depth map and whose surface is lit via a normal map — both generated offline from the cutout by a Node script (transformers.js Depth-Anything). No ML or 3D models at runtime; the page ships as static assets.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, three.js, @react-three/fiber v9, @react-three/drei v10. Dev-only: @huggingface/transformers + sharp (depth/normal generation).

## Global Constraints

- **Runtime R3F versions must support React 19:** `@react-three/fiber` ≥ 9, `@react-three/drei` ≥ 10. Installing `latest` resolves these correctly.
- **No runtime ML / no network assets in the 3D scene:** depth + normal maps are pre-generated static PNGs; do NOT use drei `<Environment>` presets (they fetch a remote HDR). Use explicit lights only.
- **Canvas is client-only:** every file rendering `<Canvas>` or R3F hooks starts with `"use client"`. The `<Canvas>` is imported with `next/dynamic` `{ ssr: false }` from within a client component.
- **`useSearchParams()` must sit under a `<Suspense>` boundary** or `next build` fails.
- **Design system:** ink tokens (`--ink-fg`, `--ink-mid`, `--ink-soft`) and `--color-*` tokens on `var(--bg-base)`; `font-departure` (Departure Mono) for codes/specs; sans for names. Path alias `@/*` → repo root.
- **Sound:** interactive links use `SoundLink` (`sound="tick"` on hover default; `sound="click" on="click"` for the back button), matching every other page.
- **Accessibility:** honor `prefers-reduced-motion` (no tilt/float; static object) and fall back to a plain `<img>` when WebGL is unavailable.
- **Testing approach (deliberate):** the repo has no test runner and this is a visual/WebGL feature. Gates are `npx tsc --noEmit` (typecheck), `npm run lint`, `npm run build`, plus explicit dev-server visual checks. The depth script is verified by a runnable Node assertion on its output files. Adding a unit-test framework to test trivial pure logic would be YAGNI here.
- **Commits:** conventional commits, solo-authored — do NOT add a `Co-Authored-By` trailer.

## File Structure

- `content/curated.json` — the item data array (code, slug, name, maker, material, category, acquired, image).
- `lib/curated.ts` — `CuratedItem` type, typed `curatedItems`, `getCuratedItem(slug)`, and `depthSrc()/normalSrc()` path helpers.
- `scripts/gen-depth.mjs` — offline depth + normal map generator (transformers.js + sharp).
- `components/curated/DepthObject.tsx` — one item's plane + displacement + normal + cursor-tilt/idle-float mesh.
- `components/curated/CuratedCanvas.tsx` — the `<Canvas>`, camera, lights, contact shadow; renders the focused `DepthObject`; WebGL/reduced-motion fallback.
- `components/curated/IndexList.tsx` — the monospace item list (rows link to `?item=<slug>`).
- `components/curated/SpecSheet.tsx` — the clinical metadata block for the detail view.
- `components/curated/CuratedView.tsx` — `"use client"` composition: reads `?item`, keeps the canvas mounted, toggles index ↔ detail, back button.
- `app/curated/page.tsx` — server component: `metadata` export + `<Suspense>` around `<CuratedView>`.
- `app/page.tsx` — add a discoverable `curated` link.

---

### Task 1: Dependencies + R3F smoke test

**Files:**
- Modify: `package.json` (dependencies)
- Create (interim, replaced in Task 7): `app/curated/page.tsx`

**Interfaces:**
- Produces: a working R3F setup in Next 16 / React 19 proving the toolchain renders WebGL.

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install three @react-three/fiber @react-three/drei
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D @types/three @huggingface/transformers sharp
```

- [ ] **Step 3: Verify React-19-compatible versions resolved**

```bash
node -e "const p=require('./package.json');console.log(p.dependencies['@react-three/fiber'],p.dependencies['@react-three/drei'])"
```
Expected: fiber `^9.x` (or higher) and drei `^10.x` (or higher). If either is lower, run `npm install three @react-three/fiber@latest @react-three/drei@latest`.

- [ ] **Step 4: Create an interim smoke-test page**

Create `app/curated/page.tsx` (this whole file is replaced in Task 7):

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function SpinningBox() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
  );
}

export default function CuratedPage() {
  return (
    <main style={{ height: "100vh", background: "var(--bg-base)" }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <SpinningBox />
      </Canvas>
    </main>
  );
}
```

- [ ] **Step 5: Run the dev server and verify visually**

Run: `npm run dev`, then open `http://localhost:3000/curated`.
Expected: a dark spinning cube on the page background. No console errors about React version mismatch or hydration.

- [ ] **Step 6: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both pass (build will client-render the page; a spinning-box page is fine).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json app/curated/page.tsx
git commit -m "feat(curated): add three.js/r3f deps and canvas smoke test"
```

---

### Task 2: Content model + data + lookup helpers

**Files:**
- Create: `content/curated.json`
- Create: `lib/curated.ts`

**Interfaces:**
- Produces:
  - `type CuratedItem = { code: string; slug: string; name: string; maker: string; material: string; category: string; acquired: string; image: string }`
  - `curatedItems: CuratedItem[]`
  - `getCuratedItem(slug: string): CuratedItem | undefined`
  - `depthSrc(item: CuratedItem): string` — `image` with `.png` → `-depth.png`
  - `normalSrc(item: CuratedItem): string` — `image` with `.png` → `-normal.png`

- [ ] **Step 1: Create seed content**

Create `content/curated.json` with two placeholder items (real cutouts get dropped in later; these slugs/paths define the convention):

```json
[
  {
    "code": "001",
    "slug": "leica-m6",
    "name": "LEICA M6",
    "maker": "Leica",
    "material": "brass, vulcanite",
    "category": "camera",
    "acquired": "2019",
    "image": "/curated/leica-m6.png"
  },
  {
    "code": "002",
    "slug": "rimowa-original",
    "name": "RIMOWA ORIGINAL",
    "maker": "Rimowa",
    "material": "anodised aluminium",
    "category": "travel",
    "acquired": "2020",
    "image": "/curated/rimowa-original.png"
  }
]
```

- [ ] **Step 2: Create the lib module**

Create `lib/curated.ts`:

```ts
import data from "@/content/curated.json";

export type CuratedItem = {
  code: string;
  slug: string;
  name: string;
  maker: string;
  material: string;
  category: string;
  acquired: string;
  image: string;
};

export const curatedItems = data as CuratedItem[];

export function getCuratedItem(slug: string | null | undefined): CuratedItem | undefined {
  if (!slug) return undefined;
  return curatedItems.find((item) => item.slug === slug);
}

/** Depth map path by convention: `/curated/foo.png` → `/curated/foo-depth.png`. */
export function depthSrc(item: CuratedItem): string {
  return item.image.replace(/\.png$/i, "-depth.png");
}

/** Normal map path by convention: `/curated/foo.png` → `/curated/foo-normal.png`. */
export function normalSrc(item: CuratedItem): string {
  return item.image.replace(/\.png$/i, "-normal.png");
}
```

- [ ] **Step 3: Verify it typechecks and resolves the JSON import**

Run: `npx tsc --noEmit`
Expected: passes. (Next's `resolveJsonModule` is already on via `next` tsconfig; if `tsc` complains about the JSON import, confirm `"resolveJsonModule": true` in `tsconfig.json` and add it if missing.)

- [ ] **Step 4: Sanity-check the helpers at the node level**

Run:
```bash
node --input-type=module -e "
import data from './content/curated.json' with { type: 'json' };
const items = data;
const bySlug = (s) => items.find(i => i.slug === s);
console.assert(bySlug('leica-m6')?.name === 'LEICA M6', 'leica lookup');
console.assert(bySlug('nope') === undefined, 'unknown slug');
console.assert(items[0].image.replace(/\.png$/i,'-depth.png') === '/curated/leica-m6-depth.png', 'depth path');
console.log('curated data OK:', items.length, 'items');
"
```
Expected: `curated data OK: 2 items` with no assertion errors.

- [ ] **Step 5: Commit**

```bash
git add content/curated.json lib/curated.ts
git commit -m "feat(curated): content model, seed data, and lookup helpers"
```

---

### Task 3: Depth + normal map generation script

**Files:**
- Create: `scripts/gen-depth.mjs`
- Modify: `package.json` (add `"gen-depth"` script)

**Interfaces:**
- Produces: for every `public/curated/*.png` that is not itself a `-depth`/`-normal` map, writes `<base>-depth.png` (grayscale, near=light) and `<base>-normal.png` (tangent-space normal map derived from depth) beside it.

- [ ] **Step 1: Write the generator script**

Create `scripts/gen-depth.mjs`:

```js
// Offline depth + normal map generator for /curated cutouts.
// Usage: node scripts/gen-depth.mjs
// Reads every cutout PNG in public/curated (excluding *-depth.png / *-normal.png),
// runs Depth-Anything via transformers.js, and writes grayscale depth + a
// normal map derived from that depth. No network at runtime; run this once
// when you add or change a cutout, then commit the generated maps.

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { pipeline } from "@huggingface/transformers";

const DIR = "public/curated";

function isSource(name) {
  return (
    name.toLowerCase().endsWith(".png") &&
    !name.endsWith("-depth.png") &&
    !name.endsWith("-normal.png")
  );
}

// Sobel height-field → tangent-space normal map (RGB packed).
function depthToNormal(depth, width, height, strength = 2.0) {
  const out = Buffer.alloc(width * height * 3);
  const at = (x, y) => {
    const cx = Math.min(width - 1, Math.max(0, x));
    const cy = Math.min(height - 1, Math.max(0, y));
    return depth[cy * width + cx] / 255;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));
      const nx = dx * strength;
      const ny = dy * strength;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      const i = (y * width + x) * 3;
      out[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
    }
  }
  return out;
}

async function main() {
  let files;
  try {
    files = (await readdir(DIR)).filter(isSource);
  } catch {
    console.error(`No ${DIR} directory. Create it and add cutout PNGs first.`);
    process.exit(1);
  }
  if (files.length === 0) {
    console.log(`No source cutouts found in ${DIR}. Nothing to do.`);
    return;
  }

  console.log("Loading Depth-Anything (first run downloads the model)…");
  const depthEstimator = await pipeline(
    "depth-estimation",
    "onnx-community/depth-anything-v2-small"
  );

  for (const file of files) {
    const src = join(DIR, file);
    const base = file.replace(/\.png$/i, "");
    console.log(`→ ${file}`);

    // Flatten transparency onto mid-grey so the depth model sees a full frame,
    // then run depth estimation on that RGB image.
    const flatBuf = await sharp(src)
      .flatten({ background: "#808080" })
      .png()
      .toBuffer();

    const { depth } = await depthEstimator(
      `data:image/png;base64,${flatBuf.toString("base64")}`
    );
    // depth.data is a Uint8 grayscale buffer sized depth.width * depth.height.
    const dW = depth.width;
    const dH = depth.height;
    const depthData = depth.data;

    // Write depth PNG (single channel → greyscale).
    await sharp(Buffer.from(depthData), {
      raw: { width: dW, height: dH, channels: 1 },
    })
      .png()
      .toFile(join(DIR, `${base}-depth.png`));

    // Derive + write the normal map.
    const normal = depthToNormal(depthData, dW, dH);
    await sharp(normal, { raw: { width: dW, height: dH, channels: 3 } })
      .png()
      .toFile(join(DIR, `${base}-normal.png`));

    console.log(`  wrote ${base}-depth.png and ${base}-normal.png (${dW}×${dH})`);
  }
  console.log("Done.");
}

main();
```

- [ ] **Step 2: Add the npm script**

In `package.json` `"scripts"`, add:

```json
"gen-depth": "node scripts/gen-depth.mjs"
```

- [ ] **Step 3: Add a sample cutout to test against**

Create `public/curated/` and place at least one real cutout PNG there named to match a seed slug (`leica-m6.png` or `rimowa-original.png`). If no real cutout is available yet, generate a throwaway test PNG so the script has an input:

```bash
mkdir -p public/curated
node --input-type=module -e "
import sharp from 'sharp';
await sharp({create:{width:256,height:256,channels:4,background:{r:40,g:40,b:40,alpha:1}}})
  .composite([{input:Buffer.from(await (await import('sharp')).default({create:{width:120,height:120,channels:4,background:{r:220,g:60,b:60,alpha:1}}}).png().toBuffer()),left:68,top:68}])
  .png().toFile('public/curated/leica-m6.png');
console.log('wrote sample cutout');
"
```

- [ ] **Step 4: Run the generator**

Run: `npm run gen-depth`
Expected: logs `Loading Depth-Anything…`, then `→ leica-m6.png`, then `wrote leica-m6-depth.png and leica-m6-normal.png`. First run downloads the model (network needed once; cached under the HF cache dir afterward).

- [ ] **Step 5: Verify the outputs exist and are valid images**

Run:
```bash
node --input-type=module -e "
import sharp from 'sharp';
for (const f of ['public/curated/leica-m6-depth.png','public/curated/leica-m6-normal.png']) {
  const m = await sharp(f).metadata();
  console.assert(m.width>0 && m.height>0, f+' invalid');
  console.log(f, m.width+'x'+m.height, m.channels+'ch');
}
console.log('depth/normal outputs OK');
"
```
Expected: prints dimensions for both files and `depth/normal outputs OK`. Optionally open the PNGs to eyeball that the depth reads as a plausible near/far gradient.

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-depth.mjs package.json package-lock.json public/curated/
git commit -m "feat(curated): offline depth + normal map generation script"
```

Note: if `onnx-community/depth-anything-v2-small` fails to load in this environment, fall back to model id `Xenova/depth-anything-small-hf` (same pipeline API). Do not change the runtime page — only the script's model id.

---

### Task 4: DepthObject component

**Files:**
- Create: `components/curated/DepthObject.tsx`

**Interfaces:**
- Consumes: `CuratedItem`, `depthSrc`, `normalSrc` from `@/lib/curated`.
- Produces: `<DepthObject item={CuratedItem} reducedMotion={boolean} />` — an R3F mesh; must be rendered inside a `<Canvas>`.

- [ ] **Step 1: Implement the mesh**

Create `components/curated/DepthObject.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group, MathUtils } from "three";
import type { CuratedItem } from "@/lib/curated";
import { depthSrc, normalSrc } from "@/lib/curated";

/**
 * Track the pointer at the WINDOW level (normalized to -1..1), independent of
 * the R3F canvas's own pointer. The canvas layer is `pointer-events-none` so
 * list links stay clickable, which means `useThree().pointer` would never
 * update — hence this hook instead.
 */
function useWindowPointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

export function DepthObject({
  item,
  reducedMotion = false,
}: {
  item: CuratedItem;
  reducedMotion?: boolean;
}) {
  const group = useRef<Group>(null);
  const pointer = useWindowPointer();
  const [map, displacementMap, normalMap] = useTexture([
    item.image,
    depthSrc(item),
    normalSrc(item),
  ]);

  // Fit the plane to the texture's aspect ratio (assumes square-ish source;
  // scale X by aspect so the object isn't stretched).
  const image = map.image as HTMLImageElement | undefined;
  const aspect = image && image.height ? image.width / image.height : 1;

  useFrame(() => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0);
      return;
    }
    // Lerp tilt toward the pointer (window pointer components are in -1..1).
    const targetY = pointer.current.x * 0.35;
    const targetX = pointer.current.y * 0.25;
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, targetY, 0.08);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, targetX, 0.08);
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[2.4 * aspect, 2.4, 256, 256]} />
        <meshStandardMaterial
          map={map}
          displacementMap={displacementMap}
          displacementScale={0.45}
          normalMap={normalMap}
          alphaTest={0.5}
          transparent={false}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Temporarily wire it into the smoke-test page to verify visually**

Temporarily edit `app/curated/page.tsx` (from Task 1) to render `<DepthObject item={curatedItems[0]} />` inside the `<Canvas>` instead of `<SpinningBox />` (import `curatedItems` from `@/lib/curated`; add `<pointLight position={[2,2,2]} />`). Run `npm run dev`, open `/curated`.
Expected: the sample cutout appears as a plane with visible relief that tilts toward the cursor. Revert this temporary edit before finishing (Task 7 provides the real page). No commit for the temporary edit.

- [ ] **Step 4: Commit the component**

```bash
git add components/curated/DepthObject.tsx
git commit -m "feat(curated): DepthObject 2.5D depth-parallax mesh"
```

---

### Task 5: CuratedCanvas component

**Files:**
- Create: `components/curated/CuratedCanvas.tsx`

**Interfaces:**
- Consumes: `DepthObject`, `CuratedItem`.
- Produces: `<CuratedCanvas item={CuratedItem | null} reducedMotion={boolean} />` — the persistent `<Canvas>` with lighting + contact shadow; renders nothing (transparent) when `item` is null.

- [ ] **Step 1: Implement the canvas**

Create `components/curated/CuratedCanvas.tsx`:

```tsx
"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import type { CuratedItem } from "@/lib/curated";
import { DepthObject } from "./DepthObject";

export function CuratedCanvas({
  item,
  reducedMotion = false,
}: {
  item: CuratedItem | null;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4], fov: 40 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 1, 2]} intensity={0.5} />
      {item && (
        <Suspense fallback={null}>
          {reducedMotion ? (
            <DepthObject item={item} reducedMotion />
          ) : (
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
              <DepthObject item={item} />
            </Float>
          )}
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={3}
          />
        </Suspense>
      )}
    </Canvas>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/curated/CuratedCanvas.tsx
git commit -m "feat(curated): CuratedCanvas with lighting and contact shadow"
```

---

### Task 6: IndexList + SpecSheet

**Files:**
- Create: `components/curated/IndexList.tsx`
- Create: `components/curated/SpecSheet.tsx`

**Interfaces:**
- Consumes: `curatedItems`, `CuratedItem`, `SoundLink`.
- Produces:
  - `<IndexList />` — renders each item as a row linking to `/curated?item=<slug>`.
  - `<SpecSheet item={CuratedItem} />` — the metadata block.

- [ ] **Step 1: Implement IndexList**

Create `components/curated/IndexList.tsx`:

```tsx
"use client";

import { SoundLink } from "@/components/ui/SoundLink";
import { curatedItems } from "@/lib/curated";

export function IndexList() {
  return (
    <ul className="font-departure text-sm">
      {curatedItems.map((item) => (
        <li key={item.slug}>
          <SoundLink
            href={`/curated?item=${item.slug}`}
            scroll={false}
            className="group flex items-baseline gap-4 py-2 text-[color:var(--ink-mid)] hover:text-[color:var(--ink-fg)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
          >
            <span className="tabular-nums text-[color:var(--ink-soft)]">{item.code}</span>
            <span className="flex-1 uppercase tracking-wide">{item.name}</span>
            <span className="tabular-nums text-[color:var(--ink-soft)]">{item.acquired}</span>
          </SoundLink>
        </li>
      ))}
    </ul>
  );
}
```

Note: `SoundLink` spreads extra props to `next/link`, so `scroll={false}` is passed through.

- [ ] **Step 2: Implement SpecSheet**

Create `components/curated/SpecSheet.tsx`:

```tsx
import type { CuratedItem } from "@/lib/curated";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6">
      <dt className="w-24 shrink-0 text-[color:var(--ink-soft)]">{label}</dt>
      <dd className="text-[color:var(--ink-fg)]">{value}</dd>
    </div>
  );
}

export function SpecSheet({ item }: { item: CuratedItem }) {
  return (
    <div className="font-departure text-sm">
      <p className="mb-6 text-[color:var(--ink-soft)]">
        {item.code}{"  "}
        <span className="uppercase tracking-wide text-[color:var(--ink-fg)]">{item.name}</span>
      </p>
      <dl className="flex flex-col gap-2">
        <Row label="maker" value={item.maker} />
        <Row label="material" value={item.material} />
        <Row label="category" value={item.category} />
        <Row label="acquired" value={item.acquired} />
      </dl>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add components/curated/IndexList.tsx components/curated/SpecSheet.tsx
git commit -m "feat(curated): index list and spec sheet"
```

---

### Task 7: CuratedView + page (compose, query state, persistent canvas)

**Files:**
- Create: `components/curated/CuratedView.tsx`
- Modify: `app/curated/page.tsx` (replace the Task 1 smoke test entirely)

**Interfaces:**
- Consumes: `CuratedCanvas`, `IndexList`, `SpecSheet`, `getCuratedItem`, `SoundLink`.
- Produces: the full `/curated` experience. `<CuratedView />` reads `?item`, keeps `<CuratedCanvas>` mounted, toggles index ↔ detail.

- [ ] **Step 1: Implement CuratedView**

Create `components/curated/CuratedView.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { SoundLink } from "@/components/ui/SoundLink";
import { getCuratedItem } from "@/lib/curated";
import { IndexList } from "./IndexList";
import { SpecSheet } from "./SpecSheet";

// Canvas is WebGL — never SSR it.
const CuratedCanvas = dynamic(
  () => import("./CuratedCanvas").then((m) => m.CuratedCanvas),
  { ssr: false },
);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function CuratedView() {
  const params = useSearchParams();
  const slug = params.get("item");
  const item = getCuratedItem(slug) ?? null;
  const reducedMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Persistent canvas layer — mounted once, focuses the selected item. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <CuratedCanvas item={item} reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-6 py-16">
        <SoundLink
          href={item ? "/curated" : "/"}
          scroll={false}
          sound="click"
          on="click"
          className="inline-flex items-center gap-1.5 font-departure text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--ink-fg)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
        >
          <ArrowLeftIcon size={14} weight="regular" aria-hidden />
          {item ? "index" : "back"}
        </SoundLink>

        <h1 className="mt-8 font-departure text-lg lowercase tracking-wide text-[color:var(--ink-fg)]">
          curated / supply
        </h1>

        {item ? (
          <div className="mt-[55vh]">
            <SpecSheet item={item} />
          </div>
        ) : (
          <div className="mt-10">
            <IndexList />
          </div>
        )}
      </div>
    </main>
  );
}
```

Note on layout: on detail, the spec sheet is pushed down (`mt-[55vh]`) so the fixed canvas object reads as the hero above it; tune this spacing during visual review. The canvas `<div>` is `pointer-events-none` so list links stay clickable; the object's cursor-tilt does not depend on the canvas receiving pointer events because `DepthObject` reads a window-level pointer listener (see Task 4's `useWindowPointer`).

- [ ] **Step 2: Replace the page with the real server component**

Overwrite `app/curated/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { CuratedView } from "@/components/curated/CuratedView";

export const metadata: Metadata = {
  title: "Curated — Sarthak Verma",
  description: "A curated supply of things I own, rendered in 3D.",
};

export default function CuratedPage() {
  return (
    <Suspense fallback={null}>
      <CuratedView />
    </Suspense>
  );
}
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass. The build must NOT error on `useSearchParams()` (the `<Suspense>` boundary in `page.tsx` satisfies it).

- [ ] **Step 4: Full-flow visual verification**

Run `npm run dev`, then:
1. Open `/curated` → see the monospace index list; hovering rows plays the tick; the canvas layer is empty/transparent.
2. Click an item → URL becomes `/curated?item=<slug>`, the object appears as the hero and tilts toward the cursor, the spec sheet shows below.
3. Click `index` (back) → returns to the list; browser Back button also returns to the list.
4. Reload directly on `/curated?item=rimowa-original` → deep-links straight to that object (proves shareability).
5. Visit `/curated?item=does-not-exist` → falls back to the index list (no crash).
6. Toggle OS "reduce motion" → object renders static (no float/tilt).

- [ ] **Step 5: Commit**

```bash
git add app/curated/page.tsx components/curated/CuratedView.tsx
git commit -m "feat(curated): query-param view with persistent canvas and deep links"
```

---

### Task 8: Home entry link + final polish

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: existing home page structure (`SoundLink`, section rows).

- [ ] **Step 1: Add a discoverable link on the home page**

In `app/page.tsx`, add a `curated` entry. Simplest placement: add a row to the `experiments` section, or add a standalone line near it. Example row inside the experiments `<ul>` (or as its own `<Row>`):

```tsx
<Row
  left={<span className="text-[color:var(--ink-fg)]">curated supply</span>}
  right={
    <SoundLink href="/curated" sound="click" on="click" className={linkClass}>
      view
    </SoundLink>
  }
/>
```

Match whatever the surrounding rows already do (the file uses a `Row` component and `linkClass`). Keep copy lowercase to match the section style.

- [ ] **Step 2: Verify the link works**

Run `npm run dev`, open `/`, confirm the new `curated` line appears and navigates to `/curated`.

- [ ] **Step 3: Final full gate**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(curated): link curated supply from home"
```

---

## Self-Review

**Spec coverage:**
- Index layout (yeezy list) → Task 6 (`IndexList`) + Task 7.
- Object takeover + cursor tilt + idle float → Tasks 4, 5, 7.
- Spec-sheet-only metadata → Task 6 (`SpecSheet`).
- 2.5D depth technique (displacement + alphaTest + normal-map shading) → Tasks 3, 4.
- Depth pipeline offline, no runtime ML → Task 3.
- Query-param routing, shareable/deep-link, back button, unknown-slug fallback → Task 7.
- `useSearchParams` under `<Suspense>` → Task 7.
- Persistent canvas → Task 7 (mounted in `CuratedView`, unaffected by query change).
- Reduced-motion / no-WebGL fallback → Tasks 4, 5, 7 (`ssr:false`, reducedMotion path).
- Design-system fit (Departure Mono, ink tokens, SoundLink) → Tasks 6, 7.
- Data-driven content → Task 2.
- Home entry point → Task 8.
- Dependencies → Task 1.

**Deviations from spec (intentional, noted):**
- Added a **normal map** (Task 3) beyond the spec's depth map, so the relief catches light (displacement alone doesn't recompute normals). Strengthens the "sculptural under lighting" goal.
- `/curated` does **not** use `PageShell` (its `LeavesScene` is a `z-[999]` multiply overlay that would muddy the 3D object). Uses a bare `bg-base` shell instead. Reversible if undesired.

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `CuratedItem`, `getCuratedItem`, `depthSrc`, `normalSrc`, `curatedItems` are defined in Task 2 and consumed with matching signatures in Tasks 4–7. `<DepthObject item reducedMotion>`, `<CuratedCanvas item reducedMotion>` are consistent across definition and use.

**Open item for the implementer:** real cutout PNGs are Sarthak's to provide; Task 3 uses a synthetic sample so the pipeline is testable before real assets land. Replace `content/curated.json` entries and drop real cutouts into `public/curated/` when available, then re-run `npm run gen-depth`.
