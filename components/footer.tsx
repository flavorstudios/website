"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, MessageCircle, Send, Github, LayoutGrid } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Main Links */}
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-4">Main Pages</h4>
            <nav className="grid grid-cols-1 gap-3">
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/watch" className="text-muted-foreground hover:text-primary transition-colors">
                Watch
              </Link>
              <Link href="/play" className="text-muted-foreground hover:text-primary transition-colors">
                Play
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
                Buy Me A Coffee
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/career" className="text-muted-foreground hover:text-primary transition-colors">
                Career
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-4">Legal & Policies</h4>
            <nav className="grid grid-cols-1 gap-3">
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/dmca" className="text-muted-foreground hover:text-primary transition-colors">
                DMCA
              </Link>
              <Link href="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <Link href="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                Disclaimer
              </Link>
              <Link href="/media-usage-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Media Usage Policy
              </Link>
            </nav>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-2">
            <h4 className="font-orbitron font-bold text-lg mb-4">Connect With Us</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-all duration-200 hover:translate-x-1"
              >
                <Youtube className="h-5 w-5" />
                <span>YouTube</span>
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-all duration-200 hover:translate-x-1"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-pink-500 transition-all duration-200 hover:translate-x-1"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-sky-500 transition-all duration-200 hover:translate-x-1"
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
              </Link>
              <Link
                href="https://threads.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-gray-300 transition-all duration-200 hover:translate-x-1"
              >
                <LayoutGrid className="h-5 w-5" />
                <span>Threads</span>
              </Link>
              <Link
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-400 transition-all duration-200 hover:translate-x-1"
              >
                <Send className="h-5 w-5" />
                <span>Telegram</span>
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-indigo-400 transition-all duration-200 hover:translate-x-1"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Discord</span>
              </Link>
              <Link
                href="https://reddit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-orange-500 transition-all duration-200 hover:translate-x-1"
              >
                <Github className="h-5 w-5" />
                <span>Reddit</span>
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                Join our community to get the latest updates, behind-the-scenes content, and exclusive opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center">
          <p className="text-sm text-muted-foreground">© {currentYear} Flavor Studios. All Rights Reserved.</p>
          <p className="text-xs text-muted-foreground mt-2 italic">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
