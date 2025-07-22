"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { BarChart2, FileText, MessageSquare } from "lucide-react"

interface Stats {
  posts: number
  views: number
  comments: number
}

export default function AnalyticsCards() {
  const [stats, setStats] = useState<Stats>({ posts: 0, views: 0, comments: 0 })

  useEffect(() => {
    // Placeholder: fetch stats
    setStats({ posts: 128, views: 5231, comments: 42 })
  }, [])

  const cards = [
    { id: "posts", label: "Posts", value: stats.posts, icon: FileText },
    { id: "views", label: "Traffic", value: stats.views, icon: BarChart2 },
    { id: "comments", label: "Comments", value: stats.comments, icon: MessageSquare },
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" /> {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
