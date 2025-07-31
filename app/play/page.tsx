// app/play/page.tsx

import { StructuredData } from "@/components/StructuredData";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { getCanonicalUrl, getMetadata, getSchema } from "@/lib/seo-utils"; // Using the consolidated seo-utils import
import PlayPageClient from "./PlayPageClient"; // PlayPageClient no longer expects a prop

// --- Sample Games Data ---
// IMPORTANT: Replace this with your actual game data.
// If your games are dynamic, fetch them here (in this server component).
const gamesData = [
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe: Anime Edition",
    description: "A classic game of Tic-Tac-Toe with anime-inspired visuals and challenging AI.",
    url: `${SITE_URL}/play/tic-tac-toe`,
    thumbnail: `${SITE_URL}/images/tictactoe-thumbnail.jpg`,
    genre: "Puzzle",
    playModes: ["SinglePlayer", "MultiPlayer"],
    platforms: ["WebPlatform"],
    releaseDate: "2025-05-01",
  },
  {
    id: "memory-match",
    name: "Memory Match: Anime Characters",
    description: "Test your memory with this fun matching game featuring characters from your favorite anime.",
    url: `${SITE_URL}/play/memory-match`,
    thumbnail: `${SITE_URL}/images/memory-match-thumbnail.jpg`,
    genre: "Card Game",
    playModes: ["SinglePlayer"],
    platforms: ["WebPlatform"],
    releaseDate: "2025-06-15",
  },
  // Add more game objects as needed
];

// --- Page Metadata ---
export const metadata = getMetadata({
  title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
  description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
  path: "/play",
  robots: "index,follow",
  openGraph: {
    title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
    description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
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
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
    description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // alternates: {
  //   canonical: getCanonicalUrl("/play"),
  // },
});

// --- JSON-LD Schema for the Play Page (WebPage with ItemList of VideoGame) ---
const schema = getSchema({
  type: "WebPage",
  path: "/play",
  title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
  description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
  image: `${SITE_URL}/cover.jpg`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: gamesData.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoGame",
        name: game.name,
        description: game.description,
        url: game.url,
        image: game.thumbnail,
        genre: game.genre,
        playMode: game.playModes as (
          | "SinglePlayer"
          | "MultiPlayer"
          | "CoOp"
          | "Persistent"
        )[],
        gamePlatform: game.platforms as (
          | "WebPlatform"
          | "AndroidPlatform"
          | "IOSPlatform"
          | "WindowsPlatform"
          | "MacOSPlatform"
          | "LinuxPlatform"
        )[],
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: SITE_LOGO_URL, width: 600, height: 60, caption: `${SITE_NAME} logo` } },
        releasedEvent: {
          "@type": "PublicationEvent",
          startDate: game.releaseDate,
          location: {
            "@type": "Place",
            name: "Flavor Studios Official Website"
          }
        }
      },
    })),
  },
});

// --- Play Page Component (Server Component) ---
export default function PlayPage() {
  return (
    <>
      {/* SEO: Inject the enhanced JSON-LD Structured Data */}
      <StructuredData schema={schema} />
      {/* Render the client-side component */}
      <PlayPageClient />
    </>
  );
}
