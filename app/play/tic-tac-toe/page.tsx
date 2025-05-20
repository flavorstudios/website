import type { Metadata } from "next"
import TicTacToeGame from "./TicTacToeGame"

export const metadata: Metadata = {
  title: "Tic Tac Toe | Flavor Studios",
  description: "Play a game of Tic Tac Toe against a friend or the computer",
}

export default function TicTacToePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 font-display bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
        Tic Tac Toe
      </h1>
      <TicTacToeGame />
    </div>
  )
}
