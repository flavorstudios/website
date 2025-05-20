"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Simple types
type Player = "X" | "O"
type Board = Array<Player | null>
type GameMode = "pvp" | "pvc"

export default function TicTacToe() {
  // Basic state
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>("pvp")
  const [playerXScore, setPlayerXScore] = useState(0)
  const [playerOScore, setPlayerOScore] = useState(0)

  // Check for winner
  function checkWinner(board: Board): Player | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player
      }
    }
    return null
  }

  // Check for draw
  function checkDraw(board: Board): boolean {
    return board.every((cell) => cell !== null)
  }

  // Reset the game
  function resetGame() {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
  }

  // Reset scores and game
  function resetScoresAndGame() {
    resetGame()
    setPlayerXScore(0)
    setPlayerOScore(0)
  }

  // Make a move
  function makeMove(index: number) {
    if (board[index] !== null || winner || isDraw) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const nextPlayer = currentPlayer === "X" ? "O" : "X"
    setCurrentPlayer(nextPlayer)
  }

  // Computer move
  function computerMove() {
    const newBoard = [...board]
    const emptyCells = []

    // Find empty cells
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        emptyCells.push(i)
      }
    }

    if (emptyCells.length === 0) return

    // Try to win
    for (const index of emptyCells) {
      const testBoard = [...newBoard]
      testBoard[index] = "O"
      if (checkWinner(testBoard) === "O") {
        newBoard[index] = "O"
        setBoard(newBoard)
        return
      }
    }

    // Try to block
    for (const index of emptyCells) {
      const testBoard = [...newBoard]
      testBoard[index] = "X"
      if (checkWinner(testBoard) === "X") {
        newBoard[index] = "O"
        setBoard(newBoard)
        return
      }
    }

    // Take center if available
    if (newBoard[4] === null) {
      newBoard[4] = "O"
      setBoard(newBoard)
      return
    }

    // Take a random cell
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    newBoard[randomIndex] = "O"
    setBoard(newBoard)
  }

  // Check for game over after each move
  useEffect(() => {
    const gameWinner = checkWinner(board)

    if (gameWinner) {
      setWinner(gameWinner)

      if (gameWinner === "X") {
        setPlayerXScore(playerXScore + 1)
      } else {
        setPlayerOScore(playerOScore + 1)
      }
      return
    }

    if (checkDraw(board)) {
      setIsDraw(true)
      return
    }

    // Computer's turn
    if (gameMode === "pvc" && currentPlayer === "O") {
      const timeoutId = setTimeout(() => {
        computerMove()
        setCurrentPlayer("X")
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [board, currentPlayer, gameMode, playerXScore, playerOScore])

  // Auto-reset after game ends
  useEffect(() => {
    if (winner || isDraw) {
      const timeoutId = setTimeout(() => {
        resetGame()
      }, 2500)

      return () => clearTimeout(timeoutId)
    }
  }, [winner, isDraw])

  // Get winner message
  function getWinnerMessage() {
    if (isDraw) {
      return "It's a Draw!"
    }

    if (gameMode === "pvp") {
      if (winner === "X") {
        return "Player X Wins!"
      } else {
        return "Player O Wins!"
      }
    } else {
      if (winner === "X") {
        return "Player Wins!"
      } else {
        return "Computer Wins!"
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">Tic Tac Toe</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">Game Controls</h2>

            <div className="space-y-3 mb-6">
              <Button
                className="w-full"
                variant={gameMode === "pvp" ? "default" : "outline"}
                onClick={() => {
                  setGameMode("pvp")
                  resetGame()
                }}
              >
                Player vs Player
              </Button>

              <Button
                className="w-full"
                variant={gameMode === "pvc" ? "default" : "outline"}
                onClick={() => {
                  setGameMode("pvc")
                  resetGame()
                }}
              >
                Player vs Computer
              </Button>

              <Button className="w-full" variant="outline" onClick={resetScoresAndGame}>
                Reset Game & Scores
              </Button>
            </div>

            <div className="mb-4 p-3 border rounded">
              <h3 className="text-sm font-medium mb-1">Current Mode</h3>
              <p>{gameMode === "pvp" ? "Player vs Player" : "Player vs Computer"}</p>
            </div>

            <div className="mb-4 p-3 border rounded">
              <h3 className="text-sm font-medium mb-1">Game Status</h3>
              {winner ? (
                <p className="font-bold">
                  {winner === "X"
                    ? gameMode === "pvp"
                      ? "Player X Wins"
                      : "Player Wins"
                    : gameMode === "pvp"
                      ? "Player O Wins"
                      : "Computer Wins"}
                </p>
              ) : isDraw ? (
                <p className="font-bold">Draw</p>
              ) : (
                <p>
                  {currentPlayer === "X"
                    ? "Player X's Turn"
                    : gameMode === "pvp"
                      ? "Player O's Turn"
                      : "Computer's Turn"}
                </p>
              )}
            </div>

            <div className="p-3 border rounded">
              <h3 className="text-sm font-medium mb-2">Score</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 border rounded">
                  <div className="text-xs mb-1">Player X</div>
                  <div className="text-2xl font-bold">{playerXScore}</div>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-xs mb-1">{gameMode === "pvp" ? "Player O" : "Computer"}</div>
                  <div className="text-2xl font-bold">{playerOScore}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Board */}
        <div className="md:col-span-2">
          <Card className="p-4">
            <div className="relative max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-2 aspect-square">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    className="flex items-center justify-center text-3xl font-bold bg-gray-800 rounded h-full"
                    onClick={() => makeMove(index)}
                    disabled={cell !== null || winner !== null || isDraw}
                  >
                    {cell === "X" && <span className="text-blue-400">X</span>}
                    {cell === "O" && <span className="text-pink-500">O</span>}
                  </button>
                ))}
              </div>

              {/* Result Message */}
              {(winner || isDraw) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-70 text-white font-bold py-3 px-6 rounded-lg text-xl">
                    {getWinnerMessage()}
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm mt-4">Game will reset automatically after a win or draw.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
