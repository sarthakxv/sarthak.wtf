import type { MetadataRoute } from "next";
import { essays } from "@/content/essays";
import { siteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/work", "/stash", "/curated", "/writing", ...essays.map((essay) => essay.href)].map(
    (path) => ({ url: new URL(path, siteUrl).href }),
  );
}
