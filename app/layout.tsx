import type { Metadata } from "next";
import { caveat, pacifico, jetbrains, spectral, departureMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sarthak.dev"),
  title: "Sarthak Verma",
  description:
    "Founding Engineer @ Gold.fi. Senior engineer and ex-founder shipping DeFi and AI products.",
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
      <body>{children}</body>
    </html>
  );
}
