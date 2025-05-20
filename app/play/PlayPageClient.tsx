"use client"

import { useEffect } from "react"

import { useCallback } from "react"

import { useState } from "react"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gamepad2, Trophy, Users, Clock, Cpu, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Player = "X" | "O"
type Cell = Player | null
type Board = Cell[]
type GameMode = "pvp" | "pvc"

export default function PlayPageClient() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>("pvp")

  const games = [
    {
      id: "anime-quiz",
      title: "Ultimate Anime Knowledge Quiz",
      description:
        "Test your anime knowledge with our comprehensive quiz covering everything from classics to the latest releases.",
      category: "Quiz",
      players: "1 player",
      time: "10 min",
      image: "anime%20quiz%20game",
    },
    {
      id: "character-match",
      title: "Character Match Challenge",
      description: "Match characters to their anime series against the clock in this fast-paced memory game.",
      category: "Memory",
      players: "1-2 players",
      time: "5 min",
      image: "anime%20character%20match%20game",
    },
    {
      id: "anime-trivia",
      title: "Anime Trivia Showdown",
      description:
        "Challenge friends or the community in this multiplayer trivia game featuring thousands of anime questions.",
      category: "Trivia",
      players: "1-4 players",
      time: "15 min",
      image: "anime%20trivia%20game",
    },
    {
      id: "opening-guess",
      title: "Name That Anime Opening",
      description: "How quickly can you identify anime series from just a few seconds of their opening themes?",
      category: "Music",
      players: "1 player",
      time: "7 min",
      image: "anime%20opening%20guess%20game",
    },
    {
      id: "art-challenge",
      title: "Anime Art Challenge",
      description:
        "Recreate iconic anime scenes and characters with our digital drawing tools and share your creations.",
      category: "Creative",
      players: "1 player",
      time: "Unlimited",
      image: "anime%20art%20challenge%20game",
    },
    {
      id: "anime-word-puzzle",
      title: "Anime Word Puzzle",
      description: "Solve word puzzles with anime-themed vocabulary and phrases to test your knowledge of terminology.",
      category: "Puzzle",
      players: "1 player",
      time: "8 min",
      image: "anime%20word%20puzzle%20game",
    },
    {
      id: "tic-tac-toe",
      title: "Tic Tac Toe",
      description: "Enjoy a classic game of Tic Tac Toe with an anime twist.",
      category: "Game",
      players: "1-2 players",
      time: "Unlimited",
      image: "tic-tac-toe-game",
    },
  ]

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Play & Interact</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10 text-muted-foreground">
              Test your anime knowledge, challenge friends, and have fun with our interactive games and activities.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="#games">
                Explore Games
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Game */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-lg overflow-hidden border border-primary/20 shadow-lg animate-glow">
                <Image src="/placeholder.svg?key=u17lk" alt="Ultimate Anime Quiz" fill className="object-cover" />
              </div>
              <div className="space-y-6">
                <div className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  Featured Game
                </div>
                <h2 className="text-3xl font-bold font-orbitron">Ultimate Anime Knowledge Quiz</h2>
                <p className="text-muted-foreground">
                  Think you know everything about anime? Put your knowledge to the test with our ultimate anime quiz
                  featuring questions from classics to the latest releases. Compete on the global leaderboard and earn
                  badges to show off your expertise!
                </p>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Gamepad2 className="h-4 w-4 mr-2 text-primary" />
                    Quiz Game
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Single Player
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-primary" />
                    Global Leaderboard
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    10 min
                  </div>
                </div>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/play/anime-quiz">
                    Play Now
                    <Gamepad2 className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section id="games" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 font-orbitron">All Games</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <CardContent className="p-0">
                    <Link href={`/play/${game.id}`}>
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={`/abstract-geometric-shapes.png?key=h4zv0&height=400&width=600&query=${game.image}`}
                          alt={game.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="p-5">
                      <div className="mb-3 flex justify-between items-center">
                        <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                          {game.category}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {game.time}
                        </div>
                      </div>
                      <Link href={`/play/${game.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-lg mb-2 font-orbitron">{game.title}</h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{game.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{game.players}</span>
                        <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                          <Link href={`/play/${game.id}`}>
                            Play
                            <Gamepad2 className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Leaderboard */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Community Leaderboard</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Compete with other anime fans and see where you rank on our global leaderboards.
            </p>

            <div className="bg-card rounded-lg shadow-lg border border-primary/20 overflow-hidden">
              <div className="grid grid-cols-12 bg-primary/10 p-4 font-medium text-sm">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 md:col-span-4">Player</div>
                <div className="col-span-3 text-center">Score</div>
                <div className="hidden md:block md:col-span-2 text-center">Games</div>
                <div className="col-span-3 md:col-span-2 text-center">Best Game</div>
              </div>

              {[
                { rank: 1, name: "AnimeKing95", score: "24,850", games: 47, bestGame: "Anime Quiz" },
                { rank: 2, name: "OtakuMaster", score: "22,310", games: 35, bestGame: "Trivia" },
                { rank: 3, name: "SakuraSan", score: "20,780", games: 29, bestGame: "Character Match" },
                { rank: 4, name: "GundamFan42", score: "19,450", games: 53, bestGame: "Openings" },
                { rank: 5, name: "AkiraLover", score: "18,275", games: 41, bestGame: "Word Puzzle" },
              ].map((player, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 p-4 text-sm ${index % 2 === 0 ? "bg-background/50" : ""} hover:bg-primary/5 transition-colors`}
                >
                  <div className="col-span-1 text-center font-bold text-primary">{player.rank}</div>
                  <div className="col-span-5 md:col-span-4 font-medium">{player.name}</div>
                  <div className="col-span-3 text-center">{player.score}</div>
                  <div className="hidden md:block md:col-span-2 text-center text-muted-foreground">{player.games}</div>
                  <div className="col-span-3 md:col-span-2 text-center text-muted-foreground">{player.bestGame}</div>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" className="mt-8 hover:bg-primary/10">
              <Link href="/leaderboard">
                View Full Leaderboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tic Tac Toe Game */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron tracking-tight">
                <span className="gradient-text">Tic Tac Toe</span>
              </h1>
              <p className="text-lg text-muted-foreground">Challenge a friend or play against the computer</p>
            </div>

            {/* Game Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
              <div className="flex gap-2 flex-1">
                <Button
                  variant={gameMode === "pvp" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setGameMode("pvp")
                    resetGame()
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  vs Player
                </Button>
                <Button
                  variant={gameMode === "pvc" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setGameMode("pvc")
                    resetGame()
                  }}
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  vs Computer
                </Button>
              </div>
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Game Board */}
            <div className="relative w-full">
              <div className="grid grid-cols-3 gap-2 w-full aspect-square">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    className={`
                      flex items-center justify-center text-3xl md:text-4xl font-bold
                      bg-gray-900 rounded-md transition-colors
                      ${!cell && !isGameOver ? "hover:bg-gray-800" : ""}
                      ${!cell && !isGameOver ? "cursor-pointer" : "cursor-default"}
                    `}
                    onClick={() => makeMove(index)}
                    disabled={cell !== null || isGameOver}
                  >
                    {cell === "X" && <span className="text-blue-400">X</span>}
                    {cell === "O" && <span className="text-pink-500">O</span>}
                    {!cell && !isGameOver && <span className="opacity-0 select-none">X</span>}
                  </button>
                ))}
              </div>

              {/* Result Message */}
              {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`
                      ${isDraw ? "bg-yellow-500" : winner === "X" ? "bg-blue-500" : "bg-pink-500"}
                      text-white font-bold py-3 px-6 rounded-lg text-xl md:text-2xl shadow-lg
                    `}
                  >
                    {isDraw ? "It's a Draw!" : `Player ${winner} Wins!`}
                  </div>
                </div>
              )}
            </div>

            {/* Game Status */}
            <div className="text-center text-sm text-gray-400 mt-6">
              {gameMode === "pvp" ? "Player vs Player Mode" : "Player vs Computer Mode"}
              <p className="mt-1">{!isGameOver && `Current Turn: Player ${currentPlayer}`}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
