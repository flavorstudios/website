import Link from "next/link"
import { Home, ArrowRight } from "lucide-react"

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
              <Link
                href="/"
                className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Homepage
              </Link>
              <Link
                href="/contact"
                className="border border-primary/20 hover:bg-primary/10 py-2 px-4 rounded-md flex items-center justify-center"
              >
                Report This Issue
              </Link>
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
                  <Link
                    key={item.path}
                    href={item.path}
                    className="hover:bg-primary/10 hover:text-primary py-1 px-3 rounded-md text-sm flex items-center"
                  >
                    {item.name}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
