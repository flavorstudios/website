import TicTacToe from "./TicTacToe"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Play Tic Tac Toe | Flavor Studios",
  description: "Play Tic Tac Toe against a friend or the computer.",
}

export default function PlayPage() {
  return <TicTacToe />
}
