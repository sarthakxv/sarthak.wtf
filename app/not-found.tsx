import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SoundLink } from "@/components/ui/SoundLink";
import { ScrambledText } from "@/components/ui/ScrambledText";

export const metadata: Metadata = {
  title: "Page not found | Sarthak Verma",
  description: "I couldn't find the page at this address.",
};

const linkClass =
  "underline decoration-dotted decoration-current/30 underline-offset-4 text-[color:var(--ink-fg)] hover:decoration-current/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm";

export default function NotFound() {
  return (
    <PageShell>
      <main className="relative min-h-screen text-[color:var(--ink-fg)]">
        <div className="max-w-xl mx-auto px-6 py-16 min-h-screen flex flex-col justify-center">
          {/* Error code: machine voice, decoded on mount */}
          <div className="fade-in" style={{ animationDelay: "0ms" }}>
            <ScrambledText className="font-departure text-6xl tracking-tight tabular-nums text-[color:var(--ink-fg)]">
              404
            </ScrambledText>
          </div>

          {/* Soft label: handwritten */}
          <h1
            className="fade-in font-handwritten text-2xl text-[color:var(--ink-soft)] mt-4 lowercase"
            style={{ animationDelay: "60ms" }}
          >
            page not found
          </h1>

          {/* Prose: the site's voice */}
          <p
            className="fade-in mt-6 text-sm leading-relaxed text-[color:var(--ink-mid)]"
            style={{ animationDelay: "100ms" }}
          >
            I couldn&rsquo;t find a page at this address. You can head back home
            to find my work and writing.
          </p>

          {/* Return path */}
          <p className="fade-in mt-8 text-sm" style={{ animationDelay: "150ms" }}>
            <SoundLink href="/" sound="click" on="click" className={linkClass}>
              ← back home
            </SoundLink>
          </p>
        </div>
      </main>
    </PageShell>
  );
}
