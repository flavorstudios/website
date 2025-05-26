import Link from "next/link"

import { Youtube, Facebook, Instagram, Twitter, MessageCircle, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com/@flavorstudios", icon: Youtube },
    { name: "Facebook", href: "https://www.facebook.com/flavourstudios", icon: Facebook },
    { name: "Instagram", href: "https://www.instagram.com/flavorstudios", icon: Instagram },
    { name: "Twitter", href: "https://twitter.com/flavor_studios", icon: Twitter },
    { name: "Discord", href: "https://discord.com/channels/@flavorstudios", icon: MessageCircle },
    { name: "Telegram", href: "https://t.me/flavorstudios", icon: Send },
    { name: "Threads", href: "https://www.threads.net/@flavorstudios", icon: MessageCircle },
    { name: "Reddit", href: "https://www.reddit.com/r/flavorstudios/", icon: Users },
  ]

  const studioLinks = [
    { name: "Studio", href: "/" },
    { name: "About", href: "/about" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ]

  const discoverLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Watch", href: "/watch" },
    { name: "Play", href: "/play" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/support" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "DMCA", href: "/dmca" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Media Usage Policy", href: "/media-usage-policy" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Brand Section */}
          <div className="space-y-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Flavor Studios</span>
            </Link>
            <p className="text-gray-400 text-sm leading-tight">
              Crafting stories with soul—one frame at a time. Flavor Studios is a global animation studio dedicated to
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth,
              we aim to inspire, heal, and connect audiences around the world.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild className="hover:bg-blue-600 h-8 w-8">
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-3.5 w-3.5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Studio Links */}
          <div>
            <h3 className="font-semibold text-lg mb-1.5">Studio</h3>
            <ul className="space-y-0.5">
              {studioLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold text-lg mb-1.5">Discover</h3>
            <ul className="space-y-0.5">
              {discoverLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-1.5">Legal</h3>
            <ul className="space-y-0.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-2 pt-2 text-center space-y-0.5">
          <p className="text-gray-400 text-sm">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-gray-500 text-xs">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
