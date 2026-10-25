import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { siteDescription, siteUrl } from "@/lib/metadata";
import { caveat, pacifico, jetbrains, spectral, departureMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sarthak Verma",
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${pacifico.variable} ${jetbrains.variable} ${spectral.variable} ${departureMono.variable}`}
      data-style="default"
      data-bg="leaves"
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
