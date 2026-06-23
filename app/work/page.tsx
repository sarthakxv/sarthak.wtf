import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/PageShell";
import work from "@/content/work.json";

export const metadata: Metadata = {
  title: "Work — Sarthak Verma",
  description: "Selected work, sketches, and explorations.",
};

type WorkItem = {
  title: string;
  role: string;
  period: string;
  summary: string;
  image: string;
  link: string;
};

export default function WorkPage() {
  const items = work as WorkItem[];
  const named = items.filter((i) => !i.title.startsWith("Sketch ·"));
  const sketches = items.filter((i) => i.title.startsWith("Sketch ·"));

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
            Work
          </h1>
          <p className="mt-2 text-base text-[color:var(--color-mid)]">
            What I&rsquo;ve been shipping.
          </p>
        </header>

        <p className="mt-6 text-sm leading-relaxed text-[color:var(--color-text)]">
          A few of the projects I&rsquo;ve led or built — most are crypto-adjacent,
          some are side bets, and a handful are sketches that didn&rsquo;t make
          it past Friday night. Click a link to dig deeper where one exists.
        </p>

        <section className="mt-12 flex flex-col gap-12">
          {named.map((item) => (
            <article key={item.title} className="flex flex-col gap-3">
              <div className="aspect-video rounded-[8px] overflow-hidden bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.04)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3 mt-1">
                <h2 className="text-base font-semibold text-[color:var(--color-text)]">
                  {item.title}
                </h2>
                <span className="text-xs text-[color:var(--color-mid)] tabular-nums shrink-0">
                  {item.period}
                </span>
              </div>
              <p className="text-xs text-[color:var(--color-mid)] -mt-2">
                {item.role}
              </p>
              <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
                {item.summary}
              </p>
              {item.link && item.link !== "#" && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 self-start text-sm text-[color:var(--color-text)] underline decoration-dotted decoration-[color:var(--color-line)] underline-offset-[3px] hover:decoration-[color:var(--color-mid)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
                >
                  Visit
                  <ArrowUpRight size={12} weight="regular" aria-hidden />
                </a>
              )}
            </article>
          ))}
        </section>

        {sketches.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-mid)] mb-4">
              Sketches
            </h2>
            <p className="text-sm leading-relaxed text-[color:var(--color-text)] mb-6">
              Loose explorations — UI fragments, mid-build screenshots, things
              I made and then walked away from.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {sketches.map((item) => (
                <div
                  key={item.title}
                  className="aspect-video rounded-[6px] overflow-hidden bg-neutral-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}
