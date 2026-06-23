import type { MDXComponents } from "mdx/types";

// Required by @next/mdx with the App Router. Element-level styling for essays
// lives in app/essay/layout.tsx via the Tailwind `prose` classes, so this map
// stays intentionally minimal — extend it only for shared, content-wide custom
// components (callouts, figures, etc.).
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
