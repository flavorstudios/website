"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Shuffle, Trophy, Clock, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Card types for the memory game
type CardType = {
  id: number
  name: string
  matched: boolean
  flipped: boolean
}

// Trivia facts that unlock after completing levels
const triviaFacts = [
  "Flavor Studios was founded in 2021 as a one-person passion project.",
  "All our animations are created using Blender, an open-source 3D creation suite.",
  "Our first animated short took over 3 months to complete.",
  "The name 'Flavor Studios' represents our commitment to creating content with unique flavor and personality.",
  "We specialize in exploring themes of resilience, redemption, and personal growth.",
  "Each character in our animations goes through at least 15 design iterations.",
  "Our animation process combines traditional 2D concept art with modern 3D techniques.",
  "The studio officially launched in January 2025.",
  "Our longest animation project took over 8 months to complete.",
  "We draw inspiration from both Eastern and Western animation traditions.",
]

// Card data for different difficulty levels
const cardSets = {
  easy: [
    { id: 1, name: "Character A" },
    { id: 2, name: "Character B" },
    { id: 3, name: "Character C" },
    { id: 4, name: "Character D" },
    { id: 5, name: "Character E" },
    { id: 6, name: "Character F" },
  ],
  medium: [
    { id: 7, name: "Scene A" },
    { id: 8, name: "Scene B" },
    { id: 9, name: "Scene C" },
    { id: 10, name: "Scene D" },
    { id: 11, name: "Scene E" },
    { id: 12, name: "Scene F" },
    { id: 13, name: "Scene G" },
    { id: 14, name: "Scene H" },
  ],
  hard: [
    { id: 15, name: "Concept A" },
    { id: 16, name: "Concept B" },
    { id: 17, name: "Concept C" },
    { id: 18, name: "Concept D" },
    { id: 19, name: "Concept E" },
    { id: 20, name: "Concept F" },
    { id: 21, name: "Concept G" },
    { id: 22, name: "Concept H" },
    { id: 23, name: "Concept I" },
    { id: 24, name: "Concept J" },
  ],
}

export default function PlayPage() {
  // Game state
  const [cards, setCards] = useState<CardType[]>([])
  const [turns, setTurns] = useState(0)
  const [firstChoice, setFirstChoice] = useState<CardType | null>(null)
  const [secondChoice, setSecondChoice] = useState<CardType | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showTrivia, setShowTrivia] = useState(false)
  const [currentTrivia, setCurrentTrivia] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Shuffle cards for new game
  const shuffleCards = () => {
    // Select card set based on difficulty
    const selectedCards = cardSets[difficulty]

    // Create pairs of cards
    const cardPairs = [...selectedCards, ...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        id: card.id + (index >= selectedCards.length ? 100 : 0), // Ensure unique IDs for pairs
        matched: false,
        flipped: false,
      }))

    setFirstChoice(null)
    setSecondChoice(null)
    setCards(cardPairs)
    setTurns(0)
    setGameCompleted(false)
    setGameStarted(true)
    setTimer(0)
    startTimer()
  }

  // Handle card selection
  const handleChoice = (card: CardType) => {
    if (disabled) return

    // Prevent selecting the same card twice
    if (card.id === firstChoice?.id) return

    firstChoice ? setSecondChoice(card) : setFirstChoice(card)
  }

  // Start the game timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsTimerRunning(true)
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
  }

  // Stop the game timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTimerRunning(false)
  }

  // Reset choices and increment turn
  useEffect(() => {
    if (firstChoice && secondChoice) {
      setDisabled(true)

      // Check if the cards match
      if (firstChoice.name === secondChoice.name) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.name === firstChoice.name) {
              return { ...card, matched: true }
            } else {
              return card
            }
          })
        })
        resetTurn()
      } else {
        // If cards don't match, flip them back after a delay
        setTimeout(() => resetTurn(), 1000)
      }
    }
  }, [firstChoice, secondChoice])

  // Check if game is completed
  useEffect(() => {
    if (gameStarted && cards.length > 0 && cards.every((card) => card.matched)) {
      stopTimer()
      setGameCompleted(true)
      setScore((prevScore) => prevScore + calculateScore())

      // Show trivia fact
      const triviaIndex = (level - 1) % triviaFacts.length
      setCurrentTrivia(triviaFacts[triviaIndex])
      setShowTrivia(true)
    }
  }, [cards, gameStarted])

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Calculate score based on difficulty, turns, and time
  const calculateScore = () => {
    const baseScore = difficulty === "easy" ? 100 : difficulty === "medium" ? 200 : 300
    const turnPenalty = turns * 5
    const timePenalty = Math.floor(timer / 5)
    return Math.max(baseScore - turnPenalty - timePenalty, 50)
  }

  // Reset turn
  const resetTurn = () => {
    setFirstChoice(null)
    setSecondChoice(null)
    setTurns((prevTurns) => prevTurns + 1)
    setDisabled(false)
  }

  // Start next level
  const nextLevel = () => {
    setLevel((prevLevel) => prevLevel + 1)

    // Increase difficulty every 3 levels
    if (level % 3 === 0) {
      if (difficulty === "easy") setDifficulty("medium")
      else if (difficulty === "medium") setDifficulty("hard")
    }

    setShowTrivia(false)
    shuffleCards()
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
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
            <span className="heading-gradient">Frame Match</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Test your memory with our animation-inspired matching game. Flip cards, find pairs, and unlock trivia about
            Flavor Studios!
          </motion.p>
        </div>
      </section>

      {/* Game Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Game Controls */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Level {level}</h2>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="mr-1 h-4 w-4" /> {formatTime(timer)}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Shuffle className="mr-1 h-4 w-4" /> Turns: {turns}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Trophy className="mr-1 h-4 w-4" /> Score: {score}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {!gameStarted ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <Button onClick={shuffleCards}>Start Game</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={shuffleCards}>
                    Restart
                  </Button>
                )}
              </div>
            </div>

            {/* Game Progress */}
            {gameStarted && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {cards.filter((card) => card.matched).length / 2} / {cards.length / 2} pairs
                  </span>
                </div>
                <Progress value={(cards.filter((card) => card.matched).length / cards.length) * 100} />
              </div>
            )}

            {/* Game Board */}
            {gameStarted && (
              <div
                className={`grid gap-4 ${difficulty === "easy" ? "grid-cols-3 sm:grid-cols-4" : difficulty === "medium" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4 sm:grid-cols-5"}`}
              >
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="perspective-500"
                  >
                    <div
                      className={`relative aspect-[3/4] cursor-pointer rounded-lg transition-all duration-500 transform-style-3d ${
                        card.flipped || card.matched ? "rotate-y-180" : ""
                      }`}
                      onClick={() => handleChoice({ ...card, flipped: true })}
                    >
                      {/* Card Back */}
                      <div
                        className={`absolute inset-0 backface-hidden rounded-lg border-2 border-primary/20 bg-card flex items-center justify-center ${
                          card === firstChoice || card === secondChoice ? "border-primary" : ""
                        }`}
                      >
                        <span className="font-heading text-2xl font-bold heading-gradient">FS</span>
                      </div>

                      {/* Card Front */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg border-2 border-primary/20 bg-card flex items-center justify-center">
                        <span className="text-center px-2">{card.name}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Game Instructions */}
            {!gameStarted && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">How to Play</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Flip cards to find matching pairs</li>
                    <li>Complete levels to unlock trivia about Flavor Studios</li>
                    <li>The game gets progressively harder with each level</li>
                    <li>Try to complete each level with the fewest turns and in the shortest time</li>
                    <li>Your score is based on difficulty, number of turns, and time taken</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Trivia Dialog */}
      <Dialog open={showTrivia} onOpenChange={setShowTrivia}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Level {level} Completed!</DialogTitle>
            <DialogDescription>
              You completed the level in {turns} turns and {formatTime(timer)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-primary/10 p-4 mb-4">
              <h3 className="flex items-center text-lg font-semibold mb-2">
                <Info className="mr-2 h-5 w-5 text-primary" />
                Flavor Studios Trivia
              </h3>
              <p>{currentTrivia}</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowTrivia(false)}>
                Close
              </Button>
              <Button onClick={nextLevel}>Next Level</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
