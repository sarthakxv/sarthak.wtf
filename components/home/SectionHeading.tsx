import type { ReactNode } from "react";

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-mid)]">
      {children}
    </h2>
  );
}
