// app/faq/FaqPageClient.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Mail,
  Heart,
  Users,
  Shield,
  FileText,
  Eye,
  BookOpen,
  Play,
  Gamepad2,
  Briefcase,
  Copyright,
  Cookie,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"

// --- NEW: FAQ entry interface
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  relatedQuestions: string[];
}

// --- NOW accepts faqData as a prop
export default function FaqPageClient({ faqData }: { faqData: FaqEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])

  const categories = [
    "All Categories",
    "About Flavor Studios",
    "General & Contact",
    "Support & Donations",
    "Legal & Privacy",
    "Blog & Watch Pages",
    "Technical & Notifications",
  ]

  // All filtering and mapping logic uses the prop, not internal constant
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const popularQuestions = faqData.filter((faq) => faq.tags.includes("popular"))
  const recentQuestions = faqData.filter((faq) => faq.tags.includes("new"))

  // ... quickLinks unchanged ...
  const quickLinks = [
    {
      title: "Support Us",
      href: "/support",
      icon: Heart,
      description: "Learn how you can support our content creation and animation projects.",
    },
    {
      title: "Contact",
      href: "/contact",
      icon: Mail,
      description: "Get in touch with our team directly for personalized assistance.",
    },
    {
      title: "About Us",
      href: "/about",
      icon: Users,
      description: "Discover our story, mission, and the team behind Flavor Studios.",
    },
    {
      title: "Privacy Policy",
      href: "/privacy-policy",
      icon: Shield,
      description: "Understand how we protect and handle your personal data.",
    },
    {
      title: "Terms of Service",
      href: "/terms-of-service",
      icon: FileText,
      description: "Review the rules and guidelines for using our services.",
    },
    {
      title: "Media Usage Policy",
      href: "/media-usage-policy",
      icon: Eye,
      description: "Guidelines for using our content in your own projects.",
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
      description: "Read our latest articles about anime, storytelling, and animation.",
    },
    {
      title: "Watch",
      href: "/watch",
      icon: Play,
      description: "Explore our original anime content and video creations.",
    },
    {
      title: "Play",
      href: "/play",
      icon: Gamepad2,
      description: "Try our interactive games and entertainment experiences.",
    },
    {
      title: "Careers",
      href: "/career",
      icon: Briefcase,
      description: "Join our team and help create amazing anime content.",
    },
    {
      title: "DMCA",
      href: "/dmca",
      icon: Copyright,
      description: "Information about copyright and content protection policies.",
    },
    {
      title: "Cookie Policy",
      href: "/cookie-policy",
      icon: Cookie,
      description: "Learn about how we use cookies to improve your experience.",
    },
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">Help & Support</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Flavor Studios, our content, and how to get involved.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 sm:mb-12">
          <div className="relative mb-4 sm:mb-6 max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center max-w-4xl mx-auto">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "secondary"}
                className="cursor-pointer hover:bg-blue-600 hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Most Popular Questions */}
        {selectedCategory === "All Categories" && !searchQuery && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Most Popular Questions</h2>
            <div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto">
              {popularQuestions.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{faq.question}</h3>
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedQuestions.includes(faq.id) ? (
                            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedQuestions.includes(faq.id) && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t bg-gray-50">
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 mt-3 sm:mt-4">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xs text-gray-500">Was this helpful?</span>
                          <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Questions */}
        {selectedCategory === "All Categories" && !searchQuery && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Recently Added Questions</h2>
            <div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto">
              {recentQuestions.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{faq.question}</h3>
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                            New
                          </Badge>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedQuestions.includes(faq.id) ? (
                            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedQuestions.includes(faq.id) && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t bg-gray-50">
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 mt-3 sm:mt-4">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xs text-gray-500">Was this helpful?</span>
                          <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Questions by Category */}
        <section className="mb-8 sm:mb-12">
          {selectedCategory !== "All Categories" && (
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{selectedCategory}</h2>
          )}

          {selectedCategory === "All Categories" && !searchQuery ? (
            categories
              .slice(1)
              .map((category) => {
                const categoryFAQs = faqData.filter((faq) => faq.category === category)
                if (categoryFAQs.length === 0) return null

                return (
                  <div key={category} className="mb-8 sm:mb-12">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">{category}</h3>
                    <div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto">
                      {categoryFAQs.map((faq) => (
                        <Card key={faq.id} id={faq.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleQuestion(faq.id)}
                              className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                  <h4 className="font-semibold text-sm sm:text-base">{faq.question}</h4>
                                  {faq.tags.includes("popular") && (
                                    <Badge variant="secondary" className="text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                  {faq.tags.includes("new") && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-green-200 text-green-700 bg-green-50"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  {expandedQuestions.includes(faq.id) ? (
                                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                  )}
                                </div>
                              </div>
                            </button>
                            {expandedQuestions.includes(faq.id) && (
                              <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t bg-gray-50">
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 mt-3 sm:mt-4">
                                  {faq.answer}
                                </p>

                                {faq.relatedQuestions.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2 text-center">
                                      Related Questions:
                                    </p>
                                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                                      {faq.relatedQuestions.map((relatedId) => {
                                        const relatedFAQ = faqData.find((f) => f.id === relatedId)
                                        return relatedFAQ ? (
                                          <Button
                                            key={relatedId}
                                            variant="outline"
                                            size="sm"
                                            className="h-6 sm:h-7 text-xs px-2"
                                            onClick={() => {
                                              const element = document.getElementById(relatedId)
                                              element?.scrollIntoView({ behavior: "smooth" })
                                            }}
                                          >
                                            {relatedFAQ.question}
                                          </Button>
                                        ) : null
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 justify-center">
                                  <span className="text-xs text-gray-500">Was this helpful?</span>
                                  <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                                    <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                                    <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })
          ) : (
            <div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id} id={faq.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleQuestion(faq.id)}
                        className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">{faq.question}</h4>
                            {faq.tags.includes("popular") && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                            {faq.tags.includes("new") && (
                              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {expandedQuestions.includes(faq.id) ? (
                              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </button>
                      {expandedQuestions.includes(faq.id) && (
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t bg-gray-50">
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 mt-3 sm:mt-4">
                            {faq.answer}
                          </p>

                          {faq.relatedQuestions.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-700 mb-2 text-center">Related Questions:</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                                {faq.relatedQuestions.map((relatedId) => {
                                  const relatedFAQ = faqData.find((f) => f.id === relatedId)
                                  return relatedFAQ ? (
                                    <Button
                                      key={relatedId}
                                      variant="outline"
                                      size="sm"
                                      className="h-6 sm:h-7 text-xs px-2"
                                      onClick={() => {
                                        const element = document.getElementById(relatedId)
                                        element?.scrollIntoView({ behavior: "smooth" })
                                      }}
                                    >
                                      {relatedFAQ.question}
                                    </Button>
                                  ) : null
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-xs text-gray-500">Was this helpful?</span>
                            <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                              <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 sm:h-8 px-2">
                              <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No questions found</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("All Categories")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* Still Have Questions */}
        <section className="mb-8 sm:mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6 sm:p-8 text-center">
              <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">Still have questions?</h2>
              <p className="text-sm sm:text-base text-blue-800 mb-4 sm:mb-6 max-w-2xl mx-auto">
                If you couldn&apos;t find the answer you were looking for, feel free to reach out to us directly.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 px-6 sm:px-8">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Quick Links</h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
            Explore related pages and resources to get the most out of Flavor Studios.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Card key={link.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1">{link.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">{link.description}</p>
                        <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-xs">
                          <Link href={link.href}>
                            Visit
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Featured Resources */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Featured Resources</h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">For Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>Blender Tutorials & Tips</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>3D Animation Techniques</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>Storytelling & Themes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">For Anime Fans</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>Latest Anime Reviews</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>Our Original Content</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-600">→</span>
                    <span>Hidden Anime Gems</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
