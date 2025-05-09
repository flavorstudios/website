"use client"

import { motion } from "framer-motion"

const timelineEvents = [
  {
    year: "2018",
    title: "The Beginning",
    description: "Flavor Studios was founded as a one-person passion project.",
  },
  {
    year: "2019",
    title: "First Short Film",
    description: "Released our first animated short film that gained recognition in indie film festivals.",
  },
  {
    year: "2020",
    title: "Team Expansion",
    description: "Grew from a solo project to a team of five dedicated animators and storytellers.",
  },
  {
    year: "2021",
    title: "Studio Launch",
    description: "Officially launched our studio space and began collaborating with clients.",
  },
  {
    year: "2022",
    title: "Award Recognition",
    description: "Received our first industry award for animation excellence.",
  },
  {
    year: "2023",
    title: "Global Reach",
    description: "Expanded our audience reach to international markets and diverse cultural audiences.",
  },
]

export default function StudioTimeline() {
  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-purple-500 to-pink-500"></div>

      <div className="space-y-12 relative">
        {timelineEvents.map((event, index) => (
          <motion.div
            key={event.year}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} relative z-10`}
          >
            <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12"}`}>
              <h3 className="text-xl font-bold text-white">{event.title}</h3>
              <p className="text-gray-400 mt-1">{event.description}</p>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-900 border-4 border-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-300">{event.year}</span>
            </div>

            <div className="w-1/2"></div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
