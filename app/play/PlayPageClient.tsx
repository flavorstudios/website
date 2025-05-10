"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RefreshCwIcon as Refresh, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type SquareValue = "X" | "O" | null
type GameStatus = "playing" | "won" | "draw" | "waiting"

export default function PlayPageClient() {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting")
  const [winner, setWinner] = useState<SquareValue>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [drawScore, setDrawScore] = useState(0)

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left to bottom-right
    [2, 4, 6], // diagonal top-right to bottom-left
  ]

  // Start a new game
  const startGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setGameStatus("playing")
    setWinner(null)
    setWinningLine([])
  }

  // Check for winner
  const checkWinner = (currentBoard: SquareValue[]) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo }
      }
    }
    return null
  }

  // Check if board is full
  const isBoardFull = (currentBoard: SquareValue[]) => {
    return currentBoard.every((square) => square !== null)
  }

  // Handle player move
  const handleSquareClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameStatus !== "playing") return

    const newBoard = [...board]
    newBoard[index] = "X"
    setBoard(newBoard)
    setIsPlayerTurn(false)

    // Check if player won or board is full
    const result = checkWinner(newBoard)
    if (result) {
      setGameStatus("won")
      setWinner("X")
      setWinningLine(result.line)
      setPlayerScore(playerScore + 1)
      return
    }

    if (isBoardFull(newBoard)) {
      setGameStatus("draw")
      setDrawScore(drawScore + 1)
      return
    }

    // Computer's turn
    setTimeout(() => {
      makeComputerMove(newBoard)
    }, 500)
  }

  // Computer move
  const makeComputerMove = (currentBoard: SquareValue[]) => {
    // Simple AI: Try to win, then block player, then take center, then take random
    const newBoard = [...currentBoard]

    // Check for winning move
    const winningMove = findWinningMove(newBoard, "O")
    if (winningMove !== -1) {
      newBoard[winningMove] = "O"
      setBoard(newBoard)
      setGameStatus("won")
      setWinner("O")
      setWinningLine(
        winningCombinations.find(
          (combo) =>
            combo.includes(winningMove) &&
            newBoard[combo[0]] === "O" &&
            newBoard[combo[1]] === "O" &&
            newBoard[combo[2]] === "O",
        ) || [],
      )
      setComputerScore(computerScore + 1)
      return
    }

    // Check for blocking move
    const blockingMove = findWinningMove(newBoard, "X")
    if (blockingMove !== -1) {
      newBoard[blockingMove] = "O"
    } else {
      // Take center if available
      if (newBoard[4] === null) {
        newBoard[4] = "O"
      } else {
        // Take random available square
        const availableSquares = newBoard
          .map((square, index) => (square === null ? index : -1))
          .filter((index) => index !== -1)

        if (availableSquares.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSquares.length)
          newBoard[availableSquares[randomIndex]] = "O"
        }
      }
    }

    setBoard(newBoard)

    // Check if computer won or board is full
    const result = checkWinner(newBoard)
    if (result) {
      setGameStatus("won")
      setWinner("O")
      setWinningLine(result.line)
      setComputerScore(computerScore + 1)
      return
    }

    if (isBoardFull(newBoard)) {
      setGameStatus("draw")
      setDrawScore(drawScore + 1)
      return
    }

    setIsPlayerTurn(true)
  }

  // Find winning move for a player
  const findWinningMove = (currentBoard: SquareValue[], player: "X" | "O"): number => {
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        const boardCopy = [...currentBoard]
        boardCopy[i] = player

        if (checkWinner(boardCopy)) {
          return i
        }
      }
    }
    return -1
  }

  // Get game status message
  const getStatusMessage = () => {
    if (gameStatus === "waiting") return "Click 'Start Game' to play!"
    if (gameStatus === "playing") return isPlayerTurn ? "Your turn" : "Computer is thinking..."
    if (gameStatus === "won") return winner === "X" ? "You won!" : "Computer won!"
    if (gameStatus === "draw") return "It's a draw!"
    return ""
  }

  // Render square
  const renderSquare = (index: number) => {
    const isWinningSquare = winningLine.includes(index)

    return (
      <motion.button
        className={`flex h-20 w-20 items-center justify-center rounded-md border-2 text-3xl font-bold transition-colors sm:h-24 sm:w-24 md:h-28 md:w-28 ${
          isWinningSquare
            ? "border-green-500 bg-green-500/20"
            : "border-primary/20 bg-card hover:border-primary/40 hover:bg-primary/5"
        }`}
        onClick={() => handleSquareClick(index)}
        whileHover={{ scale: board[index] || !isPlayerTurn ? 1 : 1.05 }}
        whileTap={{ scale: board[index] || !isPlayerTurn ? 1 : 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        {board[index] === "X" && (
          <motion.span
            className="text-blue-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            X
          </motion.span>
        )}
        {board[index] === "O" && (
          <motion.span
            className="text-red-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            O
          </motion.span>
        )}
      </motion.button>
    )
  }

  return (
    <div className="relative pt-16">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-background"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="heading-gradient">Tic-Tac-Toe</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Challenge the computer in this classic game with a Flavor Studios twist!
          </motion.p>
        </div>
      </section>

      {/* Game Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Game Board */}
              <div className="md:col-span-2">
                <Card className="anime-card overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold">Game Board</h2>
                      <div className="text-sm font-medium text-muted-foreground">{getStatusMessage()}</div>
                    </div>

                    <div className="flex justify-center">
                      <div className="grid grid-cols-3 gap-2">
                        {Array(9)
                          .fill(null)
                          .map((_, index) => (
                            <div key={index}>{renderSquare(index)}</div>
                          ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <Button onClick={startGame} className="flex items-center gap-2">
                        <Refresh className="h-4 w-4" />
                        {gameStatus === "waiting" ? "Start Game" : "Play Again"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Game Info */}
              <div>
                <Card className="anime-card overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-xl font-bold">Game Stats</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>You (X)</span>
                        <span className="font-bold text-blue-500">{playerScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Computer (O)</span>
                        <span className="font-bold text-red-500">{computerScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Draws</span>
                        <span className="font-bold">{drawScore}</span>
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg bg-primary/10 p-4">
                      <h3 className="flex items-center text-sm font-semibold mb-2">
                        <Info className="mr-2 h-4 w-4 text-primary" />
                        How to Play
                      </h3>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• You play as X, computer plays as O</li>
                        <li>• Get three in a row to win</li>
                        <li>• You always go first</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
