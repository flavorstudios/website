import type { Metadata } from "next"
import TicTacToe from "./TicTacToe"

export const metadata: Metadata = {
  title: "Play Tic Tac Toe – Flavor Studios",
  description: "Enjoy a fun game of Tic Tac Toe at Flavor Studios.",
}

export default function PlayPage() {
  return <TicTacToe />
}
