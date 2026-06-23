"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/home/Footer";

function CopyLink() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
      }}
      className="text-xs text-[color:var(--color-mid)] transition-colors hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
    >
      {copied ? "copied" : "copy link"}
    </button>
  );
}

export default function EssayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen text-[color:var(--ink-fg)]">
      {/* Frosted top scrim over the clean reading surface. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-14 bg-white/60 backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <ScrollProgress
        className="fixed top-0 z-20 h-0.5 bg-[color:var(--color-accent)]"
        springOptions={{ bounce: 0 }}
      />

      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <div className="flex items-center justify-between pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-mid)] hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm transition-colors duration-150"
          >
            <ArrowLeft size={14} weight="regular" aria-hidden />
            back
          </Link>
          <CopyLink />
        </div>

        <article
          className="
            fade-in prose max-w-none pt-8
            font-[family-name:var(--font-spectral)] text-[16px] leading-[1.75]
            prose-p:text-[color:var(--ink-mid)]
            prose-headings:font-mono prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-[color:var(--ink-fg)]
            prose-h1:text-3xl prose-h1:lowercase prose-h1:mb-2
            prose-h2:mt-12 prose-h2:text-lg prose-h2:scroll-mt-24
            prose-h3:mt-8 prose-h3:text-base
            prose-a:text-[color:var(--ink-fg)] prose-a:font-normal prose-a:underline prose-a:decoration-dotted prose-a:decoration-current/30 prose-a:underline-offset-4 hover:prose-a:decoration-current/60
            prose-strong:text-[color:var(--ink-fg)] prose-strong:font-semibold
            prose-blockquote:border-l-2 prose-blockquote:border-[color:var(--color-line)] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-[color:var(--ink-soft)]
            prose-li:marker:text-[color:var(--ink-soft)]
            prose-ol:text-[color:var(--ink-mid)] prose-ul:text-[color:var(--ink-mid)]
            prose-hr:border-[color:var(--color-line)]
            prose-code:font-mono prose-code:text-[0.85em] prose-code:text-[color:var(--ink-fg)]
          "
        >
          {children}
        </article>

        <Footer />
      </div>
    </main>
  );
}
