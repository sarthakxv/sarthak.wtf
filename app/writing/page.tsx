import type { Metadata } from "next";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/PageShell";
import { SoundLink } from "@/components/ui/SoundLink";
import { ScrambledText } from "@/components/ui/ScrambledText";
import { Footer } from "@/components/home/Footer";
import { essays } from "@/content/essays";

export const metadata: Metadata = {
  title: "Writing - Sarthak Verma",
  description: "Long-form writing on markets, DeFi, and building.",
};

export default function WritingIndexPage() {
  return (
    <PageShell>
      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <SoundLink
          href="/"
          sound="click"
          on="click"
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-mid)] hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm transition-colors duration-150"
        >
          <ArrowLeftIcon size={14} weight="regular" aria-hidden />
          back
        </SoundLink>

        <header className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
            Writing
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-mid)]">
            Long-form notes on markets, DeFi, and building.
          </p>
        </header>

        <ul className="focus-list mt-8 flex flex-col">
          {essays.map((essay) => (
            <li
              key={essay.slug}
              className="border-b border-[color:var(--color-line)] last:border-0"
            >
              <SoundLink
                href={essay.href}
                className="group block py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] text-[color:var(--color-text)] underline decoration-dotted decoration-[color:var(--color-line)] underline-offset-[3px] transition-colors group-hover:decoration-[color:var(--color-mid)]">
                    {essay.title}
                  </span>
                  {essay.date && (
                    <ScrambledText className="shrink-0 font-departure text-xs tabular-nums text-[color:var(--color-mid)]">
                      {essay.date}
                    </ScrambledText>
                  )}
                </div>
                {essay.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-mid)]">
                    {essay.description}
                  </p>
                )}
              </SoundLink>
            </li>
          ))}
        </ul>

        <Footer />
      </main>
    </PageShell>
  );
}
