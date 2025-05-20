"use client"

import { useState, useCallback, useEffect } from "react"
import { Users, RotateCcw, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Player = "X" | "O"
type Cell = Player | null
type Board = Cell[]
type GameMode = "pvp" | "pvc"

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>("pvp")
  // Add score state
  const [playerXScore, setPlayerXScore] = useState(0)
  const [playerOScore, setPlayerOScore] = useState(0)

  // Check for winner
  const checkWinner = useCallback((board: Board): Player | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player
      }
    }
    return null
  }, [])

  // Check for draw
  const checkDraw = useCallback((board: Board): boolean => {
    return board.every((cell) => cell !== null)
  }, [])

  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
  }, [])

  // Reset scores and game
  const resetScoresAndGame = useCallback(() => {
    resetGame()
    setPlayerXScore(0)
    setPlayerOScore(0)
  }, [resetGame])

  // Computer move logic
  const computerMove = useCallback(() => {
    // Simple AI: First try to win, then block, then take center, then random
    const newBoard = [...board]

    // Find empty cells
    const emptyCells = newBoard.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)

    if (emptyCells.length === 0) return

    // Try each empty cell to see if computer can win
    for (const index of emptyCells) {
      const testBoard = [...newBoard]
      testBoard[index] = "O"
      if (checkWinner(testBoard) === "O") {
        newBoard[index] = "O"
        setBoard(newBoard)
        return
      }
    }

    // Try to block player from winning
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

    // Take a random empty cell
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    newBoard[randomIndex] = "O"
    setBoard(newBoard)
  }, [board, checkWinner])

  // Make a move
  const makeMove = useCallback(
    (index: number) => {
      if (board[index] !== null || winner || isDraw) return

      const newBoard = [...board]
      newBoard[index] = currentPlayer
      setBoard(newBoard)

      const nextPlayer = currentPlayer === "X" ? "O" : "X"
      setCurrentPlayer(nextPlayer)
    },
    [board, currentPlayer, winner, isDraw],
  )

  // Check for game over after each move
  useEffect(() => {
    const gameWinner = checkWinner(board)
    if (gameWinner) {
      setWinner(gameWinner)

      // Update scores when there's a winner
      if (gameWinner === "X") {
        setPlayerXScore((prev) => prev + 1)
      } else if (gameWinner === "O") {
        setPlayerOScore((prev) => prev + 1)
      }

      return
    }

    if (checkDraw(board)) {
      setIsDraw(true)
      return
    }

    // If it's computer's turn in PvC mode
    if (gameMode === "pvc" && currentPlayer === "O" && !gameWinner && !checkDraw(board)) {
      // Add a small delay to make it feel more natural
      const timeoutId = setTimeout(() => {
        computerMove()
        setCurrentPlayer("X")
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [board, currentPlayer, gameMode, checkWinner, checkDraw, computerMove])

  // Auto-reset the board after a game ends
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const isGameOver = winner !== null || isDraw

    if (isGameOver) {
      timeoutId = setTimeout(() => {
        resetGame()
      }, 2500)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [winner, isDraw, resetGame])

  const isGameOver = winner !== null || isDraw

  // Get the appropriate winner message
  const getWinnerMessage = () => {
    if (isDraw) return "It's a Draw!"

    if (gameMode === "pvp") {
      return `Player ${winner} Wins!`
    } else {
      // PvC mode
      return winner === "X" ? "Player Wins!" : "Computer Wins!"
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-orbitron tracking-tight">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            Tic Tac Toe
          </span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Challenge a friend or test your skills against the computer in this classic game of strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Game Info & Controls */}
        <div className="lg:order-1 order-2">
          <Card className="bg-card/50 backdrop-blur-sm border border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 font-orbitron">Game Controls</h2>

              <div className="space-y-3 mb-6">
                <Button
                  variant={gameMode === "pvp" ? "default" : "outline"}
                  className={`w-full justify-start ${gameMode === "pvp" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => {
                    setGameMode("pvp")
                    resetGame()
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Player vs Player
                </Button>

                <Button
                  variant={gameMode === "pvc" ? "default" : "outline"}
                  className={`w-full justify-start ${gameMode === "pvc" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => {
                    setGameMode("pvc")
                    resetGame()
                  }}
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  Player vs Computer
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-primary/10"
                  onClick={resetScoresAndGame}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Game & Scores
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-card/80 p-4 rounded-md border border-border/50">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Mode</h3>
                  <p className="font-medium">{gameMode === "pvp" ? "Player vs Player" : "Player vs Computer"}</p>
                </div>

                <div className="bg-card/80 p-4 rounded-md border border-border/50">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Game Status</h3>
                  {isGameOver ? (
                    <Badge
                      variant={isDraw ? "outline" : "default"}
                      className={`${isDraw ? "border-yellow-500 text-yellow-500" : winner === "X" ? "bg-blue-500" : "bg-pink-500"}`}
                    >
                      {isDraw
                        ? "Draw"
                        : `${winner === "X" ? "Player X" : gameMode === "pvp" ? "Player O" : "Computer"} Wins`}
                    </Badge>
                  ) : (
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${currentPlayer === "X" ? "bg-blue-500" : "bg-pink-500"}`}
                      ></div>
                      <span>
                        {currentPlayer === "X" ? "Player X" : gameMode === "pvp" ? "Player O" : "Computer"}'s Turn
                      </span>
                    </div>
                  )}
                </div>

                {/* Score Tracking */}
                <div className="bg-card/80 p-4 rounded-md border border-border/50">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Score</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Player X</div>
                      <div className="text-2xl font-bold text-blue-400">{playerXScore}</div>
                    </div>
                    <div className="text-center p-2 bg-pink-500/10 rounded-md border border-pink-500/20">
                      <div className="text-xs text-muted-foreground mb-1">
                        {gameMode === "pvp" ? "Player O" : "Computer"}
                      </div>
                      <div className="text-2xl font-bold text-pink-400">{playerOScore}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="lg:col-span-2 lg:order-2 order-1">
          <Card className="bg-card/50 backdrop-blur-sm border border-primary/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="relative w-full max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-3 aspect-square">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      className={`
                        flex items-center justify-center text-3xl md:text-4xl font-bold
                        bg-[#111827] rounded-md transition-all duration-200 h-full
                        border border-primary/10
                        ${!cell && !isGameOver ? "hover:bg-[#1a2234] hover:border-primary/30" : ""}
                        ${!cell && !isGameOver ? "cursor-pointer" : "cursor-default"}
                      `}
                      onClick={() => makeMove(index)}
                      disabled={cell !== null || isGameOver}
                      aria-label={`Cell ${index + 1}`}
                    >
                      {cell === "X" && (
                        <span className="text-blue-400 flex items-center justify-center w-full h-full">X</span>
                      )}
                      {cell === "O" && (
                        <span className="text-pink-500 flex items-center justify-center w-full h-full">O</span>
                      )}
                      {!cell && <span className="opacity-0 select-none">X</span>}
                    </button>
                  ))}
                </div>

                {/* Result Message */}
                {isGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`
                        ${isDraw ? "bg-yellow-500/90" : winner === "X" ? "bg-blue-500/90" : "bg-pink-500/90"}
                        text-white font-bold py-3 px-6 rounded-lg text-xl md:text-2xl shadow-lg
                        backdrop-blur-sm border border-white/20
                      `}
                    >
                      {getWinnerMessage()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Game will reset automatically after a win or draw.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
