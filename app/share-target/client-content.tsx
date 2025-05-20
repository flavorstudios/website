"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShareTargetClientContent() {
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
  )
}
