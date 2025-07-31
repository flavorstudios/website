"use client"

import { Button } from "@/components/ui/button"
import { Share2, Twitter, Facebook, Linkedin } from "lucide-react"

interface SocialShareProps {
  url: string
  title: string
  description?: string
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const shareData = {
    title,
    text: description,
    url,
  }

  const handleNativeShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  return (
    <div className="flex items-center gap-2">
      {typeof navigator.share === "function" && (
        <Button onClick={handleNativeShare} size="sm" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}

      <Button asChild size="sm" variant="outline">
        <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild size="sm" variant="outline">
        <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild size="sm" variant="outline">
        <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}
