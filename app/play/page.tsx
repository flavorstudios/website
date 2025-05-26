"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Trophy, Clock, RotateCcw } from "lucide-react"

export default function PlayPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [cards, setCards] = useState<string[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const animeCharacters = ["🎌", "⚔️", "🏮", "🌸", "🎭", "🗾", "🎋", "🎪"]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameWon])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      if (cards[first] === cards[second]) {
        setMatchedCards((prev) => [...prev, first, second])
        setFlippedCards([])
      } else {
        setTimeout(() => setFlippedCards([]), 1000)
      }
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameWon(true)
    }
  }, [matchedCards, cards])

  const initializeGame = () => {
    const shuffledCards = [...animeCharacters, ...animeCharacters].sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setTime(0)
    setGameWon(false)
    setGameStarted(true)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCards([])
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setTime(0)
    setGameWon(false)
  }

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return
    }
    setFlippedCards((prev) => [...prev, index])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const games = [
    {
      title: "Anime Memory Match",
      description: "Test your memory with anime-themed cards",
      difficulty: "Easy",
      players: "1 Player",
      active: true,
    },
    {
      title: "Character Quiz",
      description: "Guess the anime character from clues",
      difficulty: "Medium",
      players: "1 Player",
      active: false,
      comingSoon: true,
    },
    {
      title: "Studio Trivia",
      description: "Test your knowledge about anime studios",
      difficulty: "Hard",
      players: "1-4 Players",
      active: false,
      comingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Games & Activities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have fun with our collection of anime-themed games and interactive activities!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {games.map((game, index) => (
            <Card
              key={index}
              className={`${game.active ? "border-blue-500" : ""} ${game.comingSoon ? "opacity-75" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={game.active ? "default" : "secondary"}>
                    {game.comingSoon ? "Coming Soon" : game.difficulty}
                  </Badge>
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">{game.players}</span>
                  {game.active && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Available Now
                    </Badge>
                  )}
                </div>
                <Button className="w-full" disabled={!game.active} onClick={game.active ? initializeGame : undefined}>
                  {game.comingSoon ? "Coming Soon" : "Play Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Memory Game */}
        {gameStarted && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6" />
                  Anime Memory Match
                </CardTitle>
                <Button variant="outline" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Time: {formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Moves: {moves}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {gameWon && (
                <div className="text-center mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Congratulations!</h3>
                  <p className="text-green-700">
                    You completed the game in {moves} moves and {formatTime(time)}!
                  </p>
                </div>
              )}
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {cards.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className={`
                      aspect-square rounded-lg border-2 text-2xl font-bold transition-all duration-300
                      ${
                        flippedCards.includes(index) || matchedCards.includes(index)
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                      }
                      ${matchedCards.includes(index) ? "opacity-75" : ""}
                    `}
                    disabled={gameWon}
                  >
                    {flippedCards.includes(index) || matchedCards.includes(index) ? card : "?"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Instructions */}
        {!gameStarted && (
          <Card>
            <CardHeader>
              <CardTitle>How to Play Anime Memory Match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Rules:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Click on cards to flip them over</li>
                    <li>• Find matching pairs of anime symbols</li>
                    <li>• Match all pairs to win the game</li>
                    <li>• Try to complete it in the fewest moves!</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tips:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Remember the positions of cards you've seen</li>
                    <li>• Start from the corners and work your way in</li>
                    <li>• Take your time to memorize card locations</li>
                    <li>• Practice makes perfect!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
