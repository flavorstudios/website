"use client"

import { useState, useCallback, useEffect } from "react"

type Player = "X" | "O"
type Cell = Player | null
type Board = Cell[]
type GameMode = "pvp" | "pvc"

export function useGameLogic(gameMode: GameMode) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | null>(null)
  const [isDraw, setIsDraw] = useState(false)

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

  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
  }, [])

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

  return {
    board,
    currentPlayer,
    winner,
    isDraw,
    makeMove,
    resetGame,
    isGameOver: winner !== null || isDraw,
  }
}
