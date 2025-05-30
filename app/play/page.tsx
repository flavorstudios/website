import type { Metadata } from "next"
import { generateCanonicalMetadata } from "@/lib/canonical-utils"

export const metadata: Metadata = {
  title: "Play Games | Flavor Studios - Interactive Entertainment",
  description:
    "Play our interactive tic-tac-toe game with multiple difficulty levels and game modes. Challenge yourself or play with friends!",
  keywords: "games, tic-tac-toe, interactive, entertainment, play online, multiplayer",
  ...generateCanonicalMetadata("/play"),
  openGraph: {
    title: "Play Games at Flavor Studios",
    description: "Interactive games and entertainment from Flavor Studios.",
    type: "website",
  },
  twitter: {
    title: "Play Games at Flavor Studios",
    description: "Interactive games and entertainment from Flavor Studios.",
  },
}

const PlayPage = () => {
  return (
    <div>
      <h1>Play Games</h1>
      <p>Welcome to the play page! More content coming soon.</p>
    </div>
  )
}

export default PlayPage
