"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Trophy, Users, Bot, Smartphone, Monitor, Clock, Zap, Brain } from "lucide-react"

type Player = "X" | "O" | null
type GameMode = "PvC" | "PvP"
type Difficulty = "easy" | "medium" | "hard"
type PvPDifficulty = "casual" | "timed" | "blitz"
type GameState = "playing" | "won" | "draw" | "timeout"

interface GameStats {
  xWins: number
  oWins: number
  draws: number
  timeouts?: number
}

interface WinningLine {
  positions: number[]
  player: Player
}

export default function PlayPage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [gameState, setGameState] = useState<GameState>("playing")
  const [gameMode, setGameMode] = useState<GameMode>("PvC")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [pvpDifficulty, setPvpDifficulty] = useState<PvPDifficulty>("casual")
  const [stats, setStats] = useState<GameStats>({ xWins: 0, oWins: 0, draws: 0, timeouts: 0 })
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null)
  const [isComputerThinking, setIsComputerThinking] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [moveCount, setMoveCount] = useState(0)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Reset stats on component mount and unmount
  useEffect(() => {
    setStats({ xWins: 0, oWins: 0, draws: 0, timeouts: 0 })

    return () => {
      setStats({ xWins: 0, oWins: 0, draws: 0, timeouts: 0 })
    }
  }, [])

  // Timer logic for PvP timed modes
  useEffect(() => {
    if (
      gameMode === "PvP" &&
      (pvpDifficulty === "timed" || pvpDifficulty === "blitz") &&
      gameState === "playing" &&
      timeLeft !== null
    ) {
      if (timeLeft <= 0) {
        // Time's up - current player loses
        setGameState("timeout")
        const winner = currentPlayer === "X" ? "O" : "X"
        setStats((prev) => ({
          ...prev,
          [winner === "X" ? "xWins" : "oWins"]: prev[winner === "X" ? "xWins" : "oWins"] + 1,
          timeouts: (prev.timeouts || 0) + 1,
        }))
        return
      }

      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [timeLeft, gameMode, pvpDifficulty, gameState, currentPlayer])

  // Initialize timer when starting a new turn in timed modes
  const initializeTimer = useCallback(() => {
    if (gameMode === "PvP" && pvpDifficulty === "timed") {
      setTimeLeft(30) // 30 seconds per move
    } else if (gameMode === "PvP" && pvpDifficulty === "blitz") {
      setTimeLeft(10) // 10 seconds per move
    } else {
      setTimeLeft(null)
    }
  }, [gameMode, pvpDifficulty])

  const checkWinner = useCallback((board: Player[]): WinningLine | null => {
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

    for (const line of lines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { positions: line, player: board[a] }
      }
    }
    return null
  }, [])

  const checkDraw = useCallback((board: Player[]): boolean => {
    return board.every((cell) => cell !== null)
  }, [])

  const getAvailableMoves = useCallback((board: Player[]): number[] => {
    return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
  }, [])

  const minimax = useCallback(
    (
      board: Player[],
      depth: number,
      isMaximizing: boolean,
      alpha = Number.NEGATIVE_INFINITY,
      beta: number = Number.POSITIVE_INFINITY,
    ): number => {
      const winner = checkWinner(board)

      if (winner) {
        return winner.player === "O" ? 10 - depth : depth - 10
      }

      if (checkDraw(board)) {
        return 0
      }

      if (isMaximizing) {
        let maxEval = Number.NEGATIVE_INFINITY
        for (const move of getAvailableMoves(board)) {
          const newBoard = [...board]
          newBoard[move] = "O"
          const value = minimax(newBoard, depth + 1, false, alpha, beta)
          maxEval = Math.max(maxEval, value)
          alpha = Math.max(alpha, value)
          if (beta <= alpha) break
        }
        return maxEval
      } else {
        let minEval = Number.POSITIVE_INFINITY
        for (const move of getAvailableMoves(board)) {
          const newBoard = [...board]
          newBoard[move] = "X"
          const value = minimax(newBoard, depth + 1, true, alpha, beta)
          minEval = Math.min(minEval, value)
          beta = Math.min(beta, value)
          if (beta <= alpha) break
        }
        return minEval
      }
    },
    [checkWinner, checkDraw, getAvailableMoves],
  )

  const getComputerMove = useCallback(
    (board: Player[], difficulty: Difficulty): number => {
      const availableMoves = getAvailableMoves(board)

      if (availableMoves.length === 0) return -1

      switch (difficulty) {
        case "easy":
          return availableMoves[Math.floor(Math.random() * availableMoves.length)]

        case "medium":
          // 70% chance of optimal move, 30% random
          if (Math.random() < 0.7) {
            let bestMove = availableMoves[0]
            let bestValue = Number.NEGATIVE_INFINITY

            for (const move of availableMoves) {
              const newBoard = [...board]
              newBoard[move] = "O"
              const value = minimax(newBoard, 0, false)
              if (value > bestValue) {
                bestValue = value
                bestMove = move
              }
            }
            return bestMove
          } else {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)]
          }

        case "hard":
          let bestMove = availableMoves[0]
          let bestValue = Number.NEGATIVE_INFINITY

          for (const move of availableMoves) {
            const newBoard = [...board]
            newBoard[move] = "O"
            const value = minimax(newBoard, 0, false)
            if (value > bestValue) {
              bestValue = value
              bestMove = move
            }
          }
          return bestMove

        default:
          return availableMoves[0]
      }
    },
    [getAvailableMoves, minimax],
  )

  const makeMove = useCallback(
    (index: number, player: Player) => {
      if (board[index] || gameState !== "playing") return

      // Haptic feedback simulation for mobile
      if (isMobile && "vibrate" in navigator) {
        navigator.vibrate(50)
      }

      const newBoard = [...board]
      newBoard[index] = player
      setBoard(newBoard)
      setMoveCount((prev) => prev + 1)

      const winner = checkWinner(newBoard)
      if (winner) {
        setWinningLine(winner)
        setGameState("won")
        setStats((prev) => ({
          ...prev,
          [winner.player === "X" ? "xWins" : "oWins"]: prev[winner.player === "X" ? "xWins" : "oWins"] + 1,
        }))

        // Victory vibration for mobile
        if (isMobile && "vibrate" in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      } else if (checkDraw(newBoard)) {
        setGameState("draw")
        setStats((prev) => ({ ...prev, draws: prev.draws + 1 }))
      } else {
        setCurrentPlayer(player === "X" ? "O" : "X")
        // Initialize timer for next player in PvP timed modes
        if (gameMode === "PvP" && (pvpDifficulty === "timed" || pvpDifficulty === "blitz")) {
          initializeTimer()
        }
      }
    },
    [board, gameState, checkWinner, checkDraw, isMobile, gameMode, pvpDifficulty, initializeTimer],
  )

  const handleCellClick = (index: number) => {
    if (gameMode === "PvP") {
      makeMove(index, currentPlayer)
    } else if (currentPlayer === "X") {
      makeMove(index, "X")
    }
  }

  // Computer move logic
  useEffect(() => {
    if (gameMode === "PvC" && currentPlayer === "O" && gameState === "playing") {
      setIsComputerThinking(true)
      const timer = setTimeout(
        () => {
          const move = getComputerMove(board, difficulty)
          if (move !== -1) {
            makeMove(move, "O")
          }
          setIsComputerThinking(false)
        },
        isMobile ? 800 : 500,
      ) // Slightly longer delay on mobile for better UX

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameState, board, difficulty, getComputerMove, makeMove, isMobile])

  // Auto-reset after game ends
  useEffect(() => {
    if (gameState !== "playing") {
      const timer = setTimeout(() => {
        resetBoard()
      }, 3000) // Increased to 3 seconds for mobile users

      return () => clearTimeout(timer)
    }
  }, [gameState])

  // Initialize timer when game starts in PvP timed modes
  useEffect(() => {
    if (
      gameMode === "PvP" &&
      (pvpDifficulty === "timed" || pvpDifficulty === "blitz") &&
      gameState === "playing" &&
      moveCount === 0
    ) {
      initializeTimer()
    }
  }, [gameMode, pvpDifficulty, gameState, moveCount, initializeTimer])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setGameState("playing")
    setWinningLine(null)
    setIsComputerThinking(false)
    setTimeLeft(null)
    setMoveCount(0)
    setStats({ xWins: 0, oWins: 0, draws: 0, timeouts: 0 })
  }

  const resetBoard = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setGameState("playing")
    setWinningLine(null)
    setIsComputerThinking(false)
    setTimeLeft(null)
    setMoveCount(0)
    // Initialize timer for new game in PvP timed modes
    if (gameMode === "PvP" && (pvpDifficulty === "timed" || pvpDifficulty === "blitz")) {
      setTimeout(() => initializeTimer(), 100)
    }
  }

  const getGameStatus = () => {
    if (gameState === "won" && winningLine) {
      return `${winningLine.player} Wins! 🎉`
    }
    if (gameState === "draw") {
      return "It's a Draw! 🤝"
    }
    if (gameState === "timeout") {
      const winner = currentPlayer === "X" ? "O" : "X"
      return `Time's Up! ${winner} Wins! ⏰`
    }
    if (isComputerThinking) {
      return "Computer is thinking... 🤔"
    }
    return `Player ${currentPlayer}'s Turn`
  }

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return "bg-green-500 hover:bg-green-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "hard":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getPvPDifficultyColor = (diff: PvPDifficulty) => {
    switch (diff) {
      case "casual":
        return "bg-blue-500 hover:bg-blue-600"
      case "timed":
        return "bg-orange-500 hover:bg-orange-600"
      case "blitz":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getDifficultyIcon = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return "😊"
      case "medium":
        return "🤔"
      case "hard":
        return "😤"
      default:
        return "🎯"
    }
  }

  const getPvPDifficultyIcon = (diff: PvPDifficulty) => {
    switch (diff) {
      case "casual":
        return <Users className="h-4 w-4" />
      case "timed":
        return <Clock className="h-4 w-4" />
      case "blitz":
        return <Zap className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getPvPDifficultyDescription = (diff: PvPDifficulty) => {
    switch (diff) {
      case "casual":
        return "No time limit - play at your own pace"
      case "timed":
        return "30 seconds per move"
      case "blitz":
        return "10 seconds per move - fast-paced!"
      default:
        return "Standard gameplay"
    }
  }

  const getTimerColor = () => {
    if (timeLeft === null) return "text-gray-600"
    if (timeLeft <= 5) return "text-red-600"
    if (timeLeft <= 10) return "text-orange-600"
    return "text-blue-600"
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            {isMobile ? <Smartphone className="h-3 w-3 mr-1" /> : <Monitor className="h-4 w-4 mr-2" />}
            Interactive Game
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Tic-Tac-Toe
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Challenge yourself against the computer or play with a friend!
          </p>
        </div>

        {/* Game Controls */}
        <Card className="mb-6 sm:mb-8 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-0">
            {/* Game Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Game Mode:</span>
                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setGameMode("PvC")}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none min-h-[44px] ${
                      gameMode === "PvC" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    vs Computer
                  </button>
                  <button
                    onClick={() => setGameMode("PvP")}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none min-h-[44px] ${
                      gameMode === "PvP" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    vs Player
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={resetGame}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="min-h-[44px] w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Game
              </Button>
            </div>

            {/* Difficulty Selector for PvC */}
            {gameMode === "PvC" && (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">AI Difficulty Level:</span>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center justify-center gap-2 ${
                        difficulty === diff
                          ? `${getDifficultyColor(diff)} text-white shadow-md`
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      <span className="text-base">{getDifficultyIcon(diff)}</span>
                      <span className="capitalize">{diff}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Selector for PvP */}
            {gameMode === "PvP" && (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Game Style:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {(["casual", "timed", "blitz"] as PvPDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setPvpDifficulty(diff)}
                      className={`px-3 sm:px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-2 ${
                        pvpDifficulty === diff
                          ? `${getPvPDifficultyColor(diff)} text-white shadow-md`
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getPvPDifficultyIcon(diff)}
                        <span className="capitalize font-semibold">{diff}</span>
                      </div>
                      <span className="text-xs opacity-90 text-center">{getPvPDifficultyDescription(diff)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Status with Timer */}
        <div className="text-center mb-4 sm:mb-6">
          <motion.h2
            key={getGameStatus()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold text-gray-800 px-2 mb-2"
          >
            {getGameStatus()}
          </motion.h2>

          {/* Timer Display */}
          {timeLeft !== null && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md ${getTimerColor()}`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg font-bold">{timeLeft}s</span>
            </motion.div>
          )}
        </div>

        {/* Game Board */}
        <Card className="mb-6 sm:mb-8 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-100 rounded-xl">
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={cell !== null || gameState !== "playing" || isComputerThinking}
                    className={`
                      w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-lg shadow-sm
                      flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold
                      transition-all duration-200 hover:shadow-md active:scale-95
                      min-h-[44px] min-w-[44px]
                      ${cell === "X" ? "text-blue-600" : "text-red-500"}
                      ${winningLine?.positions.includes(index) ? "bg-green-100 ring-2 ring-green-400 shadow-lg" : ""}
                      ${cell === null && gameState === "playing" && !isComputerThinking ? "hover:bg-gray-50 cursor-pointer active:bg-gray-100" : ""}
                      disabled:cursor-not-allowed disabled:opacity-60
                    `}
                    whileHover={cell === null && gameState === "playing" && !isComputerThinking ? { scale: 1.05 } : {}}
                    whileTap={cell === null && gameState === "playing" && !isComputerThinking ? { scale: 0.95 } : {}}
                    style={{ touchAction: "manipulation" }} // Prevents double-tap zoom on mobile
                  >
                    <AnimatePresence>
                      {cell && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-center text-lg sm:text-xl">Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-3 sm:gap-4 ${gameMode === "PvP" && (pvpDifficulty === "timed" || pvpDifficulty === "blitz") ? "grid-cols-4" : "grid-cols-3"}`}
            >
              <motion.div
                className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 text-center">{stats.xWins}</div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-1">X Wins</div>
              </motion.div>
              <motion.div
                className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">{stats.draws}</div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-1">Draws</div>
              </motion.div>
              <motion.div
                className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-red-600 text-center">{stats.oWins}</div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-1">O Wins</div>
              </motion.div>
              {gameMode === "PvP" && (pvpDifficulty === "timed" || pvpDifficulty === "blitz") && (
                <motion.div
                  className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 text-center">
                    {stats.timeouts || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 text-center mt-1">Timeouts</div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-specific tips */}
        {isMobile && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-blue-700">
                  💡 <strong>Mobile Tip:</strong> Tap cells to make your move.
                  {gameMode === "PvP" &&
                    (pvpDifficulty === "timed" || pvpDifficulty === "blitz") &&
                    " Watch the timer!"}
                  The game auto-resets after each round!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
