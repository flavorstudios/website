import type { Metadata } from "next"
import TicTacToe from "./TicTacToe"

export const metadata: Metadata = {
  title: "Play Games – Flavor Studios",
  description: "Enjoy fun games like Tic Tac Toe at Flavor Studios.",
}

export default function PlayPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-500 bg-purple-500/10 rounded-full">
          ✨ Independent Animation Studio
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-orbitron tracking-tight">
          <span className="text-white">Play</span>{" "}
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">Games</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Take a break and enjoy some fun games created by Flavor Studios. Challenge yourself or play with friends!
        </p>
      </div>

      <TicTacToe />
    </div>
  )
}
