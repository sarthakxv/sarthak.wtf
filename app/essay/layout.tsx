"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { TextMorph } from "@/components/ui/text-morph";
import { ScrollProgress } from "@/components/ui/scroll-progress";

function CopyButton() {
  const [text, setText] = useState("copy");

  useEffect(() => {
    if (text !== "copied") return;
    const id = setTimeout(() => setText("copy"), 2000);
    return () => clearTimeout(id);
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href);
        setText("copied");
      }}
      className="flex items-center gap-1 text-xs text-[color:var(--color-mid)] transition-colors hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
    >
      <TextMorph>{text}</TextMorph>
      <span>url</span>
    </button>
  );
}

export default function EssayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Frosted top scrim. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-14 bg-white/60 backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <ScrollProgress
        className="fixed top-0 z-20 h-0.5 bg-[color:var(--color-accent)]"
        springOptions={{ bounce: 0 }}
      />

      <main className="relative z-0 mx-auto max-w-2xl px-5 sm:px-8">
        <div className="flex items-center justify-between pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-mid)] hover:text-[color:var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm transition-colors duration-150"
          >
            <ArrowLeft size={14} weight="regular" aria-hidden />
            back
          </Link>
          <CopyButton />
        </div>

        <article
          className="
            prose prose-zinc max-w-none pb-28 pt-8
            font-[family-name:var(--font-spectral)] text-[15px] leading-relaxed
            prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-[color:var(--color-text)]
            prose-h1:[font-family:Menlo,ui-monospace,SFMono-Regular,monospace] prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:lowercase prose-h1:mb-3
            prose-h2:mt-12 prose-h2:text-lg prose-h2:scroll-mt-20
            prose-h3:mt-8 prose-h3:text-base
            prose-p:text-[color:var(--color-text)]
            prose-a:text-[color:var(--color-text)] prose-a:font-normal prose-a:underline prose-a:decoration-zinc-300 prose-a:underline-offset-2 hover:prose-a:decoration-zinc-500
            prose-blockquote:border-l-2 prose-blockquote:border-zinc-300 prose-blockquote:font-normal prose-blockquote:text-[color:var(--color-mid)]
            prose-strong:font-semibold prose-strong:text-[color:var(--color-text)]
            prose-li:marker:text-[color:var(--color-mid)]
            prose-hr:border-[color:var(--color-line)]
            prose-code:font-mono prose-code:text-[0.85em]
          "
        >
          {children}
        </article>
      </main>
    </>
  );
}
