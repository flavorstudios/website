import type { Metadata } from "next"
import HomePageClient from "./HomePageClient"

export const metadata: Metadata = {
  title: "Flavor Studios – Emotional 3D Anime & Life-Lessons",
  description:
    "Official site of Flavor Studios – home of soulful 3D animations made with Blender. Anime-inspired stories on life, legacy, and light.",
  keywords: [
    "Flavor Studios",
    "Anime Studio",
    "Blender Animation",
    "Life Lessons",
    "3D Anime",
    "Original Anime Series",
  ],
  openGraph: {
    title: "Flavor Studios – Emotional 3D Anime & Life-Lessons",
    description: "Original 3D animations with deep stories, emotional moments, and anime-inspired visuals.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
