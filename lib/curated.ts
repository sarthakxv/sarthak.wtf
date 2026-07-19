import data from "@/content/curated.json";

export type CuratedItem = {
  code: string;
  slug: string;
  name: string;
  maker: string;
  material: string;
  category: string;
  acquired: string;
  image: string;
};

export const curatedItems = data as CuratedItem[];

export function getCuratedItem(slug: string | null | undefined): CuratedItem | undefined {
  if (!slug) return undefined;
  return curatedItems.find((item) => item.slug === slug);
}

/** Depth map path by convention: `/curated/foo.png` → `/curated/foo-depth.png`. */
export function depthSrc(item: CuratedItem): string {
  return item.image.replace(/\.png$/i, "-depth.png");
}

/** Normal map path by convention: `/curated/foo.png` → `/curated/foo-normal.png`. */
export function normalSrc(item: CuratedItem): string {
  return item.image.replace(/\.png$/i, "-normal.png");
}
