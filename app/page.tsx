import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LissajousName } from "@/components/home/LissajousName";
// import { Polaroids, type Photo } from "@/components/home/Polaroids";
import { WorkCarousel, type WorkItem } from "@/components/home/WorkCarousel";
import { CommitGraph } from "@/components/home/CommitGraph";
import { SoundToggle } from "@/components/home/SoundToggle";
import { Footer } from "@/components/home/Footer";
import { TRexGame } from "@/components/home/TRexGame";
import { SimpleRow as Row } from "@/components/home/SimpleRow";
// import photos from "@/content/photos.json";
import work from "@/content/work.json";
import experience from "@/content/experience.json";
import artifacts from "@/content/artifacts.json";
import experiments from "@/content/experiments.json";
import socials from "@/content/socials.json";

// const photoItems = photos as Photo[];
const workItems = work as WorkItem[];

const linkClass =
  "underline decoration-dotted decoration-current/30 underline-offset-4 text-[color:var(--ink-fg)] hover:decoration-current/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm";

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

          {/* 2. Subheading — role line under the name */}
          <p
            className="fade-in mt-3 text-sm text-[color:var(--ink-soft)]"
            style={{ animationDelay: "30ms" }}
          >
            Founding Engineer / Head of Engineering @{" "}
            <a
              href="https://gold.fi"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Gold.fi
            </a>
          </p>

          {/* 3. Intro */}
          <p
            className="fade-in mt-6 text-sm leading-relaxed text-[color:var(--ink-mid)]"
            style={{ animationDelay: "50ms" }}
          >
            Senior engineer and ex-founder, 4+ years shipping DeFi and AI
            products from 0→1 — RWA perps, DEXes, and now tokenized gold on
            Ethereum. Frontend-heavy with full-stack depth, best where
            engineering and product decisions are the same conversation.
            Besides code, I degen or play poker —{" "}
            <a
              href="https://t.me/sarthakxv"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              drop on telegram
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

          {/* 4. Featured card — work carousel + commit graph */}
          <div className="fade-in mt-12 flex flex-col gap-6" style={{ animationDelay: "100ms" }}>
            <WorkCarousel items={workItems} />
            <CommitGraph />
          </div>

          {/* 5. Experience */}
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

          {/* 6. Artifacts */}
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

          {/* 7. Experiments */}
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

          {/* 8. Pictures — temporarily hidden, will add pictures later */}
          {/* <section className="fade-in mt-12" style={{ animationDelay: "300ms" }}>
            <SectionLabel>pictures</SectionLabel>
            <Polaroids photos={photoItems} />
          </section> */}

          {/* 9. Elsewhere */}
          <section className="fade-in mt-12" style={{ animationDelay: "350ms" }}>
            <SectionLabel>elsewhere</SectionLabel>
            <p className="text-sm text-[color:var(--ink-mid)] leading-relaxed">
              find me on{" "}
              {socials.profiles.map((profile, i) => (
                <span key={profile.label}>
                  <a
                    href={profile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {profile.label}
                  </a>
                  {i < socials.profiles.length - 1 ? ", " : ""}
                </span>
              ))}
              , or reach me at{" "}
              <a href={`mailto:${socials.email}`} className={linkClass}>
                {socials.email}
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
