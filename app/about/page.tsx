// app/about/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData"; // Import reusable component

export const metadata = getMetadata({
  title: `About Us – The Vision Behind ${SITE_NAME}`,
  description: `Explore the heart and vision of ${SITE_NAME} — an indie animation studio crafting emotionally rich anime and 3D stories powered by creativity and community.`,
  path: "/about",
  robots: "index,follow",
  openGraph: {
    title: `About Us – The Vision Behind ${SITE_NAME}`,
    description: `Learn what drives ${SITE_NAME}. Discover our mission, creative values, and passion for telling original stories through anime and 3D animation.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `About Us – The Vision Behind ${SITE_NAME}`,
    description:
      "We’re an indie animation studio fueled by storytelling, emotion, and community. Discover our journey and purpose.",
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export default function AboutPage() {
  const schema = getSchema({
    type: "WebPage",
    path: "/about",
    title: `About Us – The Vision Behind ${SITE_NAME}`,
    description: `Explore the heart and vision of ${SITE_NAME} — an indie animation studio crafting emotionally rich anime and 3D stories powered by creativity and community.`,
    image: `${SITE_URL}/cover.jpg`,
  });

  return (
    <main>
      <h1>About Us</h1>
      <p>
        This is the actual content for the About page of Flavor Studios.
        Here you can detail your company's history, mission, values, team, etc.
      </p>
      {/* Modular, reusable structured data injection */}
      <StructuredData schema={schema} />
      {/* ... more about us content ... */}
    </main>
  );
}

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

        {/* Why Choose Us */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center">
            Why Choose Flavor Studios?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-blue-100 rounded-full w-fit">
                    <value.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm sm:text-base lg:text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-blue-900">
                Our Belief
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-blue-800 font-medium mb-2 sm:mb-3 lg:mb-4">
                At Flavor Studios, we believe that every story has the power to connect, inspire, and leave a legacy.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-blue-700">
                Welcome to a place where animation meets meaning.
              </p>
            </CardContent>
          </Card>
        </div>

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

        {/* Studio Focus */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center">Our Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Our Craft</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                  We specialize in creating emotionally resonant 3D animated content using Blender. Every project is
                  crafted entirely in-house, giving us complete creative control over our artistic vision.
                </p>
                <ul className="space-y-1 sm:space-y-1.5 lg:space-y-2 text-xs sm:text-sm text-gray-600">
                  <li>• Short-form animations with thought-provoking life lessons</li>
                  <li>• Long-form anime series for audiences of all ages</li>
                  <li>• Cinematic storytelling with meaningful messages</li>
                  <li>• 3D animation expertise using industry-leading tools</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Our Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                  We are a global community of dreamers, artists, and storytellers. Our independence allows us to stay
                  true to our values while pushing the boundaries of what's possible in animation.
                </p>
                <ul className="space-y-1 sm:space-y-1.5 lg:space-y-2 text-xs sm:text-sm text-gray-600">
                  <li>• Independent studio free from corporate compromise</li>
                  <li>• Global team of passionate creators</li>
                  <li>• Community-driven approach to storytelling</li>
                  <li>• Commitment to authentic, meaningful content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action Section */}
        <section className="mt-8 sm:mt-12 lg:mt-16 pt-8 sm:pt-12 lg:pt-16 border-t border-gray-200">
          <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 lg:mb-4">Be Part of Our Journey</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Every contribution, no matter the size, helps us bring our creative vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Join the Team */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-blue-100 rounded-full w-fit">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">Join the Team</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Explore openings and collaborate with us.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/career">Visit Career Page</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Watch & Subscribe */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-red-100 rounded-full w-fit">
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" />
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">Watch & Subscribe</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enjoy our latest animations on YouTube.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
                    Visit YouTube Channel
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Support Our Mission */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-orange-100 rounded-full w-fit">
                  <Coffee className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">Support Our Mission</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Buy us a coffee and support independent anime.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Link href="/support">Buy Me a Coffee</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Have Questions */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-green-100 rounded-full w-fit">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">Have Questions?</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Read our FAQ to learn more.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Link href="/faq">Visit FAQ Page</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Get in Touch */}
            <Card className="text-center hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-2">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-2.5 lg:p-3 bg-blue-100 rounded-full w-fit">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">Get in Touch</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Have a business inquiry or collaboration opportunity? We'd love to hear from you.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
