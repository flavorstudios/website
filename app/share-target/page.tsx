import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ShareTargetClientContent from "./client-content"
import LoadingCard from "./loading-card"

export const metadata = {
  title: "Shared Content - Flavor Studios",
  description: "View content shared with Flavor Studios",
}

export default function ShareTargetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 mb-8 border border-primary/20 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-orbitron tracking-tight">
              Shared Content
            </h1>
            <p className="text-lg text-muted-foreground">Content shared with Flavor Studios will appear below.</p>
          </div>
        </div>
      </section>

      {/* Shared Content Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<LoadingCard />}>
              <ShareTargetClientContent />
            </Suspense>

            <div className="mt-12 text-center">
              <h2 className="text-xl font-bold mb-4 font-orbitron">What would you like to do next?</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/">Go to Homepage</Link>
                </Button>
                <Button asChild variant="outline" className="hover:bg-primary/10">
                  <Link href="/blog">Read Our Blog</Link>
                </Button>
                <Button asChild variant="outline" className="hover:bg-primary/10">
                  <Link href="/watch">Watch Videos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
