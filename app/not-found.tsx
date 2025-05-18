import Link from "next/link"
import { Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { SearchWrapper } from "@/components/search-wrapper"

export const metadata = {
  title: "Page Not Found – Flavor Studios",
  description: "Sorry, the page you are looking for does not exist. Return to the Flavor Studios homepage.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-6xl font-orbitron font-bold text-primary">404</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron gradient-text">Page Not Found</h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
              <Button asChild variant="outline" className="hover:bg-primary/10">
                <Link href="/contact">Report This Issue</Link>
              </Button>
            </div>

            <div className="max-w-md mx-auto mb-12 border border-primary/20 rounded-lg p-6 bg-card/50">
              <h2 className="text-lg font-bold mb-4 font-orbitron">Search Our Site</h2>
              <Suspense fallback={<div className="h-10 w-full bg-muted/20 animate-pulse rounded-md"></div>}>
                <SearchWrapper />
              </Suspense>
            </div>

            <div className="border-t border-primary/10 pt-8 mt-8">
              <h3 className="text-base font-medium mb-4 font-orbitron">Popular Destinations</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { name: "Blog", path: "/blog" },
                  { name: "Videos", path: "/watch" },
                  { name: "Games", path: "/play" },
                  { name: "About", path: "/about" },
                  { name: "Support", path: "/support" },
                ].map((item) => (
                  <Button
                    key={item.path}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Link href={item.path}>
                      {item.name}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
