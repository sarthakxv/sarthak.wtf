import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/PageShell";
import stash from "@/content/stash.json";

export const metadata: Metadata = {
  title: "Stash — Sarthak Verma",
  description: "A curated list of personal sites worth seeing.",
};

type Link = { label: string; href: string; note?: string };

export default function StashPage() {
  const { updated, intro, links } = stash as {
    updated: string;
    intro: string;
    links: Link[];
  };

  return (
    <PageShell>
      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-mid)] hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm transition-colors duration-150"
        >
          <ArrowLeft size={14} weight="regular" aria-hidden />
          back
        </Link>

        <header className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
            Stash
          </h1>
          <p className="mt-2 text-base text-[color:var(--color-mid)]">
            Sites worth seeing.
          </p>
        </header>

        <p className="mt-6 text-sm leading-relaxed text-[color:var(--color-text)]">
          {intro}
        </p>

        <p
          className="mt-4 text-xs uppercase tracking-[0.08em] text-[color:var(--color-mid)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          updated {updated}
        </p>

        <ul className="mt-8 flex flex-col gap-2">
          {links.map((l) => (
            <li key={l.href} className="text-sm leading-relaxed">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-1 underline decoration-dotted decoration-[color:var(--color-line)] underline-offset-[3px] text-[color:var(--color-text)] hover:text-[color:var(--color-mid)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
              >
                {l.label}
                <ArrowUpRight size={10} weight="regular" aria-hidden className="translate-y-[-1px]" />
              </a>
              {l.note && (
                <span className="ml-2 text-[color:var(--color-mid)]">— {l.note}</span>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-[color:var(--color-mid)]">
          pattern borrowed from{" "}
          <a
            href="https://dris.one/resources/portfolios"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted decoration-[color:var(--color-line)] underline-offset-[3px] hover:text-[color:var(--color-text)]"
          >
            dris&rsquo;s portfolios list
          </a>
          .
        </p>
      </main>
    </PageShell>
  );
}
