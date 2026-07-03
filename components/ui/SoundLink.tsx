"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { playTick, playClick } from "@/lib/sound";

const SOUNDS = { tick: playTick, click: playClick } as const;

type SoundName = keyof typeof SOUNDS;

type SoundLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  /** Which sound to play. Defaults to "tick". */
  sound?: SoundName;
  /** Which interaction fires the sound. Defaults to "hover". */
  on?: "hover" | "click";
};

/**
 * Anchor/Link that plays a sound on hover or click.
 *
 * Must be a Client Component: inline event handlers on elements rendered by a
 * Server Component (app/page.tsx, app/work/page.tsx, app/stash/page.tsx, …) are
 * stripped at the RSC boundary and throw "Event handlers cannot be passed to
 * Client Component props." Routing every interactive link through this keeps
 * that boundary in one place.
 *
 * Internal hrefs ("/…", "#…") route through next/link to preserve client-side
 * navigation and prefetch; external and mailto: hrefs render a plain anchor.
 */
export function SoundLink({
  href,
  children,
  sound = "tick",
  on = "hover",
  onMouseEnter,
  onClick,
  ...props
}: SoundLinkProps) {
  const play = SOUNDS[sound];

  const handleEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (on === "hover") play();
    onMouseEnter?.(e);
  };
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (on === "click") play();
    onClick?.(e);
  };

  const internal = href.startsWith("/") || href.startsWith("#");
  if (internal) {
    return (
      <Link
        href={href}
        {...props}
        onMouseEnter={handleEnter}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props} onMouseEnter={handleEnter} onClick={handleClick}>
      {children}
    </a>
  );
}
