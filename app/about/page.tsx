"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0])

  return (
    <div className="relative pt-16">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-background"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="heading-gradient">About Flavor Studios</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl"
          >
            An indie animation studio creating original animations and stories that inspire, entertain, and connect with
            audiences worldwide.
          </motion.p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-lg">
                Flavor Studios is an indie animation studio dedicated to creating meaningful, emotionally rich 3D
                animated content and original anime series. Established with a passion for authentic storytelling, we
                craft compelling narratives exploring deep themes like life, loss, resilience, and redemption. Each of
                our projects is carefully developed in-house using Blender, reflecting our commitment to artistic
                integrity, detailed craftsmanship, and original creativity.
              </p>
              <p className="text-lg">
                We produce animation content tailored to diverse audiences, from short, impactful animations offering
                life lessons to longer-format original anime series designed to engage viewers of all ages. Flavor
                Studios takes pride in fostering a community that appreciates thoughtful, high-quality animation and
                storytelling.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card/50 p-6 rounded-lg border"
            >
              <h2 className="text-2xl font-bold mb-4">Why Choose Flavor Studios?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Original, high-quality animations developed using Blender</li>
                <li>Emphasis on compelling, meaningful storytelling</li>
                <li>Independent, community-supported studio</li>
                <li>Commitment to creative excellence without compromise</li>
              </ul>
              <p className="mt-6 text-lg font-medium">
                Welcome to Flavor Studios, where every story matters and every animation has purpose.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-24 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12 text-center font-heading"
          >
            Our <span className="heading-gradient">Journey</span>
          </motion.h2>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary to-primary/30"></div>

            <div className="space-y-12 relative">
              {[
                {
                  year: "2021",
                  title: "The Beginning",
                  description: "Flavor Studios was founded as a one-person passion project.",
                },
                {
                  year: "2022",
                  title: "Team Expansion",
                  description: "One creator. One vision. Infinite possibilities.",
                },
                {
                  year: "2023",
                  title: "Foundations Laid",
                  description: "Mastering tools, crafting worlds, shaping our voice.",
                },
                {
                  year: "2024",
                  title: "Brand Born",
                  description: "Flavor Studios named. The mission took form.",
                },
                {
                  year: "2025",
                  title: "Official Launch & World-Building Begins",
                  description:
                    "The studio goes live with purpose and passion. Original anime and stories are now in the making.",
                },
              ].map((event, index) => (
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

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-card border-4 border-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{event.year}</span>
                  </div>

                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl font-bold mb-4">
                Join Our <span className="heading-gradient">Creative Team</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're always looking for passionate, talented individuals to join our growing team. Explore current
                opportunities and be part of our creative journey.
              </p>
            </motion.div>

            <Card className="anime-card overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <Briefcase className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Career Opportunities</h3>
                    <p className="text-muted-foreground mb-6">
                      From animation and storytelling to technical roles and marketing, we offer diverse opportunities
                      for creative professionals to grow and thrive.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        <span>Collaborative, supportive work environment</span>
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        <span>Opportunity to work on original creative projects</span>
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        <span>Professional growth and skill development</span>
                      </li>
                    </ul>
                    <Button asChild>
                      <Link href="http://flavorstudios.in/career">
                        View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="relative w-full max-w-xs aspect-square rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold heading-gradient mb-2">Join Us</p>
                        <p className="text-sm text-muted-foreground">Be part of our creative journey</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border bg-card p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-heading mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to <span className="heading-gradient">Connect</span> with Us?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Whether you're interested in collaboration, have a project in mind, or just want to say hello, we'd love
                to hear from you.
              </p>
              <Button asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
