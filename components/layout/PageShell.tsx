import type { ReactNode } from "react";
import { LeavesScene } from "@/components/customize/scenes/LeavesScene";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <LeavesScene />
      <div className="relative z-10 w-full">{children}</div>

      {/* Bottom fade — frosted-glass scrim. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0) 100%)",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          WebkitMaskImage:
            "linear-gradient(to top, black 35%, rgba(0,0,0,0.4) 75%, transparent 100%)",
          maskImage:
            "linear-gradient(to top, black 35%, rgba(0,0,0,0.4) 75%, transparent 100%)",
        }}
      />
    </>
  );
}
