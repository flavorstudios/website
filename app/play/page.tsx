import type { Metadata } from "next"
import TicTacToe from "./TicTacToe"

export const metadata: Metadata = {
  title: "Play Games – Flavor Studios",
  description: "Enjoy fun games like Tic Tac Toe at Flavor Studios.",
}

export default function PlayPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <div className="inline-block px-3 py-1 mb-4 md:mb-6 text-sm font-medium text-purple-500 bg-purple-500/10 rounded-full">
          ✨ Independent Animation Studio
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 font-orbitron tracking-tight">
          Play <span className="text-primary">Games</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Take a break and enjoy some fun games created by Flavor Studios. Challenge yourself or play with friends!
        </p>
      </div>

      <TicTacToe />
    </div>
  )
}
