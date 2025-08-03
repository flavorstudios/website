import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
  Users,
} from "lucide-react"

interface SocialIconsProps {
  /** Display icons in brand colors when set to "color". Defaults to monochrome */
  variant?: "mono" | "color"
  /** Additional Tailwind classes for the container */
  className?: string
}

const SOCIAL_LINKS = [
  { name: "YouTube", href: "https://www.youtube.com/@flavorstudios", icon: Youtube, color: "#FF0000" },
  { name: "Facebook", href: "https://www.facebook.com/flavourstudios", icon: Facebook, color: "#1877F2" },
  { name: "Instagram", href: "https://www.instagram.com/flavorstudios", icon: Instagram, color: "#E4405F" },
  { name: "Twitter", href: "https://twitter.com/flavor_studios", icon: Twitter, color: "#1DA1F2" },
  { name: "Discord", href: "https://discord.com/channels/@flavorstudios", icon: MessageCircle, color: "#5865F2" },
  { name: "Telegram", href: "https://t.me/flavorstudios", icon: Send, color: "#0088CC" },
  { name: "Threads", href: "https://www.threads.net/@flavorstudios", icon: MessageCircle, color: "#000000" },
  { name: "Reddit", href: "https://www.reddit.com/r/flavorstudios/", icon: Users, color: "#FF4500" },
]

export function SocialIcons({ variant = "mono", className }: SocialIconsProps) {
  return (
    <div className={cn("flex flex-wrap sm:flex-nowrap gap-4", className)}>
      {SOCIAL_LINKS.map((social) => (
        <Link
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded transition-transform duration-200 hover:scale-110 hover:shadow-[0_0_8px_currentColor]",
            variant === "mono" && "text-white hover:text-white"
          )}
          style={variant === "color" ? { color: social.color } : undefined}
        >
          <social.icon className="h-4 w-4" />
          <span className="sr-only">{social.name}</span>
        </Link>
      ))}
    </div>
  )
}

export { SOCIAL_LINKS }
