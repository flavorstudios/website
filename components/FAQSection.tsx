"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

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
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-600">
      <button
        className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-colors duration-200 hover:bg-gray-700/30"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-${id}`}
        id={`button-${id}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-white font-poppins pr-4">{question}</h3>
            {isPopular && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary ml-2">
                Popular
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 ml-2">
                New
              </span>
            )}
          </div>
          <div
            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <svg
              className="w-4 h-4 text-gray-400"
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
          <div className="pt-2 border-t border-gray-700">
            <p className="text-gray-300 font-poppins leading-relaxed mt-3">{formatAnswer(answer)}</p>

            {relatedQuestions && relatedQuestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-400 mb-2">Related Questions:</p>
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
              <div className="text-sm text-gray-500">Was this helpful?</div>
              <div className="flex space-x-2">
                <button className="text-sm px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                  Yes
                </button>
                <button className="text-sm px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors">
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
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white font-orbitron">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400 font-poppins">Find answers to common questions about Flavor Studios</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-400 font-poppins"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null ? "bg-primary text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
                      ? "bg-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Questions Section */}
          {!searchTerm && !activeCategory && popularQuestions.length > 0 && (
            <div className="mb-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white font-orbitron mb-4">Most Popular Questions</h2>
              <div className="space-y-3">
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

          {/* No Results Message */}
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-600"
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
              <h3 className="text-xl font-bold text-white mb-2">No matching questions found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or browse all categories</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setActiveCategory(null)
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
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
                <h2 className="text-2xl md:text-3xl font-bold text-primary font-orbitron mb-6">{category.title}</h2>

                <div className="space-y-3">
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
          <div className="mt-16 text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-white font-orbitron">Still have questions?</h3>
              <p className="text-gray-300 mb-6 font-poppins">
                If you couldn't find the answer you were looking for, feel free to reach out to us directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors duration-200 font-poppins"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-8 text-center">
            <button
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              onClick={() => {
                const dialog = document.getElementById("keyboard-shortcuts")
                if (dialog instanceof HTMLDialogElement) {
                  dialog.showModal()
                }
              }}
            >
              Keyboard Shortcuts
            </button>

            <dialog
              id="keyboard-shortcuts"
              className="bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 p-0 backdrop:bg-black/50 max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
                  <button
                    onClick={() => {
                      const dialog = document.getElementById("keyboard-shortcuts")
                      if (dialog instanceof HTMLDialogElement) {
                        dialog.close()
                      }
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Search</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">/</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next question</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">↓</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous question</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">↑</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Expand/collapse</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Space</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Close dialog</span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Esc</kbd>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </section>
  )
}
