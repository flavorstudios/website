// app/play/page.tsx

import { StructuredData } from "@/components/StructuredData";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { getCanonicalUrl, getMetadata, getSchema } from "@/lib/seo-utils"; // Using the consolidated seo-utils import
import PlayPageClient from "./PlayPageClient"; // Assume PlayPageClient accepts gamesData prop

// --- Sample Games Data ---
// IMPORTANT: Replace this with your actual game data.
// If your games are dynamic, fetch them here (in this server component).
const gamesData = [
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe: Anime Edition",
    description: "A classic game of Tic-Tac-Toe with anime-inspired visuals and challenging AI.",
    url: `${SITE_URL}/play/tic-tac-toe`, // Assuming specific URL for each game
    thumbnail: `${SITE_URL}/images/tictactoe-thumbnail.jpg`, // Use a specific thumbnail for this game
    genre: "Puzzle",
    playModes: ["SinglePlayer", "MultiPlayer"], // Schema.org recommends specific enum values
    platforms: ["WebPlatform"], // Schema.org recommends specific enum values
    releaseDate: "2025-05-01", // Example: ISO 8601 format
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
// This metadata provides standard SEO information for the /play page.
export const metadata = getMetadata({
  title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
  description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
  path: "/play",
  robots: "index,follow", // This page should be indexed by search engines.
  openGraph: {
    title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
    description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
    type: "website", // 'website' is appropriate for the main collection page.
    images: [
      {
        url: `${SITE_URL}/cover.jpg`, // General site cover image for OG
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
  //   canonical: getCanonicalUrl("/play"), // Explicit canonical URL for this page.
  // },
});

// --- JSON-LD Schema for the Play Page (WebPage with ItemList of VideoGame) ---
// This schema provides rich information about the page and the games it contains,
// potentially enabling rich results in search engines.
const schema = getSchema({
  type: "WebPage", // The main page itself is a WebPage.
  path: "/play",
  title: `Play Anime-Inspired Games Online | ${SITE_NAME}`,
  description: `Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on ${SITE_NAME}.`,
  image: `${SITE_URL}/cover.jpg`, // Main image for the WebPage schema.
  // REMOVED: Top-level publisher object removed. getSchema now adds it automatically for WebPage types.
  // publisher: {
  //   name: SITE_NAME,
  //   logo: SITE_LOGO_URL,
  // },
  // CORRECTED: mainEntity is now passed directly, not wrapped in additionalProperties.
  mainEntity: {
    "@type": "ItemList",
    itemListElement: gamesData.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1, // List position
      item: {
        "@type": "VideoGame", // Each item is a VideoGame
        name: game.name,
        description: game.description,
        url: game.url,
        image: game.thumbnail, // Game-specific thumbnail
        genre: game.genre,
        // CORRECTED: PlayMode and GamePlatform now use direct enum names, not full URLs.
        playMode: game.playModes as (
          | "SinglePlayer"
          | "MultiPlayer"
          | "CoOp"
          | "Persistent"
        )[], // Cast to valid Schema.org enum types
        gamePlatform: game.platforms as ("WebPlatform" | "AndroidPlatform" | "IOSPlatform" | "WindowsPlatform" | "MacOSPlatform" | "LinuxPlatform")[], // Cast to valid Schema.org enum types
        // If you have ratings, add: aggregateRating: { "@type": "AggregateRating", ratingValue: "4.5", reviewCount: "100" },
        // If you have a specific developer/publisher for the game itself, define here:
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: SITE_LOGO_URL, width: 600, height: 60, caption: `${SITE_NAME} logo` } }, // Explicit publisher for each game.
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
// This component handles the server-side SEO and passes game data to the client component.
export default function PlayPage() {
  return (
    <>
      {/* SEO: Inject the enhanced JSON-LD Structured Data */}
      <StructuredData schema={schema} />
      {/* Render the client-side component, passing the games data */}
      <PlayPageClient gamesData={gamesData} />
    </>
  );
}
