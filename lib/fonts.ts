import { Caveat, Pacifico, JetBrains_Mono, Spectral } from "next/font/google";
import localFont from "next/font/local";

// Departure Mono — pixel/terminal display face for the "machine voice":
// dates, timestamps, numeric readouts and small meta labels. Not for code.
export const departureMono = localFont({
  src: "../public/assets/DepartureMono-Regular.woff2",
  weight: "400",
  variable: "--font-departure-mono",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
  display: "swap",
});

export const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Reading serif for long-form essays (app/essay/**).
export const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});
