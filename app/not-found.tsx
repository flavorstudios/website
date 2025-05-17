import Link from "next/link"
import Image from "next/image"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
// Import the SearchWrapper component
import { SearchWrapper } from "@/components/search-wrapper"

export const metadata = {
  title: "Page Not Found – Flavor Studios",
  description: "Sorry, the page you are looking for does not exist. Return to the Flavor Studios homepage.",
}

// Separate the search component to wrap it in Suspense
function SearchComponent() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4 font-orbitron">Looking for something specific?</h2>
      <div className="relative">
        <Link href="/search" className="w-full">
          <Button variant="outline" className="w-full">
            Search our site
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative w-64 h-64 mx-auto mb-8">
              <Image src="/placeholder-y71wy.png" alt="404 Not Found" fill className="object-contain" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-orbitron gradient-text">404 - Page Not Found</h1>

            <p className="text-xl text-muted-foreground mb-8">
              Oops! Looks like you've wandered into uncharted territory. The page you're looking for doesn't exist or
              has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="hover:bg-primary/10">
                <Link href="/contact">Report This Issue</Link>
              </Button>
            </div>

            {/* Wrap the search component in Suspense */}
            <Suspense fallback={<div>Loading search...</div>}>
              <SearchWrapper />
            </Suspense>

            <div className="mt-12">
              <h3 className="text-lg font-bold mb-4 font-orbitron">Popular Destinations</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                  <Link href="/blog">Blog</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                  <Link href="/watch">Videos</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                  <Link href="/play">Games</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                  <Link href="/about">About Us</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
                  <Link href="/support">Support Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
