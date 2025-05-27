"use client"

import Link from "next/link"
import { motion } from "framer-motion"
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

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        ease: "easeOut",
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.footer
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24 relative">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 lg:gap-16"
          variants={itemVariants}
        >
          {/* Brand Section - Enhanced */}
          <motion.div className="space-y-6 lg:pr-16" variants={itemVariants}>
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                Flavor Studios
              </span>
            </Link>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-md">
              Crafting stories with soul—one frame at a time. Flavor Studios is a global animation studio dedicated to
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth,
              we aim to inspire, heal, and connect audiences around the world.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 h-12 w-12 transition-all duration-300 hover:scale-110"
                  >
                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                      <social.icon className="h-5 w-5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Studio Links */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-semibold text-xl md:text-2xl mb-6 text-white">Studio</h3>
            <ul className="space-y-3">
              {studioLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:text-blue-400 transition-all duration-300 text-base md:text-lg block py-1 hover:translate-x-2"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Discover Links */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-semibold text-xl md:text-2xl mb-6 text-white">Discover</h3>
            <ul className="space-y-3">
              {discoverLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:text-purple-400 transition-all duration-300 text-base md:text-lg block py-1 hover:translate-x-2"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-semibold text-xl md:text-2xl mb-6 text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:text-indigo-400 transition-all duration-300 text-base md:text-lg block py-1 hover:translate-x-2"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Enhanced Bottom Section */}
        <motion.div
          className="border-t border-gray-700 mt-12 md:mt-16 pt-8 md:pt-12 text-center space-y-4"
          variants={itemVariants}
        >
          <p className="text-gray-300 text-base md:text-lg font-medium">
            © {currentYear} Flavor Studios. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm md:text-base">Built with Passion. Powered by Dreams.</p>
          <motion.div
            className="flex justify-center items-center space-x-2 pt-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
