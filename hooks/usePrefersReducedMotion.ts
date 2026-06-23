"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting and stays in sync as it
 * changes. Returns `false` until mounted (SSR-safe default).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
