import Link from "next/link"

import { Youtube, Facebook, Instagram, Twitter, MessageCircle, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

  const quickLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Watch", href: "/watch" },
    { name: "Support", href: "/support" },
    { name: "Contact", href: "/contact" },
    { name: "Career", href: "/career" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "DMCA Policy", href: "/dmca" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Media Usage Policy", href: "/media-usage-policy" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Flavor Studios</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Independent anime studio creating original content and sharing the latest anime news with passionate fans
              worldwide.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild className="hover:bg-blue-600">
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
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
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">Get the latest anime news and updates from Flavor Studios.</p>
            <div className="space-y-2">
              <Input type="email" placeholder="Enter your email" className="bg-gray-800 border-gray-700 text-white" />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-gray-500 text-xs">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
