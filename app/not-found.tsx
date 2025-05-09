"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <div className="anime-grid absolute inset-0 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-heading mb-4 text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl"
        >
          <span className="heading-gradient">404</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading mb-6 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          <span className="heading-gradient">Page Not Found</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 max-w-md text-lg text-muted-foreground"
        >
          Oops! It seems like you've ventured into uncharted territory. The page you're looking for doesn't exist or has
          been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
