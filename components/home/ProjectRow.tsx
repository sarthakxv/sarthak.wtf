"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { playClick, playTick } from "@/lib/sound";

export type ProjectItem = {
  name: string;
  desc: string;
  href: string;
  icon?: string;
  aside?: string;
};

const rowClass =
  "group flex items-center gap-4 pl-3 pr-4 py-1.5 -mx-3 rounded-md cursor-pointer w-[calc(100%+1.5rem)] text-left hover:bg-[color:var(--color-hover-bg)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform,box-shadow] duration-150";

function IconBox({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 w-10 h-10 rounded-md bg-[color:var(--color-hover-bg)] flex items-center justify-center overflow-hidden">
      <span className="flex items-center justify-center text-[color:var(--color-text)] transition-transform duration-150 group-hover:scale-110">
        {children}
      </span>
    </div>
  );
}

export function ProjectRow({
  item,
  icon,
  external = true,
}: {
  item: ProjectItem;
  icon?: ReactNode;
  external?: boolean;
}) {
  const isExternal = external && /^https?:\/\//.test(item.href);
  const showArrow = isExternal;

  return (
    <a
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={() => playClick()}
      onMouseEnter={() => playTick()}
      className={rowClass}
    >
      {icon !== undefined && <IconBox>{icon}</IconBox>}
      <div className="min-w-0">
        <p className="text-sm font-medium text-[color:var(--color-text)] leading-[20px] truncate">
          {item.name}
        </p>
        <p className="text-sm text-[color:var(--color-mid)] leading-[20px] truncate">
          {item.desc}
        </p>
        {item.aside && (
          <p className="text-xs text-[color:var(--color-mid)] mt-0.5 truncate">
            {item.aside}
          </p>
        )}
      </div>
      {showArrow && (
        <ArrowUpRight
          size={14}
          weight="regular"
          className="ml-auto shrink-0 self-center text-[color:var(--color-mid)] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150"
        />
      )}
    </a>
  );
}
