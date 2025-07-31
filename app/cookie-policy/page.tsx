// app/cookie-policy/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_BRAND_TWITTER,
} from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail, Shield, Settings, BarChart3, User, Zap, Globe,
  Phone, FileText, AlertCircle, ExternalLink, Cookie, Eye,
  Wrench, TrendingUp, Copyright
} from "lucide-react";
import Link from "next/link";

// === SEO Metadata: Use handler for all canonical, OG, Twitter, robots, etc. ---
export const metadata = getMetadata({
  title: `Cookie Policy – ${SITE_NAME}`,
  description: `Understand how ${SITE_NAME} collects, uses, and safeguards your personal data while using ${SITE_URL.replace(/^https?:\/\//, '')}. Your privacy matters to us.`,
  path: "/cookie-policy",
  robots: "index,follow",
  openGraph: {
    title: `Cookie Policy – ${SITE_NAME}`,
    description: `Understand how ${SITE_NAME} collects, uses, and safeguards your personal data while using ${SITE_URL.replace(/^https?:\/\//, '')}. Your privacy matters to us.`,
    type: "website",
    images: [
      { url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Cookie Policy – ${SITE_NAME}`,
    description: `Understand how ${SITE_NAME} uses cookies to enhance your experience. Read our cookie policy to control your privacy settings on ${SITE_URL.replace(/^https?:\/\//, '')}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// === WebPage Schema (JSON-LD): Attach with publisher logo for SEO compliance ---
const schema = getSchema({
  type: "WebPage",
  path: "/cookie-policy",
  title: `Cookie Policy – ${SITE_NAME}`,
  description: `Understand how ${SITE_NAME} uses cookies to enhance your experience. Read our cookie policy to control your privacy settings on ${SITE_URL.replace(/^https?:\/\//, '')}.`,
  image: `${SITE_URL}/cover.jpg`,
});

export default function CookiePolicyPage() {
  const cookieTypes = [
    { title: "Essential Cookies", icon: Zap, color: "bg-red-100 text-red-600", description: "Necessary for the website to function properly.", examples: ["Session management", "Security features", "Basic site functionality"], canDisable: false },
    { title: "Performance Cookies", icon: BarChart3, color: "bg-blue-100 text-blue-600", description: "Help us understand how visitors interact with our website.", examples: ["Page load times", "Error tracking", "Site performance metrics"], canDisable: true },
    { title: "Functionality Cookies", icon: User, color: "bg-green-100 text-green-600", description: "Remember your choices to personalize the experience.", examples: ["Language preferences", "Theme settings", "User preferences"], canDisable: true },
    { title: "Analytical Cookies", icon: TrendingUp, color: "bg-purple-100 text-purple-600", description: "Track visitor behavior to improve website performance.", examples: ["Google Analytics", "User journey tracking", "Content engagement"], canDisable: true },
    { title: "Third-party Cookies", icon: Globe, color: "bg-orange-100 text-orange-600", description: "Cookies from integrated third-party services like analytics and embedded content.", examples: ["YouTube embeds", "Social media widgets", "External analytics"], canDisable: true },
  ];
  const usagePurposes = [
    { icon: Wrench, title: "Enhance Functionality", description: "Improve user experience and website functionality" },
    { icon: Eye, title: "Analyze Site Usage", description: "Understand how visitors use our site to improve content" },
    { icon: User, title: "Remember Preferences", description: "Personalize your Browse experience based on your choices" },
    { icon: TrendingUp, title: "Optimize Performance", description: "Monitor and improve website speed and performance" },
  ];
  const browserInstructions = [
    { browser: "Chrome", steps: "Settings > Privacy and security > Cookies and other site data" },
    { browser: "Firefox", steps: "Settings > Privacy & Security > Cookies and Site Data" },
    { browser: "Safari", steps: "Preferences > Privacy > Manage Website Data" },
    { browser: "Edge", steps: "Settings > Cookies and site permissions > Cookies and site data" },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <StructuredData schema={schema} />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Cookie Policy</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  Flavor Studios (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies to enhance your Browse
                  experience on our website. This Cookie Policy explains what cookies are, how we use them, and your
                  choices regarding their use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Are Cookies Section */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" />
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

        {/* Types of Cookies We Use Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Types of Cookies We Use</h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8">
            {cookieTypes.map((cookie, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className={`p-2 rounded-lg ${cookie.color}`}>
                      {(() => {
                        const Icon = cookie.icon;
                        return Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : null;
                      })()}
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
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
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

        {/* How We Use Cookies Section */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" aria-hidden="true" />
              </div>
              How We Use Cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
              {usagePurposes.map((purpose, index) => (
                <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {(() => {
                      const Icon = purpose.icon;
                      return Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true" /> : null;
                    })()}
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

        {/* Managing Your Cookies Section */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" aria-hidden="true" />
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
                rel="noopener noreferrer"
              >
                www.aboutcookies.org
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
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
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
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

        {/* Third-Party Content Section */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" aria-hidden="true" />
              </div>
              Third-Party Cookies and Content Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
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
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
                    <span className="text-xs sm:text-sm text-blue-800 leading-relaxed">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy Section */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" aria-hidden="true" />
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
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" />
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
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm sm:text-base">Flavor Studios</p>
                  <p className="text-blue-700 text-sm sm:text-base">Website: {SITE_URL}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Contact Us
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Link href="mailto:contact@flavorstudios.in">
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Email Us
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Legal Documents Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Related Legal Documents</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/privacy-policy">
                <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/terms-of-service">
                <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                Terms of Service
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/dmca">
                <Copyright className="mr-2 h-4 w-4" aria-hidden="true" />
                DMCA Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/disclaimer">
                <AlertCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Disclaimer
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/media-usage-policy">
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
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
  );
}
