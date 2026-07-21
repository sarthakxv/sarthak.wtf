"use client";

import { useState } from "react";
import { SIGNATURE_PATHS, SIGNATURE_VIEWBOX } from "./signaturePaths";

/**
 * The signature's four strokes, drawn on in sequence like live handwriting;
 * as each stroke's outline finishes tracing, its ink floods in (the paths
 * are filled ink outlines, so fill — not stroke — is the finished look).
 * WEIGHTS are each stroke's share of the total arc length (precomputed from
 * the path data; they sum to 1), so long strokes take proportionally longer
 * and each stroke starts as the previous one ends.
 * WEIGHTS must stay in sync with SIGNATURE_PATHS; unknown strokes fall back
 * to the MIN_DRAW_S floor.
 */
const WEIGHTS = [0.188, 0.309, 0.497, 0.006];
const TOTAL_DRAW_S = 1.8;
const MIN_DRAW_S = 0.08; // floor so the final i-dot registers as a stroke
const FILL_FADE_S = 0.4; // ink flood-in once a stroke is mostly traced
const FILL_START = 0.7; // fill begins at this fraction of the stroke's draw

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
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        aria-hidden
      >
        {SIGNATURE_PATHS.map((d, i) => {
          const duration = Math.max((WEIGHTS[i] ?? 0) * TOTAL_DRAW_S, MIN_DRAW_S);
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
                animationDuration: `${duration}s, ${FILL_FADE_S}s`,
                animationDelay: `${delay}s, ${delay + duration * FILL_START}s`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
