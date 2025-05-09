"use client"

import type React from "react"

import { motion } from "framer-motion"

interface ValueCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20"
    >
      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
