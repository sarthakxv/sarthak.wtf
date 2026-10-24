import type { Metadata } from "next";

export const siteUrl = "https://sarthakxv.com";
export const siteDescription =
  "Sarthak Verma, senior engineer and founder building DeFi and AI products.";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, siteUrl).href;
  const image = {
    url: `${siteUrl}/og-image.jpg`,
    width: 1200,
    height: 630,
    alt: "Sarthak Verma, senior engineer and founder building DeFi and AI products",
  };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Sarthak Verma",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
