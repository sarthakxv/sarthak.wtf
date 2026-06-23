"use client";

import type { ReactNode } from "react";
import { playTick } from "@/lib/sound";

export function SimpleRow({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <li
      onMouseEnter={() => playTick()}
      className="flex justify-between items-baseline gap-4 py-1 px-2 -mx-2 text-sm rounded-md hover:bg-zinc-900/[0.04] transition-colors duration-150"
    >
      <span className="text-[color:var(--ink-fg)]">{left}</span>
      <span className="text-[color:var(--ink-soft)] tabular-nums shrink-0">
        {right}
      </span>
    </li>
  );
}
