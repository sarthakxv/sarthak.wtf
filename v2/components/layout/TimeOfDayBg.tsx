"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ---------- types ----------
export type Stop = [number, string];
export type Glow = { x: string; y: string; color: string; size: string };
export type Palette = { h?: number; bright: boolean; stops: Stop[]; glow: Glow | null };
export type SkyPreset = { label: string; hour: number };
export type SkyState = { bright: boolean; bg: string; hour: number; label: string };

// ---------- palettes ----------
export const PALETTES: (Palette & { h: number })[] = [
  {
    h: 4,
    bright: false,
    stops: [
      [0, "#070b1a"],
      [40, "#101938"],
      [75, "#1f2546"],
      [100, "#2a2c4a"],
    ],
    glow: null,
  },
  {
    h: 6.5,
    bright: true,
    stops: [
      [0, "#3a5187"],
      [30, "#6a6a9a"],
      [55, "#d18a5a"],
      [78, "#d9663d"],
      [100, "#a8412a"],
    ],
    glow: { x: "50%", y: "78%", color: "rgba(255, 196, 130, 0.55)", size: "70% 55%" },
  },
  {
    h: 10,
    bright: true,
    stops: [
      [0, "#2b67a8"],
      [30, "#5d92c8"],
      [60, "#a8c4dc"],
      [85, "#dcd0c0"],
      [100, "#e5cdb2"],
    ],
    glow: { x: "50%", y: "92%", color: "rgba(255, 230, 200, 0.40)", size: "80% 50%" },
  },
  {
    h: 13,
    bright: true,
    stops: [
      [0, "#1e4d92"],
      [35, "#5588c2"],
      [65, "#9cc0e0"],
      [88, "#d4e3ee"],
      [100, "#e8ecef"],
    ],
    glow: { x: "50%", y: "92%", color: "rgba(255, 248, 230, 0.32)", size: "85% 45%" },
  },
  {
    h: 16,
    bright: true,
    stops: [
      [0, "#3a5f95"],
      [32, "#7187b0"],
      [60, "#c89a78"],
      [82, "#dba070"],
      [100, "#c97a52"],
    ],
    glow: { x: "25%", y: "82%", color: "rgba(255, 200, 130, 0.55)", size: "60% 55%" },
  },
  {
    h: 18.5,
    bright: true,
    stops: [
      [0, "#2a3b6e"],
      [28, "#5d4a78"],
      [55, "#c66747"],
      [78, "#c84d2c"],
      [100, "#8f2e1c"],
    ],
    glow: { x: "50%", y: "75%", color: "rgba(255, 160, 90, 0.55)", size: "75% 55%" },
  },
  {
    h: 20,
    bright: false,
    stops: [
      [0, "#0e1230"],
      [35, "#27224a"],
      [65, "#48305c"],
      [88, "#5a325a"],
      [100, "#532e4e"],
    ],
    glow: { x: "70%", y: "85%", color: "rgba(180, 90, 130, 0.30)", size: "60% 50%" },
  },
  {
    h: 22.5,
    bright: false,
    stops: [
      [0, "#02050d"],
      [50, "#0a1126"],
      [100, "#131a38"],
    ],
    glow: null,
  },
  {
    h: 24,
    bright: false,
    stops: [
      [0, "#070b1a"],
      [40, "#101938"],
      [75, "#1f2546"],
      [100, "#2a2c4a"],
    ],
    glow: null,
  },
];

export const SKY_PRESETS: SkyPreset[] = [
  { label: "Pre-dawn", hour: 4 },
  { label: "Sunrise", hour: 6.5 },
  { label: "Morning", hour: 10 },
  { label: "Midday", hour: 13 },
  { label: "Afternoon", hour: 16 },
  { label: "Sunset", hour: 18.5 },
  { label: "Dusk", hour: 20 },
  { label: "Night", hour: 22.5 },
];

// ---------- color interpolation ----------
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"),
      )
      .join("")
  );
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function lerpHex(a: string, b: string, t: number): string {
  return rgbToHex(lerpRgb(hexToRgb(a), hexToRgb(b), t));
}

function parseRgba(str: string): [number, number, number, number] | null {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 3) return [parts[0], parts[1], parts[2], 1];
  if (parts.length === 4) return [parts[0], parts[1], parts[2], parts[3]];
  return null;
}
function rgbaStr([r, g, b, a]: [number, number, number, number]): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
}
function lerpRgba(a: string, b: string, t: number): string {
  const ra = parseRgba(a);
  const rb = parseRgba(b);
  if (!ra || !rb) return t < 0.5 ? a : b;
  return rgbaStr([
    lerp(ra[0], rb[0], t),
    lerp(ra[1], rb[1], t),
    lerp(ra[2], rb[2], t),
    lerp(ra[3], rb[3], t),
  ]);
}

// ---------- palette resolution ----------
export function paletteForHour(h: number): Palette {
  for (let i = 0; i < PALETTES.length - 1; i++) {
    const a = PALETTES[i];
    const b = PALETTES[i + 1];
    if (h >= a.h && h <= b.h) {
      const t = (h - a.h) / (b.h - a.h);
      const bright = t < 0.5 ? a.bright : b.bright;

      const offsets = Array.from(
        new Set([...a.stops.map((s) => s[0]), ...b.stops.map((s) => s[0])]),
      ).sort((x, y) => x - y);

      const sampleAt = (stops: Stop[], off: number): string => {
        for (let j = 0; j < stops.length - 1; j++) {
          const [o1, c1] = stops[j];
          const [o2, c2] = stops[j + 1];
          if (off >= o1 && off <= o2) {
            const tt = (off - o1) / Math.max(o2 - o1, 0.0001);
            return lerpHex(c1, c2, tt);
          }
        }
        return stops[off < stops[0][0] ? 0 : stops.length - 1][1];
      };

      const stops: Stop[] = offsets.map((off) => [
        off,
        lerpHex(sampleAt(a.stops, off), sampleAt(b.stops, off), t),
      ]);

      let glow: Glow | null = null;
      if (a.glow && b.glow) {
        glow = {
          x: a.glow.x,
          y: a.glow.y,
          color: lerpRgba(a.glow.color, b.glow.color, t),
          size: a.glow.size,
        };
        if (t > 0.5) {
          glow.x = b.glow.x;
          glow.y = b.glow.y;
          glow.size = b.glow.size;
        }
      } else if (a.glow && !b.glow) {
        const fade = lerpRgba(a.glow.color, a.glow.color.replace(/[\d.]+\)/, "0)"), t);
        glow = { ...a.glow, color: fade };
      } else if (!a.glow && b.glow) {
        const fade = lerpRgba(b.glow.color.replace(/[\d.]+\)/, "0)"), b.glow.color, t);
        glow = { ...b.glow, color: fade };
      }

      return { bright, stops, glow };
    }
  }
  return PALETTES[0];
}

export function gradientFromStops(stops: Stop[]): string {
  return `linear-gradient(to bottom, ${stops.map(([o, c]) => `${c} ${o}%`).join(", ")})`;
}

export function backgroundFor(palette: Palette): string {
  const layers: string[] = [];
  if (palette.glow) {
    layers.push(
      `radial-gradient(ellipse ${palette.glow.size} at ${palette.glow.x} ${palette.glow.y}, ${palette.glow.color}, transparent 70%)`,
    );
  }
  layers.push(gradientFromStops(palette.stops));
  return layers.join(", ");
}

export function currentHour(): number {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

function labelForHour(h: number): string {
  let best = SKY_PRESETS[0];
  let bestDist = Math.abs(h - best.hour);
  for (const p of SKY_PRESETS) {
    const d = Math.abs(h - p.hour);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best.label;
}

// ---------- context ----------
const DEFAULT_STATE: SkyState = {
  bright: false,
  bg: "#000000",
  hour: 0,
  label: "Night",
};

const SkyContext = createContext<SkyState>(DEFAULT_STATE);

export function useSky(): SkyState {
  return useContext(SkyContext);
}

export function TimeOfDayBg({
  children,
  overrideHour,
}: {
  children: ReactNode;
  overrideHour?: number | null;
}) {
  const [hour, setHour] = useState<number>(() =>
    typeof overrideHour === "number" ? overrideHour : 12,
  );

  useEffect(() => {
    if (typeof overrideHour === "number") {
      setHour(overrideHour);
      return;
    }
    setHour(currentHour());
    const id = window.setInterval(() => {
      setHour(currentHour());
    }, 60_000);
    return () => window.clearInterval(id);
  }, [overrideHour]);

  const state: SkyState = useMemo(() => {
    const h = typeof overrideHour === "number" ? overrideHour : hour;
    const palette = paletteForHour(h);
    return {
      bright: palette.bright,
      bg: backgroundFor(palette),
      hour: h,
      label: labelForHour(h),
    };
  }, [hour, overrideHour]);

  return (
    <SkyContext.Provider value={state}>
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: state.bg,
          transition: "background 1.5s ease-out",
        }}
      />
      {children}
    </SkyContext.Provider>
  );
}
