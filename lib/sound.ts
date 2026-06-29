"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defineSound, ensureReady } from "@web-kits/audio";

const MUTE_KEY = "sarthak.muted";
const MUTE_EVENT = "sarthak-muted-change";

// --- mute state ---------------------------------------------------------

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setMuted(v: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, v ? "true" : "false");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: v }));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- sound definitions via @web-kits/audio ------------------------------

// Tick: sine sweep 800Hz → 300Hz over ~15ms, gain ~0.06. Mimics Charles's tick.
const tickVoice = defineSound({
  source: { type: "sine", frequency: { start: 800, end: 300 } },
  envelope: { attack: 0, decay: 0.018 },
  gain: 0.06,
});

// Click: a soft "pebble drop" — quick sine fall from mid-high to a low,
// short tail. Tuned to sit well under the eye: distinctly tactile but
// not chirpy. Lower gain than tick so repeated clicks don't fatigue.
const clickVoice = defineSound({
  source: { type: "sine", frequency: { start: 1100, end: 420 } },
  envelope: { attack: 0.001, decay: 0.05, release: 0.03 },
  gain: 0.022,
});

let unlocked = false;

function unlock() {
  if (unlocked) return;
  unlocked = true;
  // Fire-and-forget; resolves once the AudioContext is running.
  ensureReady().catch(() => {
    unlocked = false;
  });
}

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (isMuted()) return true;
  if (prefersReducedMotion()) return true;
  return false;
}

export function playTick(): void {
  if (shouldSkip()) return;
  unlock();
  try {
    tickVoice();
  } catch {
    /* ignore */
  }
}

export function playClick(): void {
  if (shouldSkip()) return;
  unlock();
  try {
    clickVoice();
  } catch {
    /* ignore */
  }
}

// --- React hook ---------------------------------------------------------

function subscribeMuted(onChange: () => void): () => void {
  window.addEventListener(MUTE_EVENT, onChange as EventListener);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(MUTE_EVENT, onChange as EventListener);
    window.removeEventListener("storage", onChange);
  };
}

export function useMuted(): [boolean, (v: boolean) => void] {
  // External store (localStorage + custom event); getServerSnapshot is false
  // so SSR and first client render agree, then it syncs to the real value.
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  const update = useCallback((v: boolean) => {
    setMuted(v);
  }, []);

  return [muted, update];
}
