import type { Metadata } from "next"
import PlayPageClient from "./PlayPageClient"

export const metadata: Metadata = {
  title: "Play Games – Flavor Studios Interactive",
  description:
    "Play web-based games like Tic-Tac-Toe, designed with Flavor Studios' animation aesthetic. Fun, creative, and immersive.",
}

export default function PlayPage() {
  return <PlayPageClient />
}
