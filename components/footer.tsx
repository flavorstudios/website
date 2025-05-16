"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Send, LayoutGrid } from "lucide-react"
import { FaReddit, FaDiscord } from "react-icons/fa"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-orbitron font-bold text-3xl md:text-4xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
                fL
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">Crafting soulful stories, one frame at a time.</p>
            <p className="text-gray-400 mb-6 max-w-md">
              Flavor Studios is a global animation studio creating meaningful 3D animations and original anime. With
              powerful storytelling and emotional depth, we aim to inspire, heal, and connect audiences worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="https://www.youtube.com/@flavorstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors hover:scale-110"
              >
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </Link>
              <Link
                href="https://www.facebook.com/flavourstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors hover:scale-110"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://www.instagram.com/flavorstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors hover:scale-110"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com/flavor_studios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sky-500 transition-colors hover:scale-110"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://www.threads.net/@flavorstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors hover:scale-110"
              >
                <LayoutGrid className="h-6 w-6" />
                <span className="sr-only">Threads</span>
              </Link>
              <Link
                href="https://t.me/flavorstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors hover:scale-110"
              >
                <Send className="h-6 w-6" />
                <span className="sr-only">Telegram</span>
              </Link>
              <Link
                href="https://discord.com/channels/@flavorstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors hover:scale-110"
              >
                <FaDiscord className="h-6 w-6" />
                <span className="sr-only">Discord</span>
              </Link>
              <Link
                href="https://www.reddit.com/r/flavorstudios/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors hover:scale-110"
              >
                <FaReddit className="h-6 w-6" />
                <span className="sr-only">Reddit</span>
              </Link>
            </div>
          </div>

          {/* Studio Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Studio</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-white transition-colors">
                  Career
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Discover</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/watch" className="hover:text-white transition-colors">
                  Watch
                </Link>
              </li>
              <li>
                <Link href="/play" className="hover:text-white transition-colors">
                  Play
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-white transition-colors">
                  DMCA
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/media-usage-policy" className="hover:text-white transition-colors">
                  Media Usage Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 italic">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
