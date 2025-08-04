"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MissionStatement() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mb-8 sm:mb-12 lg:mb-16">
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-blue-900">
            Our Belief
          </h2>
          <p
            className={cn(
              "text-base sm:text-lg lg:text-xl text-blue-800 font-medium",
              expanded ? "" : "line-clamp-2 lg:line-clamp-none"
            )}
          >
            At Flavor Studios, we believe that every story has the power to connect, inspire, and leave a legacy. Welcome to a
            place where animation meets meaning.
          </p>
          <Button
            variant="link"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 text-blue-600 underline p-0 h-auto lg:hidden"
          >
            {expanded ? "Less" : "More"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
