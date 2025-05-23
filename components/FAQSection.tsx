"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

interface FAQItem {
  question: string
  answer: string
  isPopular?: boolean
  isNew?: boolean
  relatedQuestions?: string[]
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    title: "About Flavor Studios",
    items: [
      {
        question: "What is Flavor Studios?",
        answer:
          "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.",
        isPopular: true,
      },
      {
        question: "Do you create original anime?",
        answer:
          "While we primarily focus on anime analysis, reviews, and educational content, we also produce short-form original animations. Our long-term goal is to release full-length original anime series, and we're actively working toward that vision.",
        relatedQuestions: ["How often do you release new content?", "Where can I find all your content?"],
      },
      {
        question: "Where can I find all your content?",
        answer:
          "You can explore our content on our website, YouTube channel, and social media platforms. For the most organized and up-to-date collection—including blogs, videos, and interactive features—this website is your best destination.",
      },
    ],
  },
  {
    title: "General & Contact",
    items: [
      {
        question: "How long does it take to get a response?",
        answer:
          "We typically respond to all inquiries within 24 to 48 hours on business days. For urgent matters, please mention it in the subject line.",
      },
      {
        question: "Do you accept guest blog posts or collaborations?",
        answer:
          "Yes! We occasionally feature guest writers and collaborate with fellow creators. Please reach out through our Contact Page with your proposal and work samples.",
        relatedQuestions: ["Can I suggest topics for future videos or blog posts?"],
      },
      {
        question: "Can I visit Flavor Studios in person?",
        answer: "We're a digital-first studio and do not currently offer in-person visits.",
      },
      {
        question: "How can I report a technical issue with the website?",
        answer:
          'Use the contact form, select "Support," and describe your issue. Screenshots and browser/device info are helpful.',
        relatedQuestions: ["The website or video isn't working properly. What should I do?"],
      },
      {
        question: "Can I suggest topics for future videos or blog posts?",
        answer:
          "Share your ideas via the contact form or comment on our social media posts. We review all suggestions with care.",
        isNew: true,
      },
    ],
  },
  {
    title: "Support & Donations",
    items: [
      {
        question: "How can I support Flavor Studios?",
        answer:
          "You can support us by subscribing to our YouTube channel, sharing our content, or donating through our Buy Me a Coffee page: https://buymeacoffee.com/flavorstudios",
        isPopular: true,
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes. We use Stripe through Buy Me a Coffee for all transactions, with bank-level encryption. We never store your full payment data.",
      },
      {
        question: "Do I need an account to donate?",
        answer: "No, you can donate directly—no registration required.",
      },
      {
        question: "Where does my donation go?",
        answer:
          "Your support helps fund animation tools, site hosting, and our original projects like anime production and studio upgrades.",
        relatedQuestions: ["Do I receive anything for donating?"],
      },
      {
        question: "Do I receive anything for donating?",
        answer:
          "Yes. Depending on your donation, you may receive shoutouts, early previews, or behind-the-scenes access.",
        isNew: true,
      },
    ],
  },
  {
    title: "Legal & Privacy",
    items: [
      {
        question: "Where can I find your legal and privacy policies?",
        answer:
          "All policies—including Privacy, Terms, DMCA, and Cookie Policy—are linked in the footer of every page.",
      },
      {
        question: "Do you collect personal data?",
        answer:
          "Only essential information like your name or email, used solely for communication. See our Privacy Policy for details.",
        relatedQuestions: ["Is my personal data protected?", "How do you handle cookies and trackers?"],
      },
      {
        question: "How do you handle cookies and trackers?",
        answer:
          "We use cookies to improve your experience. You can adjust your preferences via the CookieYes banner on our site.",
      },
      {
        question: "Can I use your content in my own projects?",
        answer:
          "Our content is protected by copyright. For educational use or limited excerpts, see our Media Usage Policy. For commercial use or substantial portions, contact us for permission.",
        isNew: true,
      },
    ],
  },
  {
    title: "Blog & Watch Pages",
    items: [
      {
        question: "How do you select which anime to review?",
        answer:
          "We review popular releases, classics, and hidden gems—based on team interests, trends, and community requests.",
      },
      {
        question: "How often do you release new content?",
        answer:
          "Blog posts go up 2 to 3 times per week. Animated videos are released weekly, though timelines may vary during larger productions.",
        isPopular: true,
      },
    ],
  },
  {
    title: "Technical & Notifications",
    items: [
      {
        question: "The website or video isn't working properly. What should I do?",
        answer:
          "Refresh your browser or clear your cache. If issues persist, report them via the contact form with full details.",
      },
      {
        question: "Do you have a mobile app?",
        answer:
          "Not yet. However, our website is a Progressive Web App (PWA), allowing you to install it on your phone or desktop for an app-like experience, including offline access.",
        isNew: true,
      },
      {
        question: "How can I be notified of new content?",
        answer:
          "Subscribe to our newsletter, enable YouTube notifications, or follow us on Instagram, Threads, and X for updates.",
      },
      {
        question: "Is my personal data protected?",
        answer:
          "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
      },
    ],
  },
]

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  id: string
  isPopular?: boolean
  isNew?: boolean
  relatedQuestions?: string[]
  onRelatedQuestionClick: (question: string) => void
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
  isPopular,
  isNew,
  relatedQuestions,
  onRelatedQuestionClick,
}: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    } else {
      setContentHeight(0)
    }
  }, [isOpen])

  // Format links in answers
  const formatAnswer = (text: string) => {
    // Simple regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className="border border-primary/10 rounded-lg bg-card/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-colors duration-200 hover:bg-primary/5"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-${id}`}
        id={`button-${id}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg font-medium pr-4">{question}</h3>
            {isPopular && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary ml-2">
                Popular
              </span>
            )}
            {isNew && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  repeatDelay: 2,
                }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 ml-2"
              >
                New
              </motion.span>
            )}
          </div>
          <div
            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      <div
        id={`content-${id}`}
        role="region"
        aria-labelledby={`button-${id}`}
        style={{ height: isOpen ? `${contentHeight}px` : "0" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div ref={contentRef} className="px-6 pb-4">
          <div className="pt-2 border-t border-primary/10">
            <p className="text-muted-foreground leading-relaxed mt-3">{formatAnswer(answer)}</p>

            {relatedQuestions && relatedQuestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Related Questions:</p>
                <ul className="space-y-1">
                  {relatedQuestions.map((relatedQuestion, index) => (
                    <li key={index}>
                      <button
                        onClick={() => onRelatedQuestionClick(relatedQuestion)}
                        className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-1"
                      >
                        {relatedQuestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Was this helpful?</div>
              <div className="flex space-x-2">
                <button className="text-sm px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                  Yes
                </button>
                <button className="text-sm px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<FAQCategory[]>(faqData)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [newItemsCount, setNewItemsCount] = useState(0)

  // Count new items
  useEffect(() => {
    const count = faqData.reduce((acc, category) => {
      return acc + category.items.filter((item) => item.isNew).length
    }, 0)
    setNewItemsCount(count)
  }, [])

  // Get popular questions
  const popularQuestions = faqData.flatMap((category) => category.items.filter((item) => item.isPopular)).slice(0, 3)

  // Handle search and filtering
  useEffect(() => {
    if (!searchTerm && !activeCategory) {
      setFilteredData(faqData)
      return
    }

    let filtered = faqData

    // Filter by search term
    if (searchTerm) {
      filtered = faqData.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      // Remove empty categories
      filtered = filtered.filter((category) => category.items.length > 0)
    }

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter((category) => category.title === activeCategory)
    }

    setFilteredData(filtered)
  }, [searchTerm, activeCategory])

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId)
    } else {
      newOpenItems.add(itemId)
    }
    setOpenItems(newOpenItems)
  }

  const handleRelatedQuestionClick = (question: string) => {
    // Find the question and open it
    faqData.forEach((category, categoryIndex) => {
      category.items.forEach((item, itemIndex) => {
        if (item.question === question) {
          const itemId = `${categoryIndex}-${itemIndex}`
          setOpenItems(new Set([itemId]))

          // Scroll to the question
          const element = document.getElementById(`button-${itemId}`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }
      })
    })
  }

  const scrollToCategory = (categoryTitle: string) => {
    setActiveCategory(categoryTitle)

    // Scroll to category
    if (categoryRefs.current[categoryTitle]) {
      categoryRefs.current[categoryTitle]?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

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
              Frequently Asked <span className="text-primary">Questions</span>
              {newItemsCount > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 ml-4 text-sm rounded-full bg-green-500/20 text-green-400 align-middle"
                >
                  {newItemsCount} new
                </motion.span>
              )}
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed">
              Find answers to common questions about Flavor Studios, our content, and how to get involved.
            </p>

            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 bg-background border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                }`}
              >
                All Categories
              </button>
              {faqData.map((category, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCategory(category.title)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.title
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>

            {/* Popular Questions Section */}
            {!searchTerm && !activeCategory && popularQuestions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Most Popular Questions</h2>
                <div className="space-y-4">
                  {popularQuestions.map((item, index) => {
                    // Find the original item to get its ID
                    let itemId = ""
                    faqData.forEach((category, categoryIndex) => {
                      category.items.forEach((faqItem, itemIndex) => {
                        if (faqItem.question === item.question) {
                          itemId = `${categoryIndex}-${itemIndex}`
                        }
                      })
                    })

                    return (
                      <AccordionItem
                        key={`popular-${index}`}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openItems.has(itemId)}
                        onToggle={() => toggleItem(itemId)}
                        id={itemId}
                        isPopular={item.isPopular}
                        isNew={item.isNew}
                        relatedQuestions={item.relatedQuestions}
                        onRelatedQuestionClick={handleRelatedQuestionClick}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* New Questions Section */}
            {!searchTerm && !activeCategory && newItemsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">
                  <span className="text-primary">Recently Added</span> Questions
                </h2>
                <div className="space-y-4">
                  {faqData.flatMap((category, categoryIndex) =>
                    category.items
                      .filter((item) => item.isNew)
                      .map((item, itemIndex) => {
                        const itemId = `${categoryIndex}-${category.items.findIndex(
                          (i) => i.question === item.question,
                        )}`
                        return (
                          <motion.div
                            key={`new-${itemId}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                          >
                            <AccordionItem
                              question={item.question}
                              answer={item.answer}
                              isOpen={openItems.has(itemId)}
                              onToggle={() => toggleItem(itemId)}
                              id={itemId}
                              isPopular={item.isPopular}
                              isNew={item.isNew}
                              relatedQuestions={item.relatedQuestions}
                              onRelatedQuestionClick={handleRelatedQuestionClick}
                            />
                          </motion.div>
                        )
                      }),
                  )}
                </div>
              </motion.div>
            )}

            {/* No Results Message */}
            {filteredData.length === 0 && (
              <div className="text-center py-12 bg-primary/5 rounded-lg border border-primary/20">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-orbitron">No matching questions found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or browse all categories</p>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setActiveCategory(null)
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* FAQ Categories */}
            <div className="space-y-12">
              {filteredData.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="space-y-4 scroll-mt-24"
                  ref={(el) => (categoryRefs.current[category.title] = el)}
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">{category.title}</h2>

                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      const itemId = `${categoryIndex}-${itemIndex}`
                      return (
                        <AccordionItem
                          key={itemId}
                          question={item.question}
                          answer={item.answer}
                          isOpen={openItems.has(itemId)}
                          onToggle={() => toggleItem(itemId)}
                          id={itemId}
                          isPopular={item.isPopular}
                          isNew={item.isNew}
                          relatedQuestions={item.relatedQuestions}
                          onRelatedQuestionClick={handleRelatedQuestionClick}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 font-orbitron">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                If you couldn't find the answer you were looking for, feel free to reach out to us directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200"
              >
                Contact Us
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Quick Links */}
            <section className="mt-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron">Quick Links</h2>
                <p className="text-muted-foreground">
                  Explore related pages and resources to get the most out of Flavor Studios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Support Us",
                    description: "Learn how you can support our content creation and animation projects.",
                    link: "/support",
                    icon: "❤️",
                  },
                  {
                    title: "Contact",
                    description: "Get in touch with our team directly for personalized assistance.",
                    link: "/contact",
                    icon: "📧",
                  },
                  {
                    title: "About Us",
                    description: "Discover our story, mission, and the team behind Flavor Studios.",
                    link: "/about",
                    icon: "🎬",
                  },
                  {
                    title: "Privacy Policy",
                    description: "Understand how we protect and handle your personal data.",
                    link: "/privacy-policy",
                    icon: "🔒",
                  },
                  {
                    title: "Terms of Service",
                    description: "Review the rules and guidelines for using our services.",
                    link: "/terms-of-service",
                    icon: "📋",
                  },
                  {
                    title: "Media Usage Policy",
                    description: "Guidelines for using our content in your own projects.",
                    link: "/media-usage-policy",
                    icon: "📝",
                  },
                  {
                    title: "Blog",
                    description: "Read our latest articles about anime, storytelling, and animation.",
                    link: "/blog",
                    icon: "📚",
                  },
                  {
                    title: "Watch",
                    description: "Explore our original anime content and video creations.",
                    link: "/watch",
                    icon: "🎥",
                  },
                  {
                    title: "Play",
                    description: "Try our interactive games and entertainment experiences.",
                    link: "/play",
                    icon: "🎮",
                  },
                  {
                    title: "Careers",
                    description: "Join our team and help create amazing anime content.",
                    link: "/career",
                    icon: "💼",
                  },
                  {
                    title: "DMCA",
                    description: "Information about copyright and content protection policies.",
                    link: "/dmca",
                    icon: "⚖️",
                  },
                  {
                    title: "Cookie Policy",
                    description: "Learn about how we use cookies to improve your experience.",
                    link: "/cookie-policy",
                    icon: "🍪",
                  },
                ].map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-card/50 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 font-orbitron group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{link.description}</p>
                        <Link
                          href={link.link}
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors group-hover:underline"
                        >
                          Visit
                          <svg
                            className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Featured Resources */}
              <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h3 className="text-xl font-bold mb-4 font-orbitron">Featured Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">For Creators</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link href="/blog/category/blender-tutorials" className="hover:text-primary transition-colors">
                          → Blender Tutorials & Tips
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog/category/3d-animation-tips" className="hover:text-primary transition-colors">
                          → 3D Animation Techniques
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/blog/category/storytelling-themes"
                          className="hover:text-primary transition-colors"
                        >
                          → Storytelling & Themes
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">For Anime Fans</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link href="/blog/category/anime-reviews" className="hover:text-primary transition-colors">
                          → Latest Anime Reviews
                        </Link>
                      </li>
                      <li>
                        <Link href="/watch/category/original-anime" className="hover:text-primary transition-colors">
                          → Our Original Content
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog/category/underrated-gems" className="hover:text-primary transition-colors">
                          → Hidden Anime Gems
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
