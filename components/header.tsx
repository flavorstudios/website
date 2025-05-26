"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Play, BookOpen, Users, Phone, Search, Coffee } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: null },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Watch", href: "/watch", icon: Play },
    { name: "Search", href: "#", icon: Search, isSearch: true },
    { name: "Play", href: "/play", icon: null },
    { name: "About", href: "/about", icon: Users },
    { name: "Contact", href: "/contact", icon: Phone },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Flavor Studios
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) =>
              item.isSearch ? (
                <button
                  key={item.name}
                  className="text-sm font-medium transition-colors hover:text-blue-600"
                  onClick={() => {
                    // Search functionality will be added later
                    console.log("Search clicked")
                  }}
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) =>
                  item.isSearch ? (
                    <button
                      key={item.name}
                      className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-blue-600"
                      onClick={() => {
                        // Search functionality will be added later
                        console.log("Search clicked")
                        setIsOpen(false)
                      }}
                    >
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </Link>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/support">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
