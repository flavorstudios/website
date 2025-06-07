import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Disclaimer",
  description: "Read the Disclaimer for Flavor Studios. Learn about our legal limitations, content liability, third-party links, and user responsibilities on https://flavorstudios.in.",
  path: "/disclaimer",
  openGraph: {
    images: ["https://flavorstudios.in/cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/cover.jpg"
  },
  robots: "noindex, nofollow",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Disclaimer",
    description: "Read the Disclaimer for Flavor Studios. Learn about our legal limitations, content liability, third-party links, and user responsibilities on https://flavorstudios.in.",
    url: "https://flavorstudios.in/disclaimer",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png" // Use .png for consistency
      }
    }
  }
});

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Shield,
  AlertTriangle,
  ExternalLink,
  Copyright,
  Users,
  Bot,
  Briefcase,
  FileText,
  Phone,
  Globe,
  AlertCircle,
  Eye,
  Scale,
  RefreshCw,
  Cookie,
} from "lucide-react"
import Link from "next/link"

export default function DisclaimerPage() {
  const disclaimerSections = [
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Scale,
      color: "bg-red-100 text-red-600",
      content:
        "Under no circumstances shall Flavor Studios or its affiliates, employees, directors, or partners be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising from your use of, or reliance on, any content on the Site. Your use of the Site is entirely at your own risk.",
    },
    {
      id: "external-links",
      title: "External Links Disclaimer",
      icon: ExternalLink,
      color: "bg-blue-100 text-blue-600",
      content:
        "Our Site may contain links to external websites or services not operated or controlled by Flavor Studios. We do not guarantee or endorse the accuracy, relevance, or completeness of any information on third-party websites.",
    },
    {
      id: "media-ip",
      title: "Media and Intellectual Property",
      icon: Copyright,
      color: "bg-purple-100 text-purple-600",
      content:
        "All media content — including videos, graphics, animations, and illustrations — provided by Flavor Studios is protected by copyright, trademark, and intellectual property laws. Use of any of our content must strictly follow our Media Usage Policy.",
    },
    {
      id: "third-party-content",
      title: "Third-Party Content Usage",
      icon: Eye,
      color: "bg-green-100 text-green-600",
      content:
        "Flavor Studios may occasionally feature third-party content (such as anime images, footage, or reviews) for educational, reporting, or commentary purposes under applicable Fair Use provisions. We make every effort to credit the rightful owners. If you believe your content was used without proper permission or attribution, please contact us immediately.",
    },
    {
      id: "user-content",
      title: "User-Generated Content Disclaimer",
      icon: Users,
      color: "bg-orange-100 text-orange-600",
      content:
        "Flavor Studios is not responsible for any content posted by users or third parties on our website or social channels. Such content does not reflect the opinions or positions of Flavor Studios. Users remain solely responsible for their submissions.",
    },
    {
      id: "automated-moderation",
      title: "Automated Moderation Tools",
      icon: Bot,
      color: "bg-cyan-100 text-cyan-600",
      content:
        "To maintain a safe and respectful environment, we use automated tools — including Google's Perspective API — to help detect and manage harmful, toxic, or spammy comments. While these tools assist in moderation, we do not guarantee 100% accuracy in filtering content. We reserve the right to edit, block, or remove any user submissions at our discretion.",
    },
  ]

  const additionalSections = [
    {
      title: "No Professional Advice",
      icon: Briefcase,
      content:
        "The content on our Site is not a substitute for professional advice, including legal, financial, mental health, or business consulting. You should always seek appropriate guidance tailored to your personal situation.",
    },
    {
      title: "Accuracy of Information",
      icon: AlertCircle,
      content:
        "Although we strive to maintain updated and accurate information, the content may occasionally contain errors or omissions. We reserve the right to modify or correct content at any time, without prior notice.",
    },
    {
      title: "Changes to this Disclaimer",
      icon: RefreshCw,
      content:
        "We may update this Disclaimer from time to time. Changes will take effect immediately upon posting the revised version to this page. Continued use of the Site signifies your acceptance of the updated terms.",
    },
  ]

  const riskFactors = [
    "Content accuracy and completeness",
    "Third-party website reliability",
    "User-generated content quality",
    "Automated moderation limitations",
    "External service availability",
    "Information currency and updates",
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Disclaimer</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  The information provided by Flavor Studios ("we," "us," or "our") on our website and associated media
                  platforms is intended for general informational and entertainment purposes only. All content is
                  presented in good faith; however, we make no warranty or guarantee regarding the accuracy, adequacy,
                  reliability, completeness, or timeliness of the information.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-amber-800 font-medium mb-2">Important Notice</p>
                <p className="text-sm sm:text-base text-amber-700 leading-relaxed">
                  By using our website and services, you acknowledge and accept the limitations and disclaimers outlined
                  below. Please read this disclaimer carefully before using our content or services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Disclaimer Sections */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-12 sm:mb-16">
          {disclaimerSections.map((section, index) => (
            <Card key={index} id={section.id} className="scroll-mt-20 hover:shadow-lg transition-shadow p-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base sm:text-xl">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-base text-gray-700 leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Additional Disclaimers</h2>
          <div className="grid gap-6 sm:gap-8">
            {additionalSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Risk Acknowledgment */}
        <Card className="mb-12 sm:mb-16 bg-red-50 border-red-200 p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-red-900">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              Use at Your Own Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-red-800 leading-relaxed mb-4">
              By using our website and services, you acknowledge and accept the following risks and limitations:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-red-800 leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fair Use Notice */}
        <Card className="mb-12 sm:mb-16 bg-green-50 border-green-200 p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-green-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              Fair Use and Copyright Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-base text-green-800 leading-relaxed">
                <strong>Fair Use:</strong> We may use copyrighted material for purposes such as criticism, comment, news
                reporting, teaching, scholarship, or research, which may constitute fair use under applicable copyright
                laws.
              </p>
              <p className="text-xs sm:text-base text-green-800 leading-relaxed">
                <strong>Attribution:</strong> We strive to provide proper attribution for all third-party content used
                on our website and will promptly address any attribution concerns.
              </p>
              <p className="text-xs sm:text-base text-green-800 leading-relaxed">
                <strong>Copyright Claims:</strong> If you believe your copyrighted work has been used inappropriately,
                please refer to our DMCA Policy for the proper procedure to submit a takedown notice.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Technology */}
        <Card className="mb-12 sm:mb-16 bg-cyan-50 border-cyan-200 p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-cyan-900">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
              </div>
              Automated Moderation Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-base text-cyan-800 leading-relaxed">
                <strong>Technology Used:</strong> We employ Google's Perspective API and other automated tools to help
                maintain a safe and respectful community environment.
              </p>
              <p className="text-xs sm:text-base text-cyan-800 leading-relaxed">
                <strong>Limitations:</strong> Automated systems are not perfect and may occasionally flag appropriate
                content or miss inappropriate content. We continuously work to improve these systems.
              </p>
              <p className="text-xs sm:text-base text-cyan-800 leading-relaxed">
                <strong>Human Oversight:</strong> Our team reviews flagged content and makes final decisions on content
                moderation actions.
              </p>
            </div>
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
              If you have any questions or concerns regarding this Disclaimer, feel free to contact us through our
              Contact Page.
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

        {/* Quick Navigation */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Navigation</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {disclaimerSections.slice(0, 4).map((section, index) => (
              <Button key={index} variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href={`#${section.id}`}>{section.title}</Link>
              </Button>
            ))}
          </div>
        </div>

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
                <Copyright className="mr-2 h-4 w-4" />
                DMCA Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/cookie-policy">
                <Cookie className="mr-2 h-4 w-4" />
                Cookie Policy
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
            Last updated: May 9, 2025 • This Disclaimer is effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
