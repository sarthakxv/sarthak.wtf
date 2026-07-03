import type { Metadata } from "next";
import { Caveat, Pacifico, JetBrains_Mono, Spectral } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Departure Mono — pixel/terminal display face for the "machine voice":
// dates, timestamps, numeric readouts and small meta labels. Not for code.
const departureMono = localFont({
  src: "../public/assets/DepartureMono-Regular.woff2",
  weight: "400",
  variable: "--font-departure-mono",
  display: "swap",
});

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
      className={`${caveat.variable} ${pacifico.variable} ${jetbrains.variable} ${spectral.variable} ${departureMono.variable}`}
      data-style="default"
      data-bg="leaves"
    >
      <body>{children}</body>
    </html>
  );
}
