import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Target, Award, ArrowRight, Lightbulb, Palette, Film } from "lucide-react"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { generateAboutPageSchema } from "@/lib/seo-utils"

export const metadata: Metadata = {
  title: "About Us — Flavor Studios",
  description:
    "Learn about Flavor Studios - an independent animation studio specializing in emotionally resonant 3D animated content and original anime series.",
  openGraph: {
    title: "About Us — Flavor Studios",
    description:
      "Learn about Flavor Studios - an independent animation studio specializing in emotionally resonant content.",
    type: "website",
    url: "https://flavorstudios.in/about",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — Flavor Studios",
    description:
      "Learn about Flavor Studios - an independent animation studio specializing in emotionally resonant content.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/about",
  },
}

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Emotional Storytelling",
      description: "We believe in creating content that resonates deeply with audiences and touches hearts.",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Our community is at the center of everything we do, driving our creative decisions.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Target,
      title: "Quality Over Quantity",
      description: "We focus on crafting fewer, higher-quality pieces rather than rushing content.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Award,
      title: "Creative Independence",
      description: "As an independent studio, we maintain complete creative control over our projects.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const milestones = [
    {
      year: "2020",
      title: "Studio Founded",
      description: "Flavor Studios was born from a passion for storytelling and animation.",
    },
    {
      year: "2021",
      title: "First Original Series",
      description: "Released our debut original anime series to critical acclaim.",
    },
    {
      year: "2022",
      title: "Community Growth",
      description: "Reached 100K subscribers and built a thriving creative community.",
    },
    {
      year: "2023",
      title: "Technical Innovation",
      description: "Pioneered new animation techniques using Blender for indie studios.",
    },
    {
      year: "2024",
      title: "Global Recognition",
      description: "Our work gained international recognition in animation festivals.",
    },
  ]

  const team = [
    {
      name: "Creative Director",
      role: "Visionary & Storyteller",
      description: "Leads the creative vision and ensures every story has emotional depth.",
      icon: Lightbulb,
    },
    {
      name: "Lead Animator",
      role: "Technical Artist",
      description: "Brings characters to life with fluid, expressive animation.",
      icon: Film,
    },
    {
      name: "Art Director",
      role: "Visual Designer",
      description: "Creates the stunning visual worlds that house our stories.",
      icon: Palette,
    },
  ]

  return (
    <>
      <JsonLd data={generateAboutPageSchema()} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Badge className="mb-6 bg-blue-600 text-white px-4 py-2">About Our Studio</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Crafting Stories with Soul
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                We are Flavor Studios—an independent animation studio dedicated to creating emotionally resonant 3D
                animated content and original anime series. Every frame is crafted with passion, every story told with
                purpose.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/watch">
                    <Film className="mr-2 h-5 w-5" />
                    Watch Our Work
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600">
                  <Link href="/contact">
                    Get In Touch
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  At Flavor Studios, we believe animation is more than entertainment—it's a powerful medium for
                  emotional connection and storytelling. Our mission is to create content that not only entertains but
                  also inspires, educates, and brings people together.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Every project we undertake is crafted entirely in-house using Blender, ensuring complete creative
                  control and maintaining our commitment to quality and artistic integrity.
                </p>
              </div>
              <div className="relative">
                <img
                  src="/placeholder.svg?height=400&width=600&query=animation studio workspace"
                  alt="Flavor Studios workspace"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our Core Values</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These principles guide every decision we make and every story we tell.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`mx-auto mb-4 p-4 ${value.bgColor} rounded-full w-fit`}>
                      <value.icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our Journey</h2>
              <p className="text-lg text-gray-600">
                From humble beginnings to becoming a recognized name in independent animation.
              </p>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A small but passionate team of creators dedicated to bringing stories to life.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                      <member.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Join Our Creative Journey</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Whether you're a fellow creator, an anime enthusiast, or someone who appreciates quality storytelling,
              we'd love to have you as part of our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/watch">Explore Our Content</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
