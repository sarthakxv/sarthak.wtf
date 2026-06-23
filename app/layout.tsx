import type { Metadata } from "next";
import { Caveat, Pacifico, JetBrains_Mono, Spectral } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Reading serif for long-form essays (app/essay/**).
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

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
      className={`${caveat.variable} ${pacifico.variable} ${jetbrains.variable} ${spectral.variable}`}
      data-style="default"
      data-bg="leaves"
    >
      <body>{children}</body>
    </html>
  );
}
