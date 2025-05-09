"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface AnimatedHeadingProps {
  children: React.ReactNode
  className?: string
}

export default function AnimatedHeading({ children, className = "" }: AnimatedHeadingProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.5 })
  const mainControls = useAnimation()
  const slideControls = useAnimation()

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible")
      slideControls.start("visible")
    }
  }, [isInView, mainControls, slideControls])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={`text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent ${className}`}
      >
        {children}
      </motion.h1>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="absolute top-0 bottom-0 left-0 right-0 bg-gray-950 z-20"
      />
    </div>
  )
}
