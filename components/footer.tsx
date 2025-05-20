"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Send, LayoutGrid } from "lucide-react"
import { FaReddit, FaDiscord } from "react-icons/fa"
import { motion } from "framer-motion"
import { useState } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  // Footer menu sections
  const footerSections = [
    {
      id: "studio",
      title: "Studio",
      links: [
        { href: "/", label: "Studio" },
        { href: "/about", label: "About" },
        { href: "/career", label: "Career" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      id: "discover",
      title: "Discover",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/watch", label: "Watch" },
        { href: "/play", label: "Play" },
        { href: "/faq", label: "FAQ" },
        { href: "/support", label: "Support" },
      ],
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms-of-service", label: "Terms of Service" },
        { href: "/dmca", label: "DMCA" },
        { href: "/cookie-policy", label: "Cookie Policy" },
        { href: "/disclaimer", label: "Disclaimer" },
        { href: "/media-usage-policy", label: "Media Usage Policy" },
      ],
    },
  ]

  // Social media links
  const socialLinks = [
    {
      href: "https://www.youtube.com/@flavorstudios",
      icon: Youtube,
      label: "YouTube",
      hoverColor: "hover:text-red-500",
    },
    {
      href: "https://www.facebook.com/flavourstudios",
      icon: Facebook,
      label: "Facebook",
      hoverColor: "hover:text-blue-500",
    },
    {
      href: "https://www.instagram.com/flavorstudios",
      icon: Instagram,
      label: "Instagram",
      hoverColor: "hover:text-pink-500",
    },
    { href: "https://twitter.com/flavor_studios", icon: Twitter, label: "Twitter", hoverColor: "hover:text-sky-500" },
    {
      href: "https://www.threads.net/@flavorstudios",
      icon: LayoutGrid,
      label: "Threads",
      hoverColor: "hover:text-gray-300",
    },
    { href: "https://t.me/flavorstudios", icon: Send, label: "Telegram", hoverColor: "hover:text-blue-400" },
    {
      href: "https://discord.com/channels/@flavorstudios",
      icon: FaDiscord,
      label: "Discord",
      hoverColor: "hover:text-indigo-400",
    },
    {
      href: "https://www.reddit.com/r/flavorstudios/",
      icon: FaReddit,
      label: "Reddit",
      hoverColor: "hover:text-orange-500",
    },
  ]

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
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-all duration-300 ${social.hoverColor} hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Menu Sections */}
          {footerSections.map((section) => (
            <div
              key={section.id}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <h3 className="font-bold text-lg mb-4 relative inline-block">
                {section.title}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary/80 to-accent/80"
                  initial={{ width: 0 }}
                  animate={{ width: hoveredSection === section.id ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors relative group flex items-center"
                    >
                      <motion.span
                        className="absolute left-0 w-0 h-full flex items-center"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                          opacity: hoveredSection === section.id ? 1 : 0,
                          width: hoveredSection === section.id ? "8px" : "0px",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.span className="h-1 bg-primary/40 rounded-full" style={{ width: "4px" }} />
                      </motion.span>
                      <span className="group-hover:translate-x-2 transition-transform duration-200">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 italic">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
