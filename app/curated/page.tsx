import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { CuratedView } from "@/components/curated/CuratedView";

export const metadata: Metadata = pageMetadata({
  title: "Curated | Sarthak Verma",
  description: "A curated supply of things I own, rendered in 3D.",
  path: "/curated",
});

export default function CuratedPage() {
  return (
    <Suspense fallback={null}>
      <CuratedView />
    </Suspense>
  );
}
