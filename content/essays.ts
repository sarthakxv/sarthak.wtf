// Single source of truth for the essays index and the homepage "writing"
// section. Each essay's title/description/date lives once, in its MDX
// `export const metadata` — this registry just imports that object and pairs it
// with the route slug. To publish a new essay: add its page.mdx under
// app/writing/(post)/<slug>/, then add one line to `registry` below.
//
// MDX modules are only typed for their default (content) export, so the named
// `metadata` export is read via a namespace import and a narrow cast.
import * as perpification from "@/app/writing/(post)/perpification-of-everything/page.mdx";

type EssayMeta = {
  title?: string;
  description?: string;
  /** ISO date, e.g. "2025-12-26". */
  date?: string;
};

export type Essay = {
  slug: string;
  href: string;
  title: string;
  description: string;
  /** Full ISO date for the essay index. */
  date: string;
  /** Just the year, for the compact homepage row. */
  year: string;
};

const metaOf = (mod: unknown): EssayMeta =>
  (mod as { metadata?: EssayMeta }).metadata ?? {};

const registry: { slug: string; meta: EssayMeta }[] = [
  { slug: "perpification-of-everything", meta: metaOf(perpification) },
];

export const essays: Essay[] = registry
  .map(({ slug, meta }) => ({
    slug,
    href: `/writing/${slug}`,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.date ?? "",
    year: (meta.date ?? "").slice(0, 4),
  }))
  // Newest first. ISO date strings sort lexicographically.
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
