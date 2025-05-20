"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gamepad2, Trophy, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PlayPageClient() {
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
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Tic Tac Toe</h2>
            <p className="text-muted-foreground mb-8">
              Take a quick break and enjoy a classic game of Tic Tac Toe with an anime twist.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.open("/play/tic-tac-toe", "TicTacToe", "width=500,height=600")}
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play Tic Tac Toe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
