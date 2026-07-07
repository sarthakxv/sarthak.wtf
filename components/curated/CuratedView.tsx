"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { SoundLink } from "@/components/ui/SoundLink";
import { getCuratedItem } from "@/lib/curated";
import { IndexList } from "./IndexList";
import { SpecSheet } from "./SpecSheet";

// Canvas is WebGL — never SSR it.
const CuratedCanvas = dynamic(
  () => import("./CuratedCanvas").then((m) => m.CuratedCanvas),
  { ssr: false },
);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function CuratedView() {
  const params = useSearchParams();
  const slug = params.get("item");
  const item = getCuratedItem(slug) ?? null;
  const reducedMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Persistent canvas layer — mounted once, focuses the selected item. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <CuratedCanvas item={item} reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-6 py-16">
        <SoundLink
          href={item ? "/curated" : "/"}
          scroll={false}
          sound="click"
          on="click"
          className="inline-flex items-center gap-1.5 font-departure text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--ink-fg)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
        >
          <ArrowLeftIcon size={14} weight="regular" aria-hidden />
          {item ? "index" : "back"}
        </SoundLink>

        <h1 className="mt-8 font-departure text-lg lowercase tracking-wide text-[color:var(--ink-fg)]">
          curated / supply
        </h1>

        {item ? (
          <div className="mt-[55vh]">
            <SpecSheet item={item} />
          </div>
        ) : (
          <div className="mt-10">
            <IndexList />
          </div>
        )}
      </div>
    </main>
  );
}
