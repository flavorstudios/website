"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy, Check, Instagram, Send } from "lucide-react"

interface SocialShareProps {
  title: string
  excerpt: string
  url: string
  image?: string
}

export default function SocialShare({ title, excerpt, url, image }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareData = {
    title,
    text: excerpt,
    url,
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(excerpt)
  const encodedImage = image ? encodeURIComponent(image) : ""

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=FlavorStudios`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log("Error copying to clipboard:", error)
    }
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400")
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Share this post</h3>
        </div>

        {/* Responsive grid for share buttons: 1 col on mobile, more on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Facebook */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("facebook")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
          >
            <Facebook className="h-5 w-5" />
            <span className="text-xs">Facebook</span>
          </Button>

          {/* Twitter/X */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600"
          >
            <Twitter className="h-5 w-5" />
            <span className="text-xs">Twitter</span>
          </Button>

          {/* LinkedIn */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("linkedin")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-xs">LinkedIn</span>
          </Button>

          {/* WhatsApp */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("whatsapp")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">WhatsApp</span>
          </Button>

          {/* Telegram */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("telegram")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500"
          >
            <Send className="h-5 w-5" />
            <span className="text-xs">Telegram</span>
          </Button>

          {/* Email */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("email")}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600"
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs">Email</span>
          </Button>

          {/* Pinterest */}
          {image && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("pinterest")}
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-xs">Pinterest</span>
            </Button>
          )}

          {/* Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            <span className="text-xs">{copied ? "Copied!" : "Copy Link"}</span>
          </Button>
        </div>

        {/* Native Share (Mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleNativeShare}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </Button>
          </div>
        )}

        {/* Share Stats */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500 text-center">
            Help us reach more anime enthusiasts by sharing this post! 🌟
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
