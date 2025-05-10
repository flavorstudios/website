import Link from "next/link"
import { Youtube, Facebook, Instagram, Twitter, AtSign, Send, MessageCircle, BookOpen } from "lucide-react"

const socialLinks = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@flavorstudios",
    icon: <Youtube className="h-5 w-5" />,
    color: "hover:text-red-500",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/flavourstudios",
    icon: <Facebook className="h-5 w-5" />,
    color: "hover:text-blue-500",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/flavorstudios",
    icon: <Instagram className="h-5 w-5" />,
    color: "hover:text-pink-500",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/flavor_studios",
    icon: <Twitter className="h-5 w-5" />,
    color: "hover:text-blue-400",
  },
  {
    name: "Threads",
    href: "https://www.threads.net/@flavorstudios",
    icon: <AtSign className="h-5 w-5" />,
    color: "hover:text-gray-400",
  },
  {
    name: "Telegram",
    href: "https://t.me/flavorstudios",
    icon: <Send className="h-5 w-5" />,
    color: "hover:text-blue-500",
  },
  {
    name: "Discord",
    href: "https://discord.com/channels/@flavorstudios",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "hover:text-indigo-500",
  },
  {
    name: "Reddit",
    href: "https://www.reddit.com/r/flavorstudios/",
    icon: <BookOpen className="h-5 w-5" />,
    color: "hover:text-orange-500",
  },
]

interface SocialLinksProps {
  className?: string
}

export default function SocialLinks({ className }: SocialLinksProps = {}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {socialLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-colors hover:bg-primary/10 ${link.color}`}
          aria-label={link.name}
        >
          {link.icon}
        </Link>
      ))}
    </div>
  )
}
