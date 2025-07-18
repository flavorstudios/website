// app/support/page.tsx

import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Star,
  Users,
  Zap,
  Palette,
  Award,
  MessageCircle,
  ExternalLink,
  HelpCircle,
  Youtube,
} from "lucide-react"; // All necessary Lucide icons are correctly imported.
import Link from "next/link";

// === SEO METADATA (using centralized handler) ===
export const metadata = getMetadata({
  title: `${SITE_NAME} – Fuel Anime & Stories`,
  description: `Help ${SITE_NAME} grow! Support our original anime, blogs, and games by buying us a coffee, joining the community, or donating. Every contribution makes a difference.`,
  path: "/support",
  robots: "index,follow", // This is correct for a public support page.
  openGraph: {
    title: `${SITE_NAME} – Fuel Anime & Stories`,
    description: `Help ${SITE_NAME} grow! Support our original anime, blogs, and games by buying us a coffee, joining the community, or donating. Every contribution makes a difference.`,
    // url: `${SITE_URL}/support`, // REMOVED: This line was redundant, as getMetadata handles it based on 'path'.
    type: "website",
    siteName: SITE_NAME, // CORRECTED: Changed from 'site_name' to 'siteName' for consistency.
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER, // Ensures consistency from constants.
    title: `${SITE_NAME} – Fuel Anime & Stories`,
    description: `Help ${SITE_NAME} grow! Support our original anime, blogs, and games by buying us a coffee, joining the community, or donating. Every contribution makes a difference.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/support"), // Canonical URL is explicitly set here.
  },
});

// === JSON-LD WebPage Schema for Support Page ===
const schema = getSchema({
  type: "WebPage",
  path: "/support",
  title: `${SITE_NAME} – Fuel Anime & Stories`,
  description: `Help ${SITE_NAME} grow! Support our original anime, blogs, and games by buying us a coffee, joining the community, or donating. Every contribution makes a difference.`,
  image: `${SITE_URL}/cover.jpg`, // Main image for the schema.
  // REMOVED: Explicit 'publisher' object. It will now be added automatically by getSchema.
});

export default function SupportPage() {
  const impactAreas = [
    {
      title: "Creative Freedom",
      description: "Maintain creative independence and artistic integrity in all our projects.",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Quality Content",
      description: "Invest in better tools, training, and resources to elevate animation quality.",
      icon: Award,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Community Growth",
      description: "Build a thriving community of animation enthusiasts and independent creators.",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const supportWays = [
    {
      title: "Share Our Content",
      description: "Help us reach more anime fans on YouTube",
      icon: Youtube,
      action: "Visit YouTube",
      // REVERTED: YouTube Channel URL to the user-specified value.
      href: "https://www.youtube.com/@flavorstudios",
      external: true,
    },
    {
      title: "Leave Reviews",
      description: "Join discussions on our Reddit community",
      icon: Star,
      action: "Join Reddit",
      href: "https://www.reddit.com/r/flavorstudios/",
      external: true,
    },
    {
      title: "Join Community",
      description: "Connect with us on Discord",
      icon: Zap,
      action: "Join Discord",
      href: "https://discord.gg/agSZAAeRzn", // Valid Discord invite link.
      external: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* === SEO: Inject JSON-LD Schema === */}
      <StructuredData schema={schema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <Badge className="mb-3 sm:mb-4 lg:mb-6 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
              Independent Animation Studio
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Support Our Creative Vision
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 lg:mb-10 px-2">
              We're committed to crafting emotionally powerful anime, original 3D animations, and meaningful
              storytelling experiences — all built independently using Blender and open-source tools.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6 px-2">
              <Button
                asChild
                size="default"
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* Added aria-hidden */}
                  Buy Me a Coffee
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" /> {/* Added aria-hidden */}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                asChild
                className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-4 border-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
              >
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* Added aria-hidden */}
                  Contact
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                asChild
                className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-4 border-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                <Link href="/faq">
                  <HelpCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* Added aria-hidden */}
                  FAQ
                </Link>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 px-2">Secure payments processed through Buy Me a Coffee</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Impact Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Your Support Makes a Difference</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Every contribution directly impacts our ability to create and share amazing content
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {impactAreas.map((area, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div
                    className={`mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r ${area.color} rounded-2xl w-fit shadow-lg`}
                  >
                    <area.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" aria-hidden="true" /> {/* Added aria-hidden */}
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <blockquote className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-white leading-relaxed">
                "If you believe in the value of independent animation and want to support our work, your contribution
                can help us continue producing high-quality content and grow our creative mission."
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Main Support CTA - Full Width */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 border-t-4 border-yellow-400 rounded-lg">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  Ready to Support Our Journey?
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
                  Every contribution, no matter the size, helps us bring our creative vision to life
                </p>
              </div>
              <div className="max-w-3xl mx-auto text-center">
                <div className="mb-6 sm:mb-8">
                  <div className="bg-yellow-200 rounded-full p-6 sm:p-8 w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg">
                    <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-700" aria-hidden="true" /> {/* Added aria-hidden */}
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Support Us Today</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                    Your support is processed securely through Buy Me a Coffee and helps us continue creating amazing
                    content
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg sm:text-xl h-14 sm:h-16 px-8 sm:px-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-6 sm:mb-8"
                >
                  <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                    <Coffee className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> {/* Added aria-hidden */}
                    Buy Me a Coffee
                    <ExternalLink className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* Added aria-hidden */}
                  </Link>
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div> {/* Added aria-hidden */}
                    Secure payments
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div> {/* Added aria-hidden */}
                    Instant processing
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div> {/* Added aria-hidden */}
                    No account required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways to Support Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Other Ways to Help</h2>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              Connect with us across our social platforms and help grow our community
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {supportWays.map((way, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl w-fit transition-colors">
                    <way.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" /> {/* Added aria-hidden */}
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold">{way.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-3 sm:mb-4">{way.description}</p>
                  <Button variant="outline" size="sm" className="w-full h-10 sm:h-11 text-xs sm:text-sm" asChild>
                    <Link
                      href={way.href}
                      target={way.external ? "_blank" : undefined}
                      rel={way.external ? "noopener noreferrer" : undefined}
                    >
                      {way.action}
                      {way.external && <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />} {/* Added aria-hidden */}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Link - Full Width */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-blue-600" aria-hidden="true" /> {/* Added aria-hidden */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Have Questions?</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Find comprehensive answers about supporting our work, our creative process, and how your contributions
                make a difference
              </p>
              <Button
                variant="default"
                size="lg"
                asChild
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-base sm:text-lg"
              >
                <Link href="/faq">
                  View FAQ Page
                  <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* Added aria-hidden */}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
