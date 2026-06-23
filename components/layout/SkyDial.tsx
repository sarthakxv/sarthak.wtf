"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sun,
  Moon,
  MoonStars,
  SunHorizon,
  CloudSun,
  type Icon,
} from "@phosphor-icons/react";
import { SKY_PRESETS, useSky } from "./TimeOfDayBg";

function iconForHour(h: number): Icon {
  if (h < 5 || h >= 22) return MoonStars;
  if (h < 7.5) return SunHorizon;
  if (h < 11) return CloudSun;
  if (h < 17) return Sun;
  if (h < 19.5) return SunHorizon;
  if (h < 21.5) return Moon;
  return MoonStars;
}

const PRESET_ICONS: Icon[] = [
  MoonStars,
  SunHorizon,
  CloudSun,
  Sun,
  Sun,
  SunHorizon,
  Moon,
  MoonStars,
];

const N = SKY_PRESETS.length; // 8 presets; slot N == "Live"

export function SkyDial({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (hour: number | null) => void;
}) {
  const sky = useSky();
  const scaleRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  // Resolve slot: 0..N-1 = preset index, N = Live
  let slot = N;
  if (value !== null) {
    const idx = SKY_PRESETS.findIndex((p) => Math.abs(p.hour - value) < 0.01);
    slot = idx >= 0 ? idx : N;
  }
  const isLive = slot === N;
  const pct = (slot / N) * 100;

  const ActiveIcon = isLive ? iconForHour(sky.hour) : PRESET_ICONS[slot] ?? Sun;
  const label = isLive ? "Live" : SKY_PRESETS[slot].label;

  const setSlot = useCallback(
    (s: number) => {
      const clamped = Math.max(0, Math.min(N, s));
      if (clamped >= N) onChange(null);
      else onChange(SKY_PRESETS[clamped].hour);
    },
    [onChange],
  );

  const indexFromClientX = useCallback((clientX: number): number => {
    const el = scaleRef.current;
    if (!el) return slot;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return slot;
    const raw = (clientX - rect.left) / rect.width;
    return Math.round(Math.max(0, Math.min(1, raw)) * N);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => setSlot(indexFromClientX(e.clientX));
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, setSlot, indexFromClientX]);

  const bright = sky.bright;
  const pillClass = bright
    ? "bg-white/30 border-black/15 text-zinc-900"
    : "bg-black/30 border-white/15 text-zinc-100";
  const tickClass = bright ? "bg-zinc-900/30" : "bg-white/30";
  const railClass = bright ? "bg-zinc-900/15" : "bg-white/15";
  const indicatorClass = bright ? "bg-zinc-900" : "bg-zinc-200";

  return (
    <div
      className={`fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md transition-colors duration-300 ${pillClass}`}
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <button
        type="button"
        aria-label={`Sky preview, currently ${label}. Click to return to live time.`}
        onClick={() => onChange(null)}
        className="flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <ActiveIcon size={16} weight="fill" />
      </button>
      <div
        ref={scaleRef}
        role="slider"
        aria-label="Sky time"
        aria-valuemin={0}
        aria-valuemax={N}
        aria-valuenow={slot}
        aria-valuetext={label}
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.button !== 0 && e.pointerType === "mouse") return;
          setDragging(true);
          setSlot(indexFromClientX(e.clientX));
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            setSlot(slot - 1);
            e.preventDefault();
          } else if (e.key === "ArrowRight") {
            setSlot(slot + 1);
            e.preventDefault();
          } else if (e.key === "Home") {
            setSlot(0);
            e.preventDefault();
          } else if (e.key === "End") {
            setSlot(N);
            e.preventDefault();
          }
        }}
        className="relative h-5 w-32 cursor-pointer touch-none select-none focus-visible:outline-none"
      >
        <div className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 ${railClass}`} />
        <div className="absolute inset-0 flex items-center justify-between">
          {SKY_PRESETS.map((p, i) => (
            <span
              key={p.label}
              className={`h-1.5 w-px ${tickClass}`}
              data-i={i}
              aria-hidden
            />
          ))}
          {/* live tick on the far right */}
          <span className={`h-1.5 w-px ${tickClass}`} aria-hidden />
        </div>
        <span
          aria-hidden
          className={`absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-200 ease-out ${indicatorClass}`}
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="ml-1 text-[10px] uppercase tracking-wider opacity-60 tabular-nums w-14 text-right">
        {label}
      </span>
    </div>
  );
}
