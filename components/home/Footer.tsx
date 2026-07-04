"use client";

import { useEffect, useState } from "react";
import { useIndiaClock } from "@/hooks/useIndiaClock";
import { ScrambledText } from "@/components/ui/ScrambledText";

const LOOP_LINES = ["© {YEAR} Sarthak.", "stay curious and keep building."];
const LOOP_MS = 3500;

function TextLoop() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LOOP_LINES.length), LOOP_MS);
    return () => clearInterval(id);
  }, []);
  const year = new Date().getFullYear();
  return (
    <span
      key={idx}
      className="inline-block animate-[footer-fade_320ms_ease-out]"
      style={{ minWidth: "16ch" }}
      suppressHydrationWarning
    >
      {LOOP_LINES[idx].replace("{YEAR}", String(year))}
    </span>
  );
}

export function Footer() {
  const time = useIndiaClock();
  return (
    <footer
      className="mt-24 border-t border-(--color-line) py-4 flex items-center justify-between text-xs text-(--color-mid)"
      aria-label="Footer"
    >
      <TextLoop />
      <span suppressHydrationWarning className="font-departure tabular-nums">
        {time ? (
          <ScrambledText>{`${time} · india`}</ScrambledText>
        ) : (
          "india"
        )}
      </span>
      <style jsx global>{`
        @keyframes footer-fade {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}
