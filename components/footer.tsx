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

  // UPDATED: Changed first link to Home, and Studio -> Company below
  const companyLinks = [
    { name: "Home", href: "/" },
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
    { name: "Usage Policy", href: "/media-usage-policy", ariaLabel: "Media Usage Policy" },
  ]

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-6 md:gap-8 lg:gap-10">
          {/* Brand Section - Takes more space */}
          <div className="space-y-5 lg:pr-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Flavor Studios</span>
            </Link>
            <p className="text-white text-sm leading-relaxed">
              Crafting stories with soul, one frame at a time. Flavor Studios is a global animation studio dedicated to
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth,
              we aim to inspire, heal, and connect audiences worldwide.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild className="hover:bg-blue-600 h-8 w-8">
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4 text-white" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Company Links (was Studio) */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white hover:text-gray-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Discover</h3>
            <ul className="space-y-3">
              {discoverLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white hover:text-gray-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-gray-400 transition-colors text-sm"
                    aria-label={link.ariaLabel}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white mt-8 pt-6 text-center space-y-2">
          <p className="text-white text-sm">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-white text-xs">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
