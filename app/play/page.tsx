"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Trophy, Clock, Zap, Users, Bot } from "lucide-react"

type Player = "X" | "O" | null
type GameMode = "vs-computer" | "pvp-untimed" | "pvp-timed" | "pvp-blitz"
type Difficulty = "easy" | "medium" | "hard"

interface GameState {
  board: Player[]
  currentPlayer: Player
  winner: Player | "tie" | null
  gameMode: GameMode
  difficulty: Difficulty
  scores: { X: number; O: number; ties: number }
  timeLeft: number
  isGameActive: boolean
  moveHistory: number[]
}

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  winner: null,
  gameMode: "vs-computer",
  difficulty: "medium",
  scores: { X: 0, O: 0, ties: 0 },
  timeLeft: 30,
  isGameActive: true,
  moveHistory: [],
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [autoResetTimer, setAutoResetTimer] = useState<number | null>(null)
  const [resetFeedback, setResetFeedback] = useState(false)

  // Timer for timed modes
  useEffect(() => {
    if (!gameState.isGameActive || gameState.winner) return
    if (gameState.gameMode !== "pvp-timed" && gameState.gameMode !== "pvp-blitz") return

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          // Time's up - current player loses
          const winner = prev.currentPlayer === "X" ? "O" : "X"
          return {
            ...prev,
            winner,
            isGameActive: false,
            timeLeft: 0,
            scores: {
              ...prev.scores,
              [winner]: prev.scores[winner] + 1,
            },
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.currentPlayer, gameState.isGameActive, gameState.winner, gameState.gameMode])

  // Auto-reset timer after game ends
  useEffect(() => {
    if (gameState.winner && !autoResetTimer) {
      const timer = setTimeout(() => {
        resetGame()
        setAutoResetTimer(null)
      }, 4000)
      setAutoResetTimer(timer)
    }

    return () => {
      if (autoResetTimer) {
        clearTimeout(autoResetTimer)
        setAutoResetTimer(null)
      }
    }
  }, [gameState.winner])

  const checkWinner = useCallback((board: Player[]): Player | "tie" | null => {
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
        return board[a]
      }
    }

    return board.every((cell) => cell !== null) ? "tie" : null
  }, [])

  const getComputerMove = useCallback(
    (board: Player[], difficulty: Difficulty): number => {
      const availableMoves = board.map((cell, index) => (cell === null ? index : null)).filter((val) => val !== null)

      if (availableMoves.length === 0) return -1

      if (difficulty === "easy") {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)]!
      }

      // Medium and Hard: Try to win first, then block, then random
      const checkMove = (player: Player) => {
        for (const move of availableMoves) {
          const testBoard = [...board]
          testBoard[move!] = player
          if (checkWinner(testBoard) === player) {
            return move
          }
        }
        return null
      }

      // Try to win
      const winMove = checkMove("O")
      if (winMove !== null) return winMove

      // Try to block player from winning
      const blockMove = checkMove("X")
      if (blockMove !== null && difficulty === "hard") return blockMove

      // Take center if available (hard mode)
      if (difficulty === "hard" && board[4] === null) return 4

      // Take corners (hard mode)
      if (difficulty === "hard") {
        const corners = [0, 2, 6, 8].filter((i) => board[i] === null)
        if (corners.length > 0) {
          return corners[Math.floor(Math.random() * corners.length)]
        }
      }

      return availableMoves[Math.floor(Math.random() * availableMoves.length)]!
    },
    [checkWinner],
  )

  const makeMove = useCallback(
    (index: number) => {
      if (gameState.board[index] || gameState.winner || !gameState.isGameActive) return

      setGameState((prev) => {
        const newBoard = [...prev.board]
        newBoard[index] = prev.currentPlayer
        const winner = checkWinner(newBoard)
        const nextPlayer = prev.currentPlayer === "X" ? "O" : "X"

        const newTimeLeft = prev.gameMode === "pvp-timed" ? 30 : prev.gameMode === "pvp-blitz" ? 10 : prev.timeLeft

        const newState = {
          ...prev,
          board: newBoard,
          currentPlayer: nextPlayer,
          winner,
          timeLeft: winner ? prev.timeLeft : newTimeLeft,
          isGameActive: !winner,
          moveHistory: [...prev.moveHistory, index],
          scores: winner
            ? {
                ...prev.scores,
                [winner === "tie" ? "ties" : winner]: prev.scores[winner === "tie" ? "ties" : winner] + 1,
              }
            : prev.scores,
        }

        return newState
      })
    },
    [gameState.board, gameState.winner, gameState.isGameActive, gameState.currentPlayer, checkWinner],
  )

  // Computer move effect
  useEffect(() => {
    if (
      gameState.gameMode === "vs-computer" &&
      gameState.currentPlayer === "O" &&
      !gameState.winner &&
      gameState.isGameActive
    ) {
      const timer = setTimeout(
        () => {
          const move = getComputerMove(gameState.board, gameState.difficulty)
          if (move !== -1) {
            makeMove(move)
          }
        },
        Math.random() * 800 + 400,
      ) // Random delay between 400-1200ms

      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.board, gameState.difficulty, makeMove, getComputerMove])

  const resetGame = useCallback(() => {
    // Clear auto-reset timer
    if (autoResetTimer) {
      clearTimeout(autoResetTimer)
      setAutoResetTimer(null)
    }

    // Show reset feedback
    setResetFeedback(true)
    setTimeout(() => setResetFeedback(false), 200)

    // Haptic feedback for mobile
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50)
    }

    setGameState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      timeLeft: prev.gameMode === "pvp-timed" ? 30 : prev.gameMode === "pvp-blitz" ? 10 : 30,
      isGameActive: true,
      moveHistory: [],
    }))
  }, [autoResetTimer])

  const resetBoard = useCallback(() => {
    resetGame()
  }, [resetGame])

  const changeGameMode = useCallback((mode: GameMode) => {
    setGameState((prev) => ({
      ...INITIAL_STATE,
      gameMode: mode,
      difficulty: prev.difficulty,
      scores: prev.scores,
      timeLeft: mode === "pvp-timed" ? 30 : mode === "pvp-blitz" ? 10 : 30,
    }))
  }, [])

  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    setGameState((prev) => ({ ...prev, difficulty }))
  }, [])

  const getStatusMessage = () => {
    if (gameState.winner === "tie") return "It's a tie! 🤝"
    if (gameState.winner) {
      if (gameState.gameMode === "vs-computer") {
        return gameState.winner === "X" ? "You win! 🎉" : "Computer wins! 🤖"
      }
      return `Player ${gameState.winner} wins! 🏆`
    }
    if (gameState.gameMode === "vs-computer") {
      return gameState.currentPlayer === "X" ? "Your turn" : "Computer thinking..."
    }
    return `Player ${gameState.currentPlayer}'s turn`
  }

  const getTimeDisplay = () => {
    if (gameState.gameMode === "pvp-timed" || gameState.gameMode === "pvp-blitz") {
      return `${gameState.timeLeft}s`
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tic-Tac-Toe</h1>
          <p className="text-gray-600">Challenge yourself against AI or play with friends!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Game Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={gameState.gameMode} onValueChange={changeGameMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-computer">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        vs Computer
                      </div>
                    </SelectItem>
                    <SelectItem value="pvp-untimed">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Player vs Player
                      </div>
                    </SelectItem>
                    <SelectItem value="pvp-timed">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timed (30s)
                      </div>
                    </SelectItem>
                    <SelectItem value="pvp-blitz">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Blitz (10s)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {gameState.gameMode === "vs-computer" && (
                  <Select value={gameState.difficulty} onValueChange={changeDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{gameState.scores.X}</div>
                    <div className="text-sm text-gray-600">Player X</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{gameState.scores.ties}</div>
                    <div className="text-sm text-gray-600">Ties</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{gameState.scores.O}</div>
                    <div className="text-sm text-gray-600">Player O</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Board */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">{getStatusMessage()}</div>
                    {getTimeDisplay() && (
                      <Badge variant="outline" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeDisplay()}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetBoard}
                    className={`transition-all duration-200 ${
                      resetFeedback
                        ? "bg-blue-100 border-blue-300 scale-95"
                        : "hover:bg-blue-50 hover:border-blue-300 hover:scale-105"
                    }`}
                    disabled={resetFeedback}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${resetFeedback ? "animate-spin" : ""}`} />
                    {resetFeedback ? "Resetting..." : "Reset"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {gameState.board.map((cell, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 w-20 text-2xl font-bold hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                      onClick={() => makeMove(index)}
                      disabled={!!cell || !!gameState.winner || !gameState.isGameActive}
                    >
                      {cell && <span className={cell === "X" ? "text-blue-600" : "text-red-600"}>{cell}</span>}
                    </Button>
                  ))}
                </div>

                {/* Auto-reset countdown */}
                {gameState.winner && autoResetTimer && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">Next game starts in 4 seconds...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objective</h4>
                  <p>Get three of your marks in a row (horizontally, vertically, or diagonally).</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Game Modes</h4>
                  <ul className="space-y-1">
                    <li>
                      • <strong>vs Computer:</strong> Play against AI with different difficulty levels
                    </li>
                    <li>
                      • <strong>Player vs Player:</strong> Take turns with a friend
                    </li>
                    <li>
                      • <strong>Timed:</strong> Each player has 30 seconds per turn
                    </li>
                    <li>
                      • <strong>Blitz:</strong> Fast-paced with 10 seconds per turn
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tips</h4>
                  <ul className="space-y-1">
                    <li>• Control the center square when possible</li>
                    <li>• Block your opponent's winning moves</li>
                    <li>• Create multiple winning opportunities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
