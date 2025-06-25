import PlayPageClient from "./PlayPageClient"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import type { Metadata } from "next"

// Next.js Metadata for SEO, Open Graph, and Twitter Cards
export const metadata: Metadata = {
  title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
  description:
    `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
  robots: "index,follow",
  alternates: {
    canonical: `${SITE_URL}/play`,
  },
  openGraph: {
    title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
    description:
      `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
    url: `${SITE_URL}/play`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Play Anime-Inspired Games | ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
    description:
      `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
}

export default function PlayPage() {
  return <PlayPageClient />
}
