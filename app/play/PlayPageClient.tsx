"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Gamepad2, Trophy, Users, Zap, Bot, Clock, Info } from "lucide-react"

type Player = "X" | "O" | null
type GameMode = "p2p" | "p2c"
type Difficulty = "easy" | "medium" | "hard"

interface GameState {
  board: Player[]
  currentPlayer: Player
  winner: Player | "tie" | null
  gameMode: GameMode
  difficulty: Difficulty
  scores: { X: number; O: number; ties: number }
  isGameActive: boolean
  moveHistory: number[]
  turnTimeLimit: number
  timeLeft: number
}

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  winner: null,
  gameMode: "p2c",
  difficulty: "medium",
  scores: { X: 0, O: 0, ties: 0 },
  isGameActive: true,
  moveHistory: [],
  turnTimeLimit: 0,
  timeLeft: 0,
}

export default function PlayPageClient() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [autoResetTimer, setAutoResetTimer] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [resetFeedback, setResetFeedback] = useState(false)

  // Timer for P2P difficulty modes
  useEffect(() => {
    if (gameState.gameMode === "p2p" && gameState.turnTimeLimit > 0 && gameState.isGameActive && !gameState.winner) {
      const timer = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 1) {
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
    }
  }, [gameState.currentPlayer, gameState.isGameActive, gameState.winner, gameState.gameMode, gameState.turnTimeLimit])

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

      const winMove = checkMove("O")
      if (winMove !== null) return winMove

      const blockMove = checkMove("X")
      if (blockMove !== null && (difficulty === "medium" || difficulty === "hard")) return blockMove

      if (difficulty === "hard" && board[4] === null) return 4

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

      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(20)
      }

      setGameState((prev) => {
        const newBoard = [...prev.board]
        newBoard[index] = prev.currentPlayer
        const winner = checkWinner(newBoard)
        const nextPlayer = prev.currentPlayer === "X" ? "O" : "X"

        return {
          ...prev,
          board: newBoard,
          currentPlayer: nextPlayer,
          winner,
          isGameActive: !winner,
          moveHistory: [...prev.moveHistory, index],
          timeLeft: winner ? prev.timeLeft : prev.turnTimeLimit,
          scores: winner
            ? {
                ...prev.scores,
                [winner === "tie" ? "ties" : winner]: prev.scores[winner === "tie" ? "ties" : winner] + 1,
              }
            : prev.scores,
        }
      })
    },
    [gameState.board, gameState.winner, gameState.isGameActive, gameState.currentPlayer, checkWinner],
  )

  // Computer move effect
  useEffect(() => {
    if (
      gameState.gameMode === "p2c" &&
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
      )
      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.board, gameState.difficulty, makeMove, getComputerMove])

  // Auto-reset timer after game ends
  useEffect(() => {
    if (gameState.winner && !autoResetTimer) {
      setCountdown(2)
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const timer = setTimeout(() => {
        resetGame()
        setAutoResetTimer(null)
        setCountdown(0)
      }, 2000)

      setAutoResetTimer(timer)

      return () => {
        clearTimeout(timer)
        clearInterval(countdownInterval)
      }
    }
  }, [gameState.winner])

  const resetGame = useCallback(() => {
    if (autoResetTimer) {
      clearTimeout(autoResetTimer)
      setAutoResetTimer(null)
    }
    setCountdown(0)

    setResetFeedback(true)
    setTimeout(() => setResetFeedback(false), 200)

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50)
    }

    setGameState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isGameActive: true,
      moveHistory: [],
      timeLeft: prev.turnTimeLimit,
    }))
  }, [autoResetTimer])

  const changeGameMode = useCallback((mode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isGameActive: true,
      moveHistory: [],
      turnTimeLimit: 0,
      timeLeft: 0,
    }))
  }, [])

  const changeDifficulty = useCallback(
    (difficulty: Difficulty) => {
      const getTimeLimit = (mode: GameMode, diff: Difficulty) => {
        if (mode === "p2c") return 0
        switch (diff) {
          case "easy":
            return 30
          case "medium":
            return 15
          case "hard":
            return 10
          default:
            return 0
        }
      }

      const newTimeLimit = getTimeLimit(gameState.gameMode, difficulty)

      setGameState((prev) => ({
        ...prev,
        difficulty,
        turnTimeLimit: newTimeLimit,
        timeLeft: newTimeLimit,
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        isGameActive: true,
        moveHistory: [],
      }))
    },
    [gameState.gameMode],
  )

  const getStatusMessage = () => {
    if (gameState.winner === "tie") return "It's a tie! 🤝"
    if (gameState.winner) {
      if (gameState.gameMode === "p2c") {
        return gameState.winner === "X" ? "You win! 🎉" : "Computer wins! 🤖"
      }
      return `Player ${gameState.winner} wins! 🏆`
    }
    if (gameState.gameMode === "p2c") {
      return gameState.currentPlayer === "X" ? "Your turn" : "Computer thinking..."
    }
    return `Player ${gameState.currentPlayer}'s turn`
  }

  const getDifficultyDescription = (mode: GameMode, difficulty: Difficulty) => {
    if (mode === "p2c") {
      switch (difficulty) {
        case "easy":
          return "Computer makes random moves"
        case "medium":
          return "Computer uses basic strategy"
        case "hard":
          return "Computer uses advanced AI"
        default:
          return ""
      }
    } else {
      switch (difficulty) {
        case "easy":
          return "30 seconds per turn"
        case "medium":
          return "15 seconds per turn"
        case "hard":
          return "10 seconds per turn"
        default:
          return ""
      }
    }
  }

  const gameFeatures = [
    {
      icon: Users,
      title: "Multiple Modes",
      description: "Play against a friend or challenge the computer AI with different difficulty levels.",
    },
    {
      icon: Zap,
      title: "Auto Reset",
      description: "Games automatically restart after 2 seconds for continuous play.",
    },
    {
      icon: Trophy,
      title: "Score Tracking",
      description: "Keep track of wins, losses, and ties across multiple games.",
    },
  ]

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <Badge className="mb-2 sm:mb-3 lg:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
            Interactive Games
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[1.2] pb-2">
            Play Games
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-blue-600 font-medium mb-3 sm:mb-4 lg:mb-6 italic">
            Challenge yourself with our collection of fun games.
          </p>
          <div className="max-w-4xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed px-2">
            <p>
              Welcome to our interactive gaming section! Take a break and enjoy some classic games with multiple
              difficulty levels and game modes.
            </p>
          </div>
        </div>

        {/* Game Features */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center">Game Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {gameFeatures.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="mx-auto mb-2 sm:mb-3 p-2 bg-blue-100 rounded-full w-fit">
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tic-Tac-Toe Game Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center">Tic-Tac-Toe</h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Game Controls */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      Game Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={gameState.gameMode} onValueChange={(value) => changeGameMode(value as GameMode)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p2c">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            Player vs Computer
                          </div>
                        </SelectItem>
                        <SelectItem value="p2p">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Player vs Player
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={gameState.difficulty}
                      onValueChange={(value) => changeDifficulty(value as Difficulty)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {getDifficultyDescription(gameState.gameMode, gameState.difficulty)}
                    </div>
                  </CardContent>
                </Card>

                {/* Scores */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                      Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{gameState.scores.X}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Player X</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-600">{gameState.scores.ties}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Ties</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">{gameState.scores.O}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Player O</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Game Board */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <div className="text-sm sm:text-base font-semibold">{getStatusMessage()}</div>
                        {gameState.gameMode === "p2p" &&
                          gameState.turnTimeLimit > 0 &&
                          gameState.isGameActive &&
                          !gameState.winner && (
                            <Badge variant="outline" className="ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {gameState.timeLeft}s
                            </Badge>
                          )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetGame}
                        className={`transition-all duration-200 text-xs sm:text-sm ${
                          resetFeedback
                            ? "bg-blue-100 border-blue-300 scale-95"
                            : "hover:bg-blue-50 hover:border-blue-300 hover:scale-105"
                        }`}
                        disabled={resetFeedback}
                      >
                        <RotateCcw
                          className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${resetFeedback ? "animate-spin" : ""}`}
                        />
                        {resetFeedback ? "Resetting..." : "Reset"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Game Board */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-xs mx-auto mb-4">
                      {gameState.board.map((cell, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-16 w-16 sm:h-20 sm:w-20 text-xl sm:text-2xl font-bold hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                          onClick={() => makeMove(index)}
                          disabled={!!cell || !!gameState.winner || !gameState.isGameActive}
                          aria-label={`Cell ${index + 1}, ${cell || "empty"}`}
                        >
                          {cell && <span className={cell === "X" ? "text-blue-600" : "text-red-600"}>{cell}</span>}
                        </Button>
                      ))}
                    </div>

                    {gameState.winner && countdown > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="h-4 w-4" />
                          <span>Next game in {countdown}s...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${((2 - countdown) / 2) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* How to Play */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                      How to Play
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs sm:text-sm text-gray-600">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Objective</h4>
                      <p>Get three marks in a row (horizontally, vertically, or diagonally).</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Game Modes</h4>
                      <ul className="space-y-1">
                        <li>
                          • <strong>vs Computer:</strong> Play against AI with different intelligence levels
                        </li>
                        <li>
                          • <strong>vs Player:</strong> Take turns with a friend, with optional time limits
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">P2C Difficulty</h4>
                      <ul className="space-y-1">
                        <li>
                          • <strong>Easy:</strong> Random moves
                        </li>
                        <li>
                          • <strong>Medium:</strong> Basic strategy
                        </li>
                        <li>
                          • <strong>Hard:</strong> Advanced AI
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">P2P Difficulty</h4>
                      <ul className="space-y-1">
                        <li>
                          • <strong>Easy:</strong> 30s per turn
                        </li>
                        <li>
                          • <strong>Medium:</strong> 15s per turn
                        </li>
                        <li>
                          • <strong>Hard:</strong> 10s per turn
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Auto Reset</h4>
                      <p>Games automatically restart after 2 seconds when finished.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">More Games Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 text-sm sm:text-base leading-relaxed">
                We're working on adding more exciting games with various difficulty levels and multiplayer options.
              </p>
              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs sm:text-sm">
                Stay Tuned for Updates
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
