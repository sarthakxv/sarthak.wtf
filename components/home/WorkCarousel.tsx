"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { playClick } from "@/lib/sound";

export type WorkItem = {
  title: string;
  role: string;
  period: string;
  summary: string;
  image: string;
  link: string;
};

const ADVANCE_MS = 4000;
const EXIT_ANIM = "push-down-out 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards";

type Layer = {
  key: number;
  item: WorkItem;
  exiting: boolean;
};

export function WorkCarousel({ items }: { items: WorkItem[] }) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [exitingKey, setExitingKey] = useState<number | null>(null);
  const keyRef = useRef(0);
  const layersRef = useRef<Layer[]>([
    { key: keyRef.current++, item: items[0], exiting: false },
    { key: keyRef.current++, item: items[1 % items.length], exiting: false },
  ]);
  const [, force] = useState(0);

  const advance = useCallback(() => {
    const nextIdx = (idx + 1) % items.length;
    const newIdx = (nextIdx + 1) % items.length;
    if (reduced) {
      layersRef.current = [
        { key: keyRef.current++, item: items[nextIdx], exiting: false },
        { key: keyRef.current++, item: items[newIdx], exiting: false },
      ];
      setIdx(nextIdx);
      force((n) => n + 1);
      return;
    }
    const layers = layersRef.current;
    const exiting = { ...layers[0], exiting: true };
    const incoming = { ...layers[1], exiting: false };
    const newBottom = {
      key: keyRef.current++,
      item: items[newIdx],
      exiting: false,
    };
    layersRef.current = [exiting, incoming, newBottom];
    setExitingKey(exiting.key);
    setIdx(nextIdx);
    force((n) => n + 1);
  }, [idx, items, reduced]);

  useEffect(() => {
    const t = setInterval(advance, ADVANCE_MS);
    return () => clearInterval(t);
  }, [advance]);

  const handleAnimEnd = (key: number) => {
    if (key !== exitingKey) return;
    layersRef.current = layersRef.current.filter((l) => l.key !== key);
    setExitingKey(null);
    force((n) => n + 1);
  };

  const layers = layersRef.current;

  return (
    <div
      className="group/card relative w-full aspect-video rounded-[8px] overflow-hidden bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300"
      style={{ isolation: "isolate", transform: "translateZ(0)" }}
    >
      {layers.map((layer, i) => {
        const zIndex = layers.length - 1 - i;
        const isQueued = i === layers.length - 1 && layers.length > 2;
        return (
          <div
            key={layer.key}
            className="absolute inset-0"
            style={{
              zIndex,
              opacity: isQueued ? 0 : 1,
              willChange: "transform",
              animation: layer.exiting && !reduced ? EXIT_ANIM : undefined,
            }}
            onAnimationEnd={() => handleAnimEnd(layer.key)}
          >
            <div className="absolute inset-0 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layer.item.image}
                alt={layer.item.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
              />
            </div>
          </div>
        );
      })}

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <Link
          href="/work"
          onClick={() => playClick()}
          className="px-3.5 py-1.5 rounded-full text-sm font-medium text-white backdrop-blur-md bg-black/20 border border-white/15 shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-black/30 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          View work
        </Link>
      </div>
    </div>
  );
}
