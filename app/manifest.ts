import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Closer Clinic",
    short_name: "Closer Clinic",
    description:
      "AI patient roleplay for medical case acceptance. Walk into the room, ask for the close, get graded.",
    start_url: "/home",
    display: "standalone",
    background_color: "#10151a",
    theme_color: "#10151a",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
