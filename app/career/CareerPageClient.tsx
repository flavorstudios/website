"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const jobOpenings = [
  {
    id: "3d-animator",
    title: "3D Animator",
    department: "Animation",
    type: "Full-time",
    location: "Remote",
    description:
      "We're looking for a talented 3D animator with experience in Blender to join our creative team. You'll be responsible for bringing characters and scenes to life through fluid, expressive animation.",
    responsibilities: [
      "Create high-quality character and environmental animations",
      "Collaborate with the art and story teams to ensure animations align with narrative goals",
      "Optimize animations for various platforms and formats",
      "Participate in regular feedback sessions to refine work",
    ],
    requirements: [
      "Proficiency in Blender (required)",
      "2+ years of experience in 3D animation",
      "Strong understanding of animation principles",
      "Portfolio demonstrating range and quality of animation work",
      "Ability to work independently and as part of a team",
    ],
  },
  {
    id: "storyboard-artist",
    title: "Storyboard Artist",
    department: "Pre-production",
    type: "Contract",
    location: "Remote",
    description:
      "Join our pre-production team as a storyboard artist to help visualize our narratives. You'll translate scripts into visual sequences that guide our animation process.",
    responsibilities: [
      "Create detailed storyboards from scripts and concept art",
      "Visualize camera movements, character actions, and scene transitions",
      "Collaborate with directors and writers to refine visual storytelling",
      "Revise storyboards based on feedback",
    ],
    requirements: [
      "Strong drawing skills and visual storytelling ability",
      "Understanding of cinematography and camera techniques",
      "Experience with digital storyboarding tools",
      "Background in animation or film production preferred",
      "Ability to work within deadlines",
    ],
  },
  {
    id: "3d-modeler",
    title: "3D Character Modeler",
    department: "Art",
    type: "Full-time",
    location: "Remote",
    description:
      "We're seeking a skilled 3D modeler to create expressive characters for our animated projects. You'll work closely with our concept artists to bring 2D designs into the 3D realm.",
    responsibilities: [
      "Create detailed 3D character models based on concept art",
      "Design and implement character topology suitable for animation",
      "Create UV maps and prepare models for texturing",
      "Optimize models for performance across different platforms",
    ],
    requirements: [
      "Proficiency in Blender (required)",
      "3+ years experience in 3D character modeling",
      "Strong understanding of anatomy and character design",
      "Experience with UV mapping and texture preparation",
      "Portfolio demonstrating range of character modeling work",
    ],
  },
]

export default function CareerPageClient() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    position: "",
    message: "",
    portfolio: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitStatus("success")

      // Reset form after successful submission
      setFormState({
        name: "",
        email: "",
        position: "",
        message: "",
        portfolio: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <span className="heading-gradient">Join Our Team</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Be part of our mission to create meaningful 3D animations that resonate with audiences worldwide.
          </motion.p>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl font-bold mb-4">
                Why Join <span className="heading-gradient">Flavor Studios</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're building a team of passionate creators dedicated to crafting meaningful stories and visually
                stunning animations.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card/50 p-6 rounded-lg border"
              >
                <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Creative Freedom</h3>
                <p className="text-muted-foreground">
                  We encourage innovation and provide space for your creative vision to flourish within our
                  collaborative environment.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card/50 p-6 rounded-lg border"
              >
                <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Meaningful Work</h3>
                <p className="text-muted-foreground">
                  Create content that matters. Our stories explore deep themes and aim to leave a lasting impact on our
                  audience.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-card/50 p-6 rounded-lg border"
              >
                <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Growth Opportunities</h3>
                <p className="text-muted-foreground">
                  Develop your skills and advance your career in a supportive environment that values continuous
                  learning.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="py-12 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl font-bold mb-4">
                Current <span className="heading-gradient">Openings</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our available positions and find where your talents can make an impact.
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="w-full">
              {jobOpenings.map((job) => (
                <AccordionItem key={job.id} value={job.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        <span className="ml-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.department} • {job.location}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4">
                      <p className="mb-4">{job.description}</p>

                      <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">Responsibilities:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.responsibilities.map((item, index) => (
                            <li key={index} className="text-muted-foreground">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.requirements.map((item, index) => (
                            <li key={index} className="text-muted-foreground">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => {
                          setActiveJobId(job.id)
                          setFormState((prev) => ({ ...prev, position: job.title }))
                          document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Apply for this position
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="font-heading text-3xl font-bold mb-4">
                Apply <span className="heading-gradient">Now</span>
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below to apply for a position at Flavor Studios.
              </p>
            </motion.div>

            <Card className="anime-card">
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>Please provide your information and we'll get back to you soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <select
                      id="position"
                      name="position"
                      value={formState.position}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="" disabled>
                        Select a position
                      </option>
                      {jobOpenings.map((job) => (
                        <option key={job.id} value={job.title}>
                          {job.title}
                        </option>
                      ))}
                      <option value="Other">Other/Not Listed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                    <Input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      value={formState.portfolio}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Cover Letter / Additional Information</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your experience, and why you want to join Flavor Studios..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        Submitting... <Send className="ml-2 h-4 w-4 animate-pulse" />
                      </>
                    ) : (
                      <>
                        Submit Application <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {submitStatus === "success" && (
                    <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
                      Thank you for your application! We'll review it and get back to you soon.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      There was an error submitting your application. Please try again.
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
