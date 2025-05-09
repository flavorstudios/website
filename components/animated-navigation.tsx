"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"

const navLinks = [
  { label: "Home", href: "https://www.flavorstudios.in/" },
  { label: "Blog", href: "https://www.flavorstudios.in/blog" },
  { label: "Game", href: "https://www.flavorstudios.in/game" },
  { label: "About", href: "https://www.flavorstudios.in/about" },
  { label: "Contact", href: "https://www.flavorstudios.in/contact" },
]

const legalLinks = [
  { label: "Privacy", href: "https://www.flavorstudios.in/privacy-policy" },
  { label: "Terms", href: "https://www.flavorstudios.in/terms-of-service" },
  { label: "DMCA", href: "https://www.flavorstudios.in/dcma" },
  { label: "Cookies Policy", href: "https://www.flavorstudios.in/cookies-policy" },
]

export default function AnimatedNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLegalOpen, setIsLegalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleLegal = () => {
    setIsLegalOpen(!isLegalOpen)
  }

  const isActive = (href: string) => {
    return pathname === new URL(href).pathname
  }

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const legalMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-gray-900/95 backdrop-blur-sm shadow-lg" : "bg-gray-900"
      } border-b border-gray-800`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="https://www.flavorstudios.in/" className="flex items-center">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
            >
              Flavor Studios
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center space-x-6"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            {navLinks.map((link) => (
              <motion.div key={link.label} variants={itemVariants}>
                <Link
                  href={link.href}
                  className="relative text-sm font-medium transition-colors hover:text-purple-400 py-1"
                >
                  <span className={`${isActive(link.href) ? "text-purple-400" : "text-gray-300"}`}>{link.label}</span>
                  {isActive(link.href) && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-500"
                      layoutId="underline"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Legal Dropdown */}
            <motion.div className="relative" variants={itemVariants}>
              <button
                onClick={toggleLegal}
                className="flex items-center text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors"
              >
                Legal
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isLegalOpen && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={legalMenuVariants}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden z-20"
                  >
                    <div className="py-1">
                      {legalLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-purple-400"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block py-2 text-base font-medium ${
                      isActive(link.href) ? "text-purple-400" : "text-gray-300"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-4 mt-4 border-t border-gray-800"
              >
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Legal</p>
                {legalLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-2 text-sm text-gray-400 hover:text-purple-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
