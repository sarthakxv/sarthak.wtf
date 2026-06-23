"use client";

import { useEffect, useRef } from "react";

interface DitherWavesProps {
  analyser: AnalyserNode | null;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const W = 480;
const H = 270;
// Push bands to viewport edges so the center stays readable.
const BAND_Y = [0.08, 0.92];
const BAND_AMP = 18;
const FALLOFF = 6; // thinner bands

export function DitherWaves({ analyser }: DitherWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const imageData = ctx.createImageData(W, H);
    const pixels = imageData.data;

    const timeDomain = new Uint8Array(
      analyser ? analyser.fftSize : 2048,
    );

    // pre-allocate per-band curves: for each x in 0..W-1, the y of the curve
    const curves: Float32Array[] = BAND_Y.map(() => new Float32Array(W));

    let rafId: number | null = null;
    let startTs = performance.now();

    const sampleCurves = (now: number) => {
      if (analyser) {
        analyser.getByteTimeDomainData(timeDomain);
        const N = timeDomain.length;
        for (let bi = 0; bi < BAND_Y.length; bi++) {
          const baseY = BAND_Y[bi] * H;
          const curve = curves[bi];
          for (let x = 0; x < W; x++) {
            // sample the time-domain at this x with a per-band phase offset
            const idx =
              Math.floor((x / W) * N + bi * (N / BAND_Y.length / 3)) % N;
            const v = (timeDomain[idx] - 128) / 128; // -1..1
            curve[x] = baseY + v * BAND_AMP;
          }
        }
      } else {
        // ambient silent flow
        const t = (now - startTs) / 1000;
        for (let bi = 0; bi < BAND_Y.length; bi++) {
          const baseY = BAND_Y[bi] * H;
          const curve = curves[bi];
          const phase = t * (0.4 + bi * 0.13) + bi * 1.7;
          for (let x = 0; x < W; x++) {
            const u = (x / W) * Math.PI * 2;
            const v =
              Math.sin(u * 1.5 + phase) * 0.5 +
              Math.sin(u * 3 + phase * 1.3) * 0.25;
            curve[x] = baseY + v * (BAND_AMP * 0.35);
          }
        }
      }
    };

    const render = (now: number) => {
      sampleCurves(now);

      // clear to transparent
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      }

      for (let y = 0; y < H; y++) {
        const bayerRow = BAYER_4X4[y % 4];
        // vertical vignette: full at top/bottom, 0 across the middle band
        const ny = y / H;
        const yEdge = Math.min(ny, 1 - ny); // 0 at edges, 0.5 at center
        const yMask = Math.max(0, 1 - yEdge / 0.18); // ~18% from edges fades to 0
        if (yMask <= 0) continue;
        for (let x = 0; x < W; x++) {
          // horizontal vignette so dither hugs left/right edges, center stays clean
          const nx = x / W;
          const xEdge = Math.min(nx, 1 - nx);
          const xMask = Math.max(0, 1 - xEdge / 0.32);
          // nearest distance to any band curve at this x
          let minDist = Infinity;
          for (let bi = 0; bi < BAND_Y.length; bi++) {
            const cy = curves[bi][x];
            const d = Math.abs(y - cy);
            if (d < minDist) minDist = d;
          }
          const fillRaw = Math.max(0, 1 - minDist / FALLOFF);
          // combine the two vignettes — multiplying yMask * max(xMask, 0.4)
          // keeps a hint of edge dither all along the top/bottom strips
          const fill = fillRaw * yMask * Math.max(xMask, 0.4);
          if (fill <= 0) continue;
          const threshold = bayerRow[x % 4] / 16;
          if (fill > threshold) {
            const idx = (y * W + x) * 4;
            pixels[idx] = 0;
            pixels[idx + 1] = 0;
            pixels[idx + 2] = 0;
            pixels[idx + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    if (reduced) {
      render(performance.now());
      return () => {
        /* nothing to clean */
      };
    }

    const loop = (now: number) => {
      render(now);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-hidden
      aria-label="ditherwaves canvas"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.22,
        imageRendering: "pixelated",
      }}
    />
  );
}
