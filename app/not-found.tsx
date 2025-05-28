import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, BookOpen, Play, Phone, ArrowLeft, Compass } from "lucide-react"

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
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-blue-100 -z-10 transform translate-x-2 translate-y-2">
              404
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            The page you're looking for seems to have wandered off into another dimension. Don't worry though—our studio
            has plenty of other amazing content to explore!
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Return to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50">
              <Link href="/blog">
                <Search className="mr-2 h-5 w-5" />
                Search Our Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Or explore these popular sections:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${link.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <link.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Still can't find what you're looking for?</h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help! Reach out to us and we'll get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: 404 • Page Not Found • Flavor Studios</p>
        </div>
      </div>
    </div>
  )
}
