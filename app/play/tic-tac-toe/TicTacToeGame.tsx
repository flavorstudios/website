"use client"

import { useState, useEffect } from "react"
import { useGameLogic } from "./useGameLogic"
import GameBoard from "./GameBoard"
import GameControls from "./GameControls"
import ResultMessage from "./ResultMessage"

export default function TicTacToeGame() {
  const [gameMode, setGameMode] = useState<"pvp" | "pvc">("pvp")
  const { board, currentPlayer, winner, isDraw, makeMove, resetGame, isGameOver } = useGameLogic(gameMode)

  // Auto-reset the board after a game ends
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isGameOver) {
      timeoutId = setTimeout(() => {
        resetGame()
      }, 2500)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isGameOver, resetGame])

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <GameControls gameMode={gameMode} setGameMode={setGameMode} resetGame={resetGame} />

      <div className="relative w-full">
        <GameBoard board={board} currentPlayer={currentPlayer} onCellClick={makeMove} isGameOver={isGameOver} />

        {isGameOver && <ResultMessage winner={winner} isDraw={isDraw} />}
      </div>

      <div className="text-center text-sm text-gray-400 mt-4">
        {gameMode === "pvp" ? "Player vs Player Mode" : "Player vs Computer Mode"}
        <p className="mt-1">{!isGameOver && `Current Turn: Player ${currentPlayer}`}</p>
      </div>
    </div>
  )
}
