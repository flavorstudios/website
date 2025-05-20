"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Share2, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShareTargetPage() {
  const [sharedData, setSharedData] = useState<{
    title?: string
    text?: string
    url?: string
  }>({})
  const [copied, setCopied] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Parse URL parameters to get shared content
    const params = new URLSearchParams(window.location.search)
    const title = params.get("title") || ""
    const text = params.get("text") || ""
    const url = params.get("url") || ""

    setSharedData({ title, text, url })
    setIsLoaded(true)
  }, [])

  const copyToClipboard = async () => {
    const contentToCopy = [
      sharedData.title && `Title: ${sharedData.title}`,
      sharedData.text && `${sharedData.text}`,
      sharedData.url && `Link: ${sharedData.url}`,
    ]
      .filter(Boolean)
      .join("\n\n")

    try {
      await navigator.clipboard.writeText(contentToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 mb-8 border border-primary/20 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-orbitron tracking-tight">
              Shared Content
            </h1>
            <p className="text-lg text-muted-foreground">Content shared with Flavor Studios will appear below.</p>
          </div>
        </div>
      </section>

      {/* Shared Content Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="overflow-hidden border border-primary/20">
                <motion.div
                  initial={{ boxShadow: "0 0 0 rgba(124, 58, 237, 0)" }}
                  animate={{ boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)" }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: 0,
                  }}
                  className="rounded-lg"
                >
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="flex items-center">
                      <Share2 className="h-5 w-5 mr-2 text-primary" />
                      Shared Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {sharedData.title && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                        <p className="text-lg font-medium">{sharedData.title}</p>
                      </div>
                    )}

                    {sharedData.text && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Text</h3>
                        <p className="whitespace-pre-wrap">{sharedData.text}</p>
                      </div>
                    )}

                    {sharedData.url && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">URL</h3>
                        <a
                          href={sharedData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {sharedData.url}
                        </a>
                      </div>
                    )}

                    {!sharedData.title && !sharedData.text && !sharedData.url && (
                      <p className="text-muted-foreground italic">No content was shared.</p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-primary/5 border-t border-primary/10 flex justify-between">
                    <p className="text-sm text-muted-foreground">Shared with Flavor Studios</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center space-x-1"
                      disabled={!sharedData.title && !sharedData.text && !sharedData.url}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </motion.div>
              </Card>
            </motion.div>

            <div className="mt-12 text-center">
              <h2 className="text-xl font-bold mb-4 font-orbitron">What would you like to do next?</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/">Go to Homepage</Link>
                </Button>
                <Button asChild variant="outline" className="hover:bg-primary/10">
                  <Link href="/blog">Read Our Blog</Link>
                </Button>
                <Button asChild variant="outline" className="hover:bg-primary/10">
                  <Link href="/watch">Watch Videos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
