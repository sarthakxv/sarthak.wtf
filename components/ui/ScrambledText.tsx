"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * ScrambledText — a "decode" / text-scramble reveal, inspired by Maxime
 * Heckel's blog. On mount the string appears as random monospace glyphs and
 * settles left-to-right into the real value. Pairs with Departure Mono.
 *
 * The whole unrevealed tail is scrambled in place (not grown from empty), so
 * every character position is always occupied — zero layout shift, which
 * matters for right-aligned timestamps in a fixed-width face.
 *
 * The reveal runs exactly once. Later `children` changes (e.g. a live clock)
 * pass straight through without re-animating. Honors prefers-reduced-motion
 * and keeps the real text available to screen readers.
 */

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-./:;<=>?".split(
    "",
  );

const randChar = () => CHARS[(Math.random() * CHARS.length) | 0];

function scrambleFrom(text: string, revealed: number) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    out += i < revealed || /\s/.test(c) ? c : randChar();
  }
  return out;
}

export function ScrambledText({
  children,
  className,
  speed = 1,
}: {
  children: string;
  className?: string;
  /** Characters revealed per ~80ms tick. Higher = faster settle. */
  speed?: number;
}) {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(children);
  const done = useRef(false);
  const latest = useRef(children);

  // Keep a ref to the newest value so the reveal can hand off to a live source
  // (e.g. a clock) when it finishes, without re-arming the animation.
  useEffect(() => {
    latest.current = children;
  });

  // Once the intro reveal has finished (or motion is reduced), let live value
  // updates flow through untouched.
  useEffect(() => {
    if (done.current || prefersReduced) setDisplay(children);
  }, [children, prefersReduced]);

  // One-time decode on mount.
  useEffect(() => {
    if (prefersReduced) {
      done.current = true;
      return;
    }
    const target = latest.current;
    let revealed = 0;
    setDisplay(scrambleFrom(target, 0));
    const id = setInterval(() => {
      revealed += 0.5 * speed;
      if (revealed >= target.length) {
        clearInterval(id);
        done.current = true;
        setDisplay(latest.current);
        return;
      }
      setDisplay(scrambleFrom(target, Math.floor(revealed)));
    }, 40);
    return () => clearInterval(id);
    // Intentionally runs once on mount; `target` is snapshotted from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden suppressHydrationWarning>
        {display}
      </span>
    </span>
  );
}
