"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, FileText, Video, FolderOpen, ArrowUp, ArrowDown, Loader2, Bot, Send } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAll, type SearchResultItem } from "@/lib/search"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function PopupSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [activeTab, setActiveTab] = useState<"search" | "ai">("search")
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([])

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const aiInputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 200)

  // Handle search
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchAll(debouncedQuery)
        setResults(searchResults)
        setSelectedIndex(-1)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // Auto-focus when popup opens
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "search" && inputRef.current) {
        inputRef.current.focus()
      } else if (activeTab === "ai" && aiInputRef.current) {
        aiInputRef.current.focus()
      }

      // Simulate AI welcome message when popup opens
      if (aiMessages.length === 0) {
        setAiMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm the Flavor Studios AI assistant. How can I help you find content or answer questions about our studio?",
          },
        ])
      }
    }
  }, [isOpen, activeTab, aiMessages.length])

  // Handle ESC key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        return
      }

      if (!isOpen || activeTab !== "search") return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            window.location.href = results[selectedIndex].url
            setIsOpen(false)
          }
          break
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, results, selectedIndex, activeTab])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  // Reset search when closing
  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
    setSelectedIndex(-1)
  }

  // Handle AI query submission
  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!aiResponse.trim()) return

    const userMessage = aiResponse.trim()
    setAiMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setAiResponse("")
    setIsAiLoading(true)

    // Simulate AI response (in a real implementation, this would call the Vercel AI SDK)
    setTimeout(() => {
      let response = ""

      // Simple pattern matching for demo purposes
      if (userMessage.toLowerCase().includes("anime") || userMessage.toLowerCase().includes("animation")) {
        response =
          "Flavor Studios specializes in anime-inspired content! Check out our Watch section for our latest animations and visual stories."
      } else if (userMessage.toLowerCase().includes("blog") || userMessage.toLowerCase().includes("article")) {
        response =
          "We have many blog posts about animation, storytelling, and creative processes. You can find them in our Blog section."
      } else if (userMessage.toLowerCase().includes("game") || userMessage.toLowerCase().includes("play")) {
        response =
          "We have interactive experiences in our Play section! Currently, you can try our Tic-Tac-Toe game while we develop more content."
      } else if (userMessage.toLowerCase().includes("contact") || userMessage.toLowerCase().includes("support")) {
        response =
          "You can reach out to us through our Contact page or support us via the Buy Me A Coffee button in the header."
      } else {
        response =
          "That's an interesting question! You might find relevant content in our Blog or Watch sections. Feel free to explore our site for more information."
      }

      setAiMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsAiLoading(false)

      // Focus back on input after response
      if (aiInputRef.current) {
        aiInputRef.current.focus()
      }
    }, 1500)
  }

  // Get icon based on result type
  const getResultIcon = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 mr-2 text-primary" />
      case "watch":
        return <Video className="h-4 w-4 mr-2 text-primary" />
      case "blog-category":
      case "watch-category":
        return <FolderOpen className="h-4 w-4 mr-2 text-primary" />
      default:
        return null
    }
  }

  // Get label based on result type
  const getResultTypeLabel = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "blog":
        return "Blog"
      case "watch":
        return "Video"
      case "blog-category":
        return "Blog Category"
      case "watch-category":
        return "Video Category"
      default:
        return ""
    }
  }

  // Client-side highlight function
  const highlightMatchClient = (text: string, query: string) => {
    if (!query || !text) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (!lowerText.includes(lowerQuery)) return text

    const parts = []
    let lastIndex = 0

    let index = lowerText.indexOf(lowerQuery)
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</span>)
      }

      parts.push(
        <span key={`highlight-${index}`} className="bg-primary/20 text-primary font-medium rounded px-0.5">
          {text.substring(index, index + query.length)}
        </span>,
      )

      lastIndex = index + query.length
      index = lowerText.indexOf(lowerQuery, lastIndex)
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>)
    }

    return <>{parts}</>
  }

  return (
    <>
      {/* Search Icon Button - Increased size */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-[#121212] border border-gray-700/50 rounded-full px-4 py-2.5 hover:border-gray-600/50 transition-all duration-200 group"
        aria-label="Open search"
      >
        <Search className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
        <span className="text-gray-400 text-sm font-poppins group-hover:text-gray-300 transition-colors hidden sm:inline">
          Search Flavor Studios...
        </span>
      </button>

      {/* Popup Overlay */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-20 px-4",
            "animate-in fade-in-0 duration-300",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose()
            }
          }}
        >
          <div
            ref={searchRef}
            className={cn(
              "w-full max-w-2xl bg-background/95 backdrop-blur-md rounded-lg border shadow-2xl",
              "animate-in slide-in-from-top-5 duration-300",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabs */}
            <Tabs
              defaultValue="search"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "search" | "ai")}
              className="w-full"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <TabsList className="grid w-[200px] grid-cols-2">
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                </TabsList>
                <button
                  onClick={handleClose}
                  className="h-8 w-8 flex items-center justify-center hover:bg-muted/50 rounded-md transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Search Tab */}
              <TabsContent value="search" className="mt-0">
                {/* Search Input */}
                <div className="p-4 border-b">
                  <div className="flex items-center rounded-md border bg-background">
                    <Search className="h-5 w-5 ml-3 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search Flavor Studios..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg font-poppins"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {(query || isLoading) && (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Searching...
                        </div>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="py-2" ref={resultsRef}>
                        {results.map((result, index) => (
                          <Link
                            key={`${result.url}-${index}`}
                            href={result.url}
                            onClick={handleClose}
                            className={cn(
                              "block px-4 py-3 hover:bg-muted/50 transition-colors",
                              selectedIndex === index && "bg-muted/70",
                            )}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex items-start">
                              {getResultIcon(result.type)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-base">
                                  {highlightMatchClient(result.title, debouncedQuery)}
                                </div>
                                <div className="text-sm text-muted-foreground truncate mt-1">
                                  {highlightMatchClient(result.description, debouncedQuery)}
                                </div>
                                <div className="mt-2 text-xs inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  {getResultTypeLabel(result.type)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : query ? (
                      <div className="p-6 text-center text-muted-foreground">No results found for "{query}"</div>
                    ) : null}

                    {results.length > 0 && (
                      <div className="px-4 py-3 border-t text-xs text-muted-foreground flex items-center justify-center space-x-4">
                        <span className="flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <ArrowDown className="h-3 w-3 mr-1" />
                          to navigate
                        </span>
                        <span className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mr-1">Enter</kbd>
                          to select
                        </span>
                        <span className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mr-1">Esc</kbd>
                          to close
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="mt-0">
                <div className="flex flex-col h-[60vh]">
                  {/* AI Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiMessages.map((message, index) => (
                      <div
                        key={index}
                        className={cn("flex items-start", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-2">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-4 py-2",
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-2">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <span className="animate-bounce delay-0">•</span>
                            <span className="animate-bounce delay-150">•</span>
                            <span className="animate-bounce delay-300">•</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Input Form */}
                  <form onSubmit={handleAiSubmit} className="border-t p-4">
                    <div className="flex items-center rounded-md border bg-background">
                      <Input
                        ref={aiInputRef}
                        type="text"
                        placeholder="Ask the Flavor Studios AI assistant..."
                        value={aiResponse}
                        onChange={(e) => setAiResponse(e.target.value)}
                        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        disabled={isAiLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10"
                        disabled={isAiLoading || !aiResponse.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      Ask about content, get recommendations, or find information about Flavor Studios
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  )
}
