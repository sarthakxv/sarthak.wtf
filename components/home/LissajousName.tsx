"use client";

import { useState } from "react";

/**
 * Single-stroke letter outlines in a unit box (x right, y down).
 * Each is one continuous polyline — pen-lift letters (A, H, K, R, T) retrace a
 * leg to stay in one stroke, which reads as natural signature travel once the
 * Fourier pass rounds it off. Only the six glyphs in "SARTHAK" are defined.
 */
const GLYPHS: Record<string, Array<[number, number]>> = {
  S: [
    [0.80, 0.20], [0.62, 0.10], [0.40, 0.10], [0.24, 0.20], [0.24, 0.34],
    [0.40, 0.44], [0.60, 0.50], [0.76, 0.60], [0.76, 0.78], [0.60, 0.90],
    [0.38, 0.90], [0.20, 0.80],
  ],
  A: [
    [0.12, 0.90], [0.31, 0.50], [0.50, 0.10], [0.69, 0.50], [0.88, 0.90],
    [0.747, 0.62], [0.253, 0.62],
  ],
  R: [
    [0.22, 0.90], [0.22, 0.50], [0.22, 0.10], [0.54, 0.10], [0.74, 0.22],
    [0.60, 0.42], [0.30, 0.48], [0.22, 0.48], [0.50, 0.68], [0.80, 0.90],
  ],
  T: [
    [0.15, 0.12], [0.50, 0.12], [0.85, 0.12], [0.50, 0.12], [0.50, 0.50],
    [0.50, 0.90],
  ],
  H: [
    [0.22, 0.10], [0.22, 0.90], [0.22, 0.50], [0.78, 0.50], [0.78, 0.10],
    [0.78, 0.90],
  ],
  K: [
    [0.22, 0.10], [0.22, 0.90], [0.22, 0.50], [0.78, 0.10], [0.22, 0.50],
    [0.78, 0.90],
  ],
};

const HARMONICS = 32; // Fourier terms kept each side — higher = crisper letters
// (push much past this and Gibbs ringing near stroke cusps makes horizontals wavier, not cleaner)
const SAMPLES = 256; // DFT input resolution
const OUTPUT = 200; // points in the rendered forward-half trace
const VB = 100; // viewBox size; paths are size-independent
const MARGIN = 12; // inset within the viewBox

type Point = [number, number];
type Coeff = { freq: number; re: number; im: number };

/** Resample a polyline to `n` points spaced evenly by arc length. */
function resample(points: Point[], n: number): Point[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1];
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    let s = 1;
    while (s < cum.length - 1 && cum[s] < target) s++;
    const span = cum[s] - cum[s - 1];
    const f = span > 0 ? (target - cum[s - 1]) / span : 0;
    out.push([
      points[s - 1][0] + f * (points[s][0] - points[s - 1][0]),
      points[s - 1][1] + f * (points[s][1] - points[s - 1][1]),
    ]);
  }
  return out;
}

/** Discrete Fourier transform of a complex loop, keeping low harmonics only. */
function dft(loop: Point[], keep: number): Coeff[] {
  const N = loop.length;
  const out: Coeff[] = [];
  for (let k = 0; k < N; k++) {
    const freq = k <= N / 2 ? k : k - N; // map upper half to negative frequencies
    if (Math.abs(freq) > keep) continue;
    let re = 0;
    let im = 0;
    for (let j = 0; j < N; j++) {
      const ang = (-2 * Math.PI * k * j) / N;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      re += loop[j][0] * cos - loop[j][1] * sin;
      im += loop[j][0] * sin + loop[j][1] * cos;
    }
    out.push({ freq, re: re / N, im: im / N });
  }
  return out;
}

/**
 * Build the SVG path for one glyph: trace it out-and-back into a closed loop,
 * take its truncated Fourier series, then reconstruct only the forward half —
 * i.e. the letter drawn once, smoothed by the dropped high harmonics.
 */
function buildPath(points: Point[]): string {
  const middle = points.slice(1, -1).reverse();
  const loop = resample([...points, ...middle], SAMPLES);
  const coeffs = dft(loop, HARMONICS);
  let d = "";
  for (let i = 0; i <= OUTPUT; i++) {
    const t = (i / OUTPUT) * 0.5; // forward half of the period
    let re = 0;
    let im = 0;
    for (const c of coeffs) {
      const ang = 2 * Math.PI * c.freq * t;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      re += c.re * cos - c.im * sin;
      im += c.re * sin + c.im * cos;
    }
    const x = MARGIN + re * (VB - MARGIN * 2);
    const y = MARGIN + im * (VB - MARGIN * 2);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d;
}

// Precompute one path per unique glyph at module load (pure, SSR-safe).
const PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(GLYPHS).map(([ch, pts]) => [ch, buildPath(pts)]),
);

export function LissajousName({
  name,
  size = 40,
  gap = 8,
}: {
  name: string;
  size?: number;
  gap?: number;
}) {
  const chars = Array.from(name);
  // Bumping this remounts the glyphs, restarting the draw on each hover.
  const [replay, setReplay] = useState(0);

  return (
    <div
      aria-label={name}
      role="img"
      title={name}
      className="inline-flex items-center cursor-pointer"
      style={{ gap }}
      onMouseEnter={() => setReplay((r) => r + 1)}
    >
      {chars.map((ch, i) => {
        const d = PATHS[ch.toUpperCase()];
        if (!d) {
          return <span key={i} aria-hidden style={{ width: size, height: size }} />;
        }
        return (
          <svg
            key={`${replay}-${i}`}
            width={size}
            height={size}
            viewBox={`0 0 ${VB} ${VB}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lissajous-letter"
            aria-hidden
          >
            <path
              d={d}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          </svg>
        );
      })}
    </div>
  );
}
