"use client";

import { useEffect, useRef, useState } from "react";

const PARAMS: Array<[number, number]> = [
  [3, 2], [1, 2], [3, 4], [1, 3], [2, 3], [2, 5], [5, 4],
  [4, 3], [3, 5], [1, 4], [4, 5], [2, 7], [5, 2], [3, 7],
];

function lissajousPath(a: number, b: number, delta: number, size: number, samples = 220) {
  const r = size / 2 - 2;
  const c = size / 2;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const x = c + r * Math.sin(a * t + delta);
    const y = c + r * Math.sin(b * t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d;
}

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
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const speed = hoveredRef.current ? 1.1 : 0.32;
      setPhase(((now - start) / 1000) * speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stagger = hovered ? 0.85 : 0.42;
  const strokeWidth = hovered ? 1.6 : 1.25;

  return (
    <div
      aria-label={name}
      role="img"
      title={name}
      className="inline-flex items-center cursor-pointer"
      style={{ gap }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {chars.map((_, i) => {
        const [a, b] = PARAMS[i % PARAMS.length];
        const dim = hovered && i >= 2;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-[stroke-width,color] duration-200"
            style={{ color: dim ? "#a1a1aa" : undefined }}
            aria-hidden
          >
            <path d={lissajousPath(a, b, phase + i * stagger, size)} />
          </svg>
        );
      })}
    </div>
  );
}
