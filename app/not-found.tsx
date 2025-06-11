import Link from "next/link"
import { getMetadata } from "@/lib/seo-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, BookOpen, Play, Phone, ArrowLeft, Compass, Coffee } from "lucide-react"

// --- SEO Metadata for 404 Page ---
export const metadata = getMetadata({
  title: "404 Not Found – Flavor Studios",
  description: "This page does not exist. Discover original anime, news, and stories on Flavor Studios or explore our popular sections.",
  path: "/404",
  robots: "noindex",
  openGraph: {
    title: "404 Not Found – Flavor Studios",
    description: "This page does not exist. Discover original anime, news, and stories on Flavor Studios or explore our popular sections.",
    url: "https://flavorstudios.in/404",
    type: "website",
    site_name: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "404 Not Found – Flavor Studios",
    description: "This page does not exist. Discover original anime, news, and stories on Flavor Studios or explore our popular sections.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "404 Not Found – Flavor Studios",
    description: "This page does not exist. Discover original anime, news, and stories on Flavor Studios or explore our popular sections.",
    url: "https://flavorstudios.in/404"
  },
})

export default function NotFound() {
  const quickLinks = [
    {
      title: "Home",
      description: "Return to our homepage",
      href: "/",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Blog",
      description: "Read our latest stories",
      href: "/blog",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Watch",
      description: "Explore our video content",
      href: "/watch",
      icon: Play,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "About",
      description: "Learn about our studio",
      href: "/about",
      icon: Compass,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Contact",
      description: "Get in touch with us",
      href: "/contact",
      icon: Phone,
      color: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 text-6xl sm:text-8xl md:text-9xl font-bold text-blue-100 -z-10 transform translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2">
              404
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            The page you're looking for seems to have wandered off into another dimension. Don’t worry—Flavor Studios has plenty of original anime, news, and stories to explore!
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Return to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-blue-200 hover:bg-blue-50">
              <Link href="/blog">
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Search Our Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Or explore these popular sections:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r ${link.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <link.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                      {link.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Still can't find what you're looking for?</h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help! Reach out to us and we'll get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50">
              <Link href="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50">
              <Link href="/faq">
                <BookOpen className="mr-2 h-4 w-4" />
                Check FAQ
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-orange-200 hover:bg-orange-50">
              <Link href="/support">
                <Coffee className="mr-2 h-4 w-4" />
                Support Us
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          <p>Error Code: 404 • Page Not Found • Flavor Studios</p>
        </div>
      </div>
    </div>
  )
}
