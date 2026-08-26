import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { RegisterSW } from "@/components/register-sw";
import { AudioUnlock } from "@/components/audio-unlock";
import { Toaster } from "sonner";

// Headings: Cabinet Grotesk (Fontshare/ITF license), self-hosted woff2.
// next/font/local generates a size-adjusted local fallback automatically,
// so swapped-in headings don't shift layout.
const cabinetGrotesk = localFont({
  src: [
    { path: "./fonts/cabinet-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cabinet-grotesk-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cabinet-grotesk",
  display: "swap",
  fallback: ["Avenir Next", "Helvetica Neue", "Arial", "sans-serif"],
});

// Body/UI: Inter 400/500. Numerals ride the same family with tabular-nums.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    statusBarStyle: "default",
    title: "Closer Clinic",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cabinetGrotesk.variable} ${inter.variable}`}>
      <body>
        {children}
        <RegisterSW />
        <AudioUnlock />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0a3540",
              border: "1px solid color-mix(in srgb, #0a3540 8%, transparent)",
              borderRadius: "12px",
              fontSize: "13.5px",
            },
          }}
        />
      </body>
    </html>
  );
}
