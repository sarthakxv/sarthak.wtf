"use client";

import { SoundLink } from "@/components/ui/SoundLink";
import { curatedItems } from "@/lib/curated";

export function IndexList() {
  return (
    <ul className="font-departure text-sm">
      {curatedItems.map((item) => (
        <li key={item.slug}>
          <SoundLink
            href={`/curated?item=${item.slug}`}
            scroll={false}
            className="group flex items-baseline gap-4 py-2 text-[color:var(--ink-mid)] hover:text-[color:var(--ink-fg)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
          >
            <span className="tabular-nums text-[color:var(--ink-soft)]">{item.code}</span>
            <span className="flex-1 uppercase tracking-wide">{item.name}</span>
            <span className="tabular-nums text-[color:var(--ink-soft)]">{item.acquired}</span>
          </SoundLink>
        </li>
      ))}
    </ul>
  );
}
