"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, Users, Cpu } from "lucide-react"

interface GameControlsProps {
  gameMode: "pvp" | "pvc"
  setGameMode: (mode: "pvp" | "pvc") => void
  resetGame: () => void
}

export default function GameControls({ gameMode, setGameMode, resetGame }: GameControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
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
  )
}
