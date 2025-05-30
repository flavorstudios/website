import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Target,
  Users,
  Lightbulb,
  Calendar,
  CheckCircle,
  Coffee,
  Youtube,
  HelpCircle,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Original Quality",
      description: "High-quality animations built from the ground up in Blender with complete creative control.",
    },
    {
      icon: Heart,
      title: "Emotional Storytelling",
      description: "Powerful narratives rooted in emotional depth and universal values that resonate with all.",
    },
    {
      icon: Users,
      title: "Independent & Community-Driven",
      description: "Free from corporate compromise, we stay true to our artistic vision and community.",
    },
    {
      icon: Lightbulb,
      title: "Creative Excellence",
      description: "A commitment to creativity, authenticity, and excellence in every single frame we create.",
    },
  ]

  const timeline = [
    {
      year: "2021",
      title: "The Beginning",
      description: "Flavor Studios was founded as a one-person passion project.",
      status: "completed",
    },
    {
      year: "2022",
      title: "Team Expansion",
      description: "One creator. One vision. Infinite possibilities.",
      status: "completed",
    },
    {
      year: "2023",
      title: "Foundations Laid",
      description: "Mastering tools, crafting worlds, shaping our voice.",
      status: "completed",
    },
    {
      year: "2024",
      title: "Brand Born",
      description: "Flavor Studios named. The mission took form.",
      status: "completed",
    },
    {
      year: "2025",
      title: "Expansion Phase",
      description: "Studio officially launched. Creating original anime and stories.",
      status: "current",
    },
  ]

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <Badge className="mb-3 sm:mb-4 lg:mb-6 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
            Independent Animation Studio
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            About Flavor Studios
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-600 font-medium mb-4 sm:mb-6 lg:mb-8 italic">
            Crafting stories with soul, one frame at a time.
          </p>
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6 text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed px-2">
            <p>
              Flavor Studios is a global, independent animation studio specializing in emotionally resonant 3D animated
              content and original anime series. Founded with a deep passion for authentic storytelling, we bring to
              life compelling narratives that explore universal themes such as life, loss, resilience, and redemption.
            </p>
            <p>
              Every project at Flavor Studios is developed entirely in-house using Blender, ensuring complete creative
              control and artistic integrity. Our work blends cinematic storytelling with meaningful messages—delivering
              both short-form animations that offer thought-provoking life lessons, and long-form anime series designed
              to captivate audiences of all ages.
            </p>
            <p>
              We are more than a studio—we are a community of dreamers, artists, and storytellers dedicated to pushing
              the boundaries of independent animation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
