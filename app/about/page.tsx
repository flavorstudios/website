import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Us – Flavor Studios: Where Anime Meets Emotion",
  description:
    "Discover Flavor Studios – an independent animation studio crafting powerful anime and 3D stories with soul. Built in Blender, powered by passion.",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Styled like Support page */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight">
              <span className="text-primary">About Flavor Studios</span>
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed">
              Crafting stories with soul—one frame at a time.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Who We Are</h2>

            <div className="space-y-4 text-lg">
              <p>
                Flavor Studios is a global, independent animation studio specializing in emotionally resonant 3D
                animated content and original anime series.
              </p>
              <p>
                Founded with a deep passion for authentic storytelling, we bring to life compelling narratives that
                explore universal themes such as life, loss, resilience, and redemption.
              </p>
              <p>
                Every project at Flavor Studios is developed entirely in-house using Blender, ensuring complete creative
                control and artistic integrity. Our work blends cinematic storytelling with meaningful
                messages—delivering both short-form animations that offer thought-provoking life lessons, and long-form
                anime series designed to captivate audiences of all ages.
              </p>
              <p>
                We are more than a studio—we are a community of dreamers, artists, and storytellers dedicated to pushing
                the boundaries of independent animation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Our Mission & Vision</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-5 pb-1">
                  <h3 className="text-lg font-bold mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To create emotionally resonant animations that inspire, entertain, and foster a global community of
                    animation enthusiasts while maintaining the highest standards of artistic integrity and
                    storytelling.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-5 pb-1">
                  <h3 className="text-lg font-bold mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To become a leading independent animation studio recognized for creating meaningful content that
                    transcends cultural boundaries and resonates with audiences worldwide, while remaining true to our
                    artistic values.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Why Choose Flavor Studios?</h2>

            <div className="border border-primary/10 rounded-lg p-5 bg-primary/5 mb-8">
              <ul className="space-y-4">
                {[
                  "Original, high-quality animations built from the ground up in Blender",
                  "Powerful storytelling rooted in emotional depth and universal values",
                  "Independent and community-driven—free from corporate compromise",
                  "A commitment to creativity, authenticity, and excellence in every frame",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-4 mt-1 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center animate-pulse-slow">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-lg">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Our Journey</h2>

            {/* Professional Timeline */}
            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden md:block">
                {/* Timeline Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-primary/30"></div>

                {[
                  {
                    year: "2021",
                    title: "The Beginning",
                    description: "Flavor Studios was founded as a one-person passion project.",
                    position: "left",
                  },
                  {
                    year: "2022",
                    title: "Team Expansion",
                    description: "One creator. One vision. Infinite possibilities.",
                    position: "right",
                  },
                  {
                    year: "2023",
                    title: "Foundations Laid",
                    description: "Mastering tools, crafting worlds, shaping our voice.",
                    position: "left",
                  },
                  {
                    year: "2024",
                    title: "Brand Born",
                    description: "Flavor Studios named. The mission took form.",
                    position: "right",
                  },
                  {
                    year: "Jan 2025 – Now",
                    title: "Studio Launched",
                    description: "Creating original anime and stories.",
                    position: "left",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative mb-16 last:mb-0">
                    <div className="flex items-center">
                      {/* Year in the center */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-background border-2 border-primary/30 rounded-full px-6 py-2 font-orbitron font-bold text-primary">
                          {item.year}
                        </div>
                      </div>

                      {/* Content - Left or Right based on position */}
                      {item.position === "left" ? (
                        <>
                          <div className="w-1/2 pr-12">
                            <div className="bg-card/50 p-5 rounded-lg border border-primary/10 shadow-md ml-auto mr-0 max-w-md">
                              <h3 className="text-xl font-bold mb-2 font-orbitron">{item.title}</h3>
                              <p className="text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="w-1/2"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2"></div>
                          <div className="w-1/2 pl-12">
                            <div className="bg-card/50 p-5 rounded-lg border border-primary/10 shadow-md mr-auto ml-0 max-w-md">
                              <h3 className="text-xl font-bold mb-2 font-orbitron">{item.title}</h3>
                              <p className="text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                ))}
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-primary/30"></div>

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
                    year: "Jan 2025 – Now",
                    title: "Studio Launched",
                    description: "Creating original anime and stories.",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative pl-12 pb-12 last:pb-0">
                    {/* Year badge */}
                    <div className="absolute left-0 transform -translate-x-1/2 mt-6 z-10">
                      <div className="bg-background border-2 border-primary/30 rounded-full px-3 py-1 font-orbitron font-bold text-primary text-sm">
                        {item.year}
                      </div>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-4 mt-7 transform -translate-x-1/2 w-2 h-2 rounded-full bg-primary"></div>

                    <div className="bg-card/50 p-4 rounded-lg border border-primary/10 shadow-md mt-4">
                      <h3 className="text-lg font-bold mb-1 font-orbitron">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Our Core Values</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Authenticity",
                  description: "We create stories that are genuine, honest, and true to our artistic vision.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Innovation",
                  description: "We constantly push boundaries and explore new techniques in animation.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Excellence",
                  description: "We strive for the highest quality in every aspect of our work.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Community",
                  description: "We value and nurture our community of fans, creators, and collaborators.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Integrity",
                  description: "We maintain ethical standards in all our business and creative decisions.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Passion",
                  description: "We pour our hearts into every project, driven by our love for animation.",
                  icon: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                      />
                    </svg>
                  ),
                },
              ].map((value, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-5 pb-1">
                    <div className="mb-3">{value.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section - Styled like Support page */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron">Be Part of Our Journey</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Every contribution, no matter the size, helps us bring our creative vision to life.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Join the Team",
                  description: "Explore openings and collaborate with us.",
                  buttonText: "Visit Career Page",
                  url: "/career",
                },
                {
                  title: "Watch & Subscribe",
                  description: "Enjoy our latest animations on YouTube.",
                  buttonText: "Visit YouTube Channel",
                  url: "https://www.youtube.com/@flavorstudios",
                },
                {
                  title: "Support Our Mission",
                  description: "Buy us a coffee and support independent anime.",
                  buttonText: "Buy Me a Coffee",
                  url: "https://www.flavorstudios.in/support",
                },
                {
                  title: "Have Questions?",
                  description: "Read our FAQ to learn more.",
                  buttonText: "Visit FAQ Page",
                  url: "/faq",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-5 pb-1">
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={item.url}
                        target={item.url.startsWith("http") ? "_blank" : undefined}
                        rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {item.buttonText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Styled like Support page */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron">Get in Touch</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Have a business inquiry or collaboration opportunity? We'd love to hear from you.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12 transition-all duration-300"
            >
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
