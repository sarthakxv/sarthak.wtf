"use client";

import { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { playTick } from "@/lib/sound";

type CommitDay = {
  date: string; // YYYY-MM-DD
  count: number;
  topRepo?: string | null;
};

const REPO_NAME = "portfolio";

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDays(): CommitDay[] {
  const rng = mulberry32(7);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 30 }, (_, i) => {
    const dayOffset = 29 - i;
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const r = rng();
    const count = r < 0.35 ? 0 : Math.min(4, Math.floor(r * 5));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return { date: `${yyyy}-${mm}-${dd}`, count };
  });
}

function levelClass(count: number): string {
  switch (count) {
    case 0:
      return "bg-neutral-200/80";
    case 1:
      return "bg-green-300";
    case 2:
      return "bg-green-500";
    case 3:
      return "bg-green-600";
    default:
      return "bg-green-700";
  }
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(dt);
}

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export function CommitGraph() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [offsets, setOffsets] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fallbackRef = useRef<CommitDay[]>([]);
  if (fallbackRef.current.length === 0) fallbackRef.current = buildDays();
  const [days, setDays] = useState<CommitDay[]>(fallbackRef.current);
  const [source, setSource] = useState<"fallback" | "github">("fallback");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commits", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json || !Array.isArray(json.days)) return;
        // Only switch over if GitHub actually returned data and at least one
        // day has activity — otherwise keep the seeded fallback so the graph
        // isn't a flat row of empty bars.
        const sum = json.days.reduce(
          (s: number, d: CommitDay) => s + (d.count ?? 0),
          0,
        );
        if (json.source === "github" && sum > 0) {
          setDays(json.days as CommitDay[]);
          setSource("github");
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = useMemo(
    () => days.reduce((sum, d) => sum + d.count, 0),
    [days]
  );

  useEffect(() => {
    if (reduced) {
      setMounted(true);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  // Clamp tooltip horizontal offsets so edge tooltips don't overflow the row.
  useLayoutEffect(() => {
    if (!mounted) return;
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const cw = container.getBoundingClientRect().width;
      const next = days.map((_, i) => {
        const tip = tooltipRefs.current[i];
        const bar = container.children[i] as HTMLElement | undefined;
        if (!tip || !bar) return 0;
        const tipW = tip.offsetWidth;
        const barCenter = bar.offsetLeft + bar.offsetWidth / 2;
        const left = barCenter - tipW / 2;
        const right = barCenter + tipW / 2;
        if (left < 0) return -left;
        if (right > cw) return cw - right;
        return 0;
      });
      setOffsets(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [mounted, days]);

  const handleEnter = useCallback(
    (i: number) => {
      setHovered((prev) => {
        if (prev === i) return prev;
        if (!reduced) playTick();
        return i;
      });
    },
    [reduced]
  );

  const handleLeave = useCallback(() => {
    setHovered(null);
  }, []);

  return (
    <section className="mt-6 flex flex-col gap-3">
      <div ref={containerRef} className="relative flex gap-[3px]">
        {days.map((day, i) => {
          const isHovered = hovered === i;
          const offset = offsets[i] ?? 0;
          return (
            <div
              key={day.date}
              className="relative flex-1 group h-5 flex items-center"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            >
              <div
                className={`w-full rounded-[3px] ${levelClass(day.count)}`}
                style={{
                  height: 20,
                  transform: mounted
                    ? isHovered
                      ? "scaleY(1.6) translateY(-2px)"
                      : "scaleY(1)"
                    : "scaleY(0)",
                  transformOrigin: "center bottom",
                  transition: reduced
                    ? "none"
                    : mounted
                    ? `transform 220ms ${SPRING}`
                    : `transform 400ms ${SPRING} ${i * 20}ms`,
                }}
              />
              <div
                ref={(el) => {
                  tooltipRefs.current[i] = el;
                }}
                className="absolute bottom-full left-1/2 mb-2 z-50 pointer-events-none"
                style={{
                  transform: `translateX(calc(-50% + ${offset}px))`,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              >
                <div className="bg-neutral-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                  <p>{formatDate(day.date)}</p>
                  {day.count > 0 ? (
                    <p className="text-neutral-300">
                      {day.count} commit{day.count !== 1 ? "s" : ""} ·{" "}
                      <span className="text-neutral-400">
                        {day.topRepo ?? REPO_NAME}
                      </span>
                    </p>
                  ) : (
                    <p className="text-neutral-400">No commits</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 inline-flex items-center gap-1.5">
          Last 30 days
          {source === "github" && (
            <a
              href="https://github.com/sarthakxv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-emerald-600 hover:text-emerald-700"
              aria-label="View sarthakxv on GitHub"
              title="Live from github.com/sarthakxv"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              live
            </a>
          )}
        </span>
        <span className="text-xs text-neutral-500 tabular-nums">
          {total} commit{total !== 1 ? "s" : ""}
        </span>
      </div>
    </section>
  );
}
