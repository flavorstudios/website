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
        {/* ... other sections unchanged ... */}

        {/* Our Journey Timeline - Mobile Optimized */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:block absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              <div className="space-y-4 sm:space-y-6 lg:space-y-12">
                {timeline.map((milestone, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-lg ${
                          milestone.status === "current"
                            ? "bg-blue-600 text-white"
                            : "bg-white border-2 sm:border-3 lg:border-4 border-blue-200 text-blue-600"
                        }`}
                      >
                        {milestone.status === "current" ? (
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        ) : (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="ml-3 sm:ml-4 lg:ml-8 flex-1">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <Badge
                              variant={milestone.status === "current" ? "default" : "secondary"}
                              className={`w-fit text-xs sm:text-sm ${milestone.status === "current" ? "bg-blue-600" : ""}`}
                            >
                              {milestone.year}
                            </Badge>
                            {milestone.status === "current" && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600 w-fit text-xs sm:text-sm"
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base sm:text-lg lg:text-xl text-left">{milestone.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed text-left">
                            {milestone.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ... other sections unchanged ... */}
      </div>
    </div>
  )
}
