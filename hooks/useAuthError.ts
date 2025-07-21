"use client"
import { useState } from "react"

export default function useAuthError() {
  const [error, setError] = useState("")
  const clearError = () => setError("")
  return { error, setError, clearError }
}
