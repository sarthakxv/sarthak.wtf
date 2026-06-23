import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LissajousName } from "@/components/home/LissajousName";
import { Bookshelf, type Book } from "@/components/home/Bookshelf";
import { WorkCarousel, type WorkItem } from "@/components/home/WorkCarousel";
import { CommitGraph } from "@/components/home/CommitGraph";
import { SoundToggle } from "@/components/home/SoundToggle";
import { Footer } from "@/components/home/Footer";
import { TRexGame } from "@/components/home/TRexGame";
import { SimpleRow as Row } from "@/components/home/SimpleRow";
import bookshelf from "@/content/bookshelf.json";
import work from "@/content/work.json";

const experience = [
  { role: "Founding Engineer", company: "Gold.fi", href: "https://gold.fi", date: "Jan 2026 — Present" },
  { role: "Co-founder, Head of Engineering", company: "Eido Labs", href: "https://eidolabs.xyz", date: "Dec 2024 — Dec 2025" },
  { role: "Sr. Frontend Engineer · Founding #3", company: "SquaredLabs", href: "https://www.linkedin.com/company/squaredlabs/", date: "Jun 2024 — Dec 2024" },
  { role: "Sr. Frontend Engineer", company: "DefiLens", href: null, date: "Feb 2024 — May 2024" },
  { role: "Lead Frontend Engineer", company: "YieldBay", href: "https://www.findsignal.studio/", date: "Feb 2022 — Sept 2023" },
];

const artifacts = [
  { title: "The Perpification of Everything", href: "/essay/perpification-of-everything", date: "2025" },
];

const experiments = [
  { title: "xaut.cool", href: "https://xaut-cool.vercel.app/" },
  { title: "pills.trade", href: "https://pills.trade/" },
  { title: "Eido App", href: "https://eidolabs.xyz/" },
  { title: "Genie DEX", href: "https://geniedex.io/" },
  { title: "Choplab", href: "/projects/choplab" },
  { title: "Stash", href: "/stash" },
];

const books = bookshelf as Book[];
const workItems = work as WorkItem[];

const linkClass =
  "underline decoration-dotted decoration-current/30 underline-offset-4 text-[color:var(--ink-fg)] hover:decoration-current/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm";

const mutedLinkClass =
  "text-[color:var(--ink-soft)] underline decoration-dotted decoration-current/30 underline-offset-4 cursor-default";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-handwritten text-lg text-[color:var(--ink-soft)] mb-3 lowercase">
      {children}
    </h2>
  );
}


export default function Home() {
  return (
    <PageShell>
      <SoundToggle />
      <main className="relative min-h-screen text-[color:var(--ink-fg)]">
        <div className="max-w-xl mx-auto px-6 py-16">
          {/* 1. Wordmark — name spelled as Lissajous curves */}
          <div className="fade-in text-[color:var(--ink-fg)]" style={{ animationDelay: "0ms" }}>
            <LissajousName name="SARTHAK" size={40} gap={8} />
          </div>

          {/* 2. Intro */}
          <p
            className="fade-in mt-8 text-sm leading-relaxed text-[color:var(--ink-mid)]"
            style={{ animationDelay: "50ms" }}
          >
            I&apos;m Sarthak — founding engineer / head of engineering at{" "}
            <a
              href="https://gold.fi"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Gold.fi
            </a>
            . Senior engineer and ex-founder, 4+ years shipping DeFi and AI
            products from 0→1 — RWA perps, DEXes, and now tokenized gold on
            Ethereum. Frontend-heavy with full-stack depth, best where
            engineering and product decisions are the same conversation.
            Besides code, I degen or play poker —{" "}
            <a href="mailto:sarthakvdev@gmail.com" className={linkClass}>
              drop a note
            </a>{" "}
            or{" "}
            <a
              href="https://x.com/0xSarthak"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              reach me on X
            </a>
            .
          </p>

          {/* 3. Featured card — work carousel + commit graph */}
          <div className="fade-in mt-12 flex flex-col gap-6" style={{ animationDelay: "100ms" }}>
            <WorkCarousel items={workItems} />
            <CommitGraph />
          </div>

          {/* 4. Experience */}
          <section className="fade-in mt-12" style={{ animationDelay: "150ms" }}>
            <SectionLabel>experience</SectionLabel>
            <ul className="flex flex-col">
              {experience.map((item) => (
                <Row
                  key={item.role + (item.company ?? "")}
                  left={
                    <>
                      {item.role}
                      {item.company && (
                        <>
                          {" · "}
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={linkClass}
                            >
                              {item.company}
                            </a>
                          ) : (
                            <span className="underline decoration-dotted decoration-current/30 underline-offset-4">
                              {item.company}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  }
                  right={item.date}
                />
              ))}
            </ul>
          </section>

          {/* 5. Artifacts */}
          <section className="fade-in mt-12" style={{ animationDelay: "200ms" }}>
            <SectionLabel>artifacts</SectionLabel>
            <ul className="flex flex-col">
              {artifacts.map((item) => (
                <Row
                  key={item.title}
                  left={
                    <a href={item.href} className={linkClass}>
                      {item.title}
                    </a>
                  }
                  right={item.date}
                />
              ))}
            </ul>
          </section>

          {/* 6. Experiments */}
          <section className="fade-in mt-12" style={{ animationDelay: "250ms" }}>
            <SectionLabel>experiments</SectionLabel>
            <ul className="flex flex-col">
              {experiments.map((item) => (
                <Row
                  key={item.title}
                  left={<span className="text-[color:var(--ink-fg)]">{item.title}</span>}
                  right={
                    <a href={item.href} className={linkClass}>
                      view
                    </a>
                  }
                />
              ))}
            </ul>
          </section>

          {/* 7. Bookshelf */}
          <section className="fade-in mt-12" style={{ animationDelay: "300ms" }}>
            <SectionLabel>bookshelf</SectionLabel>
            <Bookshelf books={books} />
          </section>

          {/* 8. Elsewhere */}
          <section className="fade-in mt-12" style={{ animationDelay: "350ms" }}>
            <SectionLabel>elsewhere</SectionLabel>
            <p className="text-sm text-[color:var(--ink-mid)] leading-relaxed">
              find me on{" "}
              <a
                href="https://x.com/0xSarthak"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                X/Twitter
              </a>
              ,{" "}
              <a
                href="https://github.com/sarthakxv"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                GitHub
              </a>
              ,{" "}
              <a
                href="https://www.linkedin.com/in/sarthakv"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                LinkedIn
              </a>
              , or reach me at{" "}
              <a href="mailto:sarthakvdev@gmail.com" className={linkClass}>
                sarthakvdev@gmail.com
              </a>
              .
            </p>
          </section>

          <Footer />
          <TRexGame />
        </div>
      </main>
    </PageShell>
  );
}
