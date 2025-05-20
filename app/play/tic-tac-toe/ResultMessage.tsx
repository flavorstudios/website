"use client"

import { motion } from "framer-motion"

interface ResultMessageProps {
  winner: "X" | "O" | null
  isDraw: boolean
}

export default function ResultMessage({ winner, isDraw }: ResultMessageProps) {
  let message = ""
  let colorClass = ""

  if (isDraw) {
    message = "It's a Draw!"
    colorClass = "bg-yellow-500"
  } else if (winner === "X") {
    message = "Player X Wins!"
    colorClass = "bg-blue-500"
  } else if (winner === "O") {
    message = "Player O Wins!"
    colorClass = "bg-pink-500"
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${colorClass} text-white font-bold py-3 px-6 rounded-lg text-xl md:text-2xl shadow-lg`}>
        {message}
      </div>
    </motion.div>
  )
}
