"use client"

import { motion } from "framer-motion"

type Player = "X" | "O"
type Cell = Player | null

interface GameBoardProps {
  board: Cell[]
  currentPlayer: Player
  onCellClick: (index: number) => void
  isGameOver: boolean
}

export default function GameBoard({ board, currentPlayer, onCellClick, isGameOver }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full aspect-square">
      {board.map((cell, index) => (
        <motion.button
          key={index}
          className={`
            flex items-center justify-center text-3xl md:text-4xl font-bold
            bg-gray-900 rounded-md transition-colors
            ${!cell && !isGameOver ? "hover:bg-gray-800" : ""}
            ${!cell && !isGameOver ? "cursor-pointer" : "cursor-default"}
          `}
          onClick={() => onCellClick(index)}
          whileTap={{ scale: cell ? 1 : 0.95 }}
          disabled={cell !== null || isGameOver}
        >
          {cell === "X" && (
            <motion.span
              className="text-blue-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              X
            </motion.span>
          )}
          {cell === "O" && (
            <motion.span
              className="text-pink-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              O
            </motion.span>
          )}
          {!cell && !isGameOver && <span className="opacity-0 select-none">X</span>}
        </motion.button>
      ))}
    </div>
  )
}
