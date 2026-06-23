import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/PageShell";
import { SamplerStage } from "@/components/choplab/SamplerStage";

export const metadata: Metadata = {
  title: "Choplab — Sarthak Verma",
  description: "A browser-based sampler that turns any song into a playable instrument.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-mid)] mb-3">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[color:var(--color-text)] space-y-2">
        {children}
      </div>
    </section>
  );
}

export default function ChoplabPage() {
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
            Choplab
          </h1>
          <p className="mt-2 text-base text-[color:var(--color-mid)]">
            Turn any song into an instrument.
          </p>
        </header>

        <p className="mt-6 text-sm leading-relaxed text-[color:var(--color-text)]">
          A browser sampler. Drop in a track, Choplab slices it into eight chops
          mapped to the home row. Trigger with the keyboard, shift pitch, change
          speed, record a take, export it.
        </p>

        <SamplerStage />

        <Section title="Why">
          <p>
            Started learning sampling on Ableton a few months ago. Wanted my
            own version — something I&apos;d actually use instead of buying
            another plugin. Building it was also the fastest way to understand
            what the good plugins are quietly doing well.
          </p>
        </Section>

        <Section title="What works">
          <ul className="list-disc pl-4 space-y-1.5 marker:text-[color:var(--color-mid)]">
            <li>Auto-chops a single uploaded track into eight slices.</li>
            <li>Eight playable pads with keyboard shortcuts (a–; row).</li>
            <li>Real-time pitch shift and playback speed on every trigger.</li>
            <li>Record a performance, export the take as webm.</li>
          </ul>
        </Section>

        <Section title="What&rsquo;s still rough">
          <ul className="list-disc pl-4 space-y-1.5 marker:text-[color:var(--color-mid)]">
            <li>
              Auto-chops by equal length, not by onset detection — real musical
              moments come later.
            </li>
            <li>
              Pitch and speed share a source — independent time-stretching needs
              a phase vocoder.
            </li>
            <li>Can&apos;t edit a recorded take inside the app yet.</li>
            <li>No EQ or fx on the channel strip.</li>
          </ul>
        </Section>

        <Section title="Process">
          <p>
            Framer 3.0 agents drafted the first iteration — features, layout,
            basic interactions. Then I restyled the layers by hand to land on
            the look I wanted: small surface, dense controls, no chrome between
            you and the sample.
          </p>
          <p className="text-[color:var(--color-mid)]">
            Next pass: manual slice handles, onset-aware chopping, an EQ stage,
            and a real time-stretch.
          </p>
        </Section>
      </main>
    </PageShell>
  );
}
