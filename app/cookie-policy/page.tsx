import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Cookie Policy",
  description:
    "Read the Cookie Policy for Flavor Studios. Learn how we use cookies and how you can control your privacy on https://flavorstudios.in.",
  path: "/cookie-policy",
  openGraph: {
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    images: ["https://flavorstudios.in/cover.jpg"], // new format: array of strings
  },
  robots: "noindex, nofollow",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy",
    description:
      "Read the Cookie Policy for Flavor Studios. Learn how we use cookies and how you can control your privacy on https://flavorstudios.in.",
    url: "https://flavorstudios.in/cookie-policy",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
    },
  },
}); // <- semicolon is important

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Shield,
  Settings,
  BarChart3,
  User,
  Zap,
  Globe,
  Phone,
  FileText,
  AlertCircle,
  ExternalLink,
  Cookie,
  Eye,
  Wrench,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: Zap,
      color: "bg-red-100 text-red-600",
      description: "Necessary for the website to function properly.",
      examples: ["Session management", "Security features", "Basic site functionality"],
      canDisable: false,
    },
    {
      title: "Performance Cookies",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
      description: "Help us understand how visitors interact with our website.",
      examples: ["Page load times", "Error tracking", "Site performance metrics"],
      canDisable: true,
    },
    {
      title: "Functionality Cookies",
      icon: User,
      color: "bg-green-100 text-green-600",
      description: "Remember your choices to personalize the experience.",
      examples: ["Language preferences", "Theme settings", "User preferences"],
      canDisable: true,
    },
    {
      title: "Analytical Cookies",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      description: "Track visitor behavior to improve website performance.",
      examples: ["Google Analytics", "User journey tracking", "Content engagement"],
      canDisable: true,
    },
    {
      title: "Third-party Cookies",
      icon: Globe,
      color: "bg-orange-100 text-orange-600",
      description: "Cookies from integrated third-party services like analytics and embedded content.",
      examples: ["YouTube embeds", "Social media widgets", "External analytics"],
      canDisable: true,
    },
  ]

  const usagePurposes = [
    {
      icon: Wrench,
      title: "Enhance Functionality",
      description: "Improve user experience and website functionality",
    },
    {
      icon: Eye,
      title: "Analyze Site Usage",
      description: "Understand how visitors use our site to improve content",
    },
    {
      icon: User,
      title: "Remember Preferences",
      description: "Personalize your browsing experience based on your choices",
    },
    {
      icon: TrendingUp,
      title: "Optimize Performance",
      description: "Monitor and improve website speed and performance",
    },
  ]

  const browserInstructions = [
    {
      browser: "Chrome",
      steps: "Settings > Privacy and security > Cookies and other site data",
    },
    {
      browser: "Firefox",
      steps: "Settings > Privacy & Security > Cookies and Site Data",
    },
    {
      browser: "Safari",
      steps: "Preferences > Privacy > Manage Website Data",
    },
    {
      browser: "Edge",
      steps: "Settings > Cookies and site permissions > Cookies and site data",
    },
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Cookie Policy</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  Flavor Studios ("we," "us," or "our") uses cookies and similar technologies to enhance your browsing
                  experience on our website. This Cookie Policy explains what cookies are, how we use them, and your
                  choices regarding their use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Are Cookies */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Cookies are small text files placed on your device by websites you visit. They help websites remember your
              preferences, improve user experience, and provide anonymized tracking data to third-party applications.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Types of Cookies We Use</h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8">
            {cookieTypes.map((cookie, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className={`p-2 rounded-lg ${cookie.color}`}>
                      <cookie.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    {cookie.title}
                    {!cookie.canDisable && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{cookie.description}</p>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {cookie.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-xs sm:text-sm text-gray-600">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Can be disabled:</span>
                    <Badge variant={cookie.canDisable ? "default" : "secondary"} className="text-xs">
                      {cookie.canDisable ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How We Use Cookies */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              How We Use Cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
              {usagePurposes.map((purpose, index) => (
                <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <purpose.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{purpose.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{purpose.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              Managing Your Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              You can control cookies via your browser settings. Disabling cookies may affect website functionality.
              Visit{" "}
              <Link
                href="https://www.aboutcookies.org"
                target="_blank"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                www.aboutcookies.org
                <ExternalLink className="h-3 w-3" />
              </Link>{" "}
              for more details.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                Browser-Specific Instructions:
              </h4>
              <div className="space-y-3">
                {browserInstructions.map((instruction, index) => (
                  <div key={index} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <span className="font-medium text-sm sm:text-base text-gray-900 min-w-0 sm:min-w-[80px]">
                      {instruction.browser}:
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{instruction.steps}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">Important Note</h4>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    Disabling certain cookies may affect website functionality and your user experience. Essential
                    cookies cannot be disabled as they are necessary for the site to function properly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Content */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              Third-Party Cookies and Content Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Our website uses third-party cookies and may include third-party content (images, media) for
              informational, educational, reporting, and commentary purposes under fair use guidelines. Proper
              attribution is always given.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Third-party cookies and content are governed by respective third-party policies.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              For more information about how we handle your personal data, please see our Privacy Policy.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Common Third-Party Services:</h4>
              <ul className="space-y-2">
                {[
                  "Google Analytics - Website analytics and performance tracking",
                  "YouTube - Embedded video content",
                  "Social Media Platforms - Social sharing and embedded content",
                  "Content Delivery Networks - Faster content delivery",
                ].map((service, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-blue-800 leading-relaxed">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              Changes to this Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We may update this policy periodically. Changes take effect upon posting with a new effective date. We
              encourage you to review this Cookie Policy regularly to stay informed about how we use cookies.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-12 sm:mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-4 sm:mb-6">
              If you have questions regarding this policy, please reach out to us through our Contact Page.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm sm:text-base">Flavor Studios</p>
                  <p className="text-blue-700 text-sm sm:text-base">Website: https://flavorstudios.in</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Link href="mailto:contact@flavorstudios.in">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Us
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Management Tools */}
        <Card className="mb-12 sm:mb-16 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-green-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                You have the right to control how cookies are used on your device. Here are your options:
              </p>
              <ul className="space-y-2">
                {[
                  "Accept all cookies for the best user experience",
                  "Reject non-essential cookies (may limit functionality)",
                  "Customize cookie preferences by category",
                  "Clear existing cookies from your browser",
                  "Set browser to block future cookies",
                ].map((right, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-green-800 leading-relaxed">{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Related Legal Documents */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Related Legal Documents</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/privacy-policy">
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/terms-of-service">
                <FileText className="mr-2 h-4 w-4" />
                Terms of Service
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/dmca">
                <Users className="mr-2 h-4 w-4" />
                DMCA Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/disclaimer">
                <AlertCircle className="mr-2 h-4 w-4" />
                Disclaimer
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/media-usage-policy">
                <Eye className="mr-2 h-4 w-4" />
                Media Usage Policy
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Last updated: May 9, 2025 • This Cookie Policy is effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
