import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Play Anime-Inspired Games Online | Flavor Studios",
  description:
    "Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on Flavor Studios.",
  path: "/play",
  robots: "index,follow", // Explicit for public, discoverable pages
  openGraph: {
    title: "Play Anime-Inspired Games Online | Flavor Studios",
    description:
      "Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on Flavor Studios.",
    url: "https://flavorstudios.in/play",
    type: "website",
    site_name: "Flavor Studios", // Always present!
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
