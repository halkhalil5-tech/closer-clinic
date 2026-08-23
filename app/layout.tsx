import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/register-sw";

// Display: Archivo variable with the width axis — headers use it expanded
// (font-stretch 125%) at weight 800, ALL CAPS. See .display in globals.css.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

// Data: scores, prices, vitals, timestamps.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Body: humanist sans for prose only.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Closer Clinic",
  description:
    "AI patient roleplay for medical case acceptance. Walk into the room, ask for the close, get graded.",
  applicationName: "Closer Clinic",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Closer Clinic",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10151a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${sourceSans.variable}`}
    >
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
