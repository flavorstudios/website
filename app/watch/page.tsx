import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Watch - Original Anime & Animation",
  description:
    "Watch our original anime episodes, short films, and animated content. Experience emotionally resonant storytelling crafted entirely in-house by Flavor Studios.",
  openGraph: {
    title: "Watch - Original Anime & Animation | Flavor Studios",
    description: "Watch our original anime episodes, short films, and animated content from Flavor Studios.",
    type: "website",
    url: "https://flavorstudios.in/watch",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch - Original Anime & Animation | Flavor Studios",
    description: "Watch our original anime episodes, short films, and animated content from Flavor Studios.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/watch",
  },
}

const WatchPage = () => {
  return (
    <div>
      <h1>Watch</h1>
      <p>Watch our original anime episodes, short films, and animated content.</p>
    </div>
  )
}

export default WatchPage
