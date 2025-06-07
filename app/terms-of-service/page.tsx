import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Terms of Service",
  description: "Read the Terms of Service for using Flavor Studios and our content.",
  path: "/terms-of-service",
  ogImage: "https://flavorstudios.in/cover.jpg",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    description: "Read the Terms of Service for using Flavor Studios and our content.",
    url: "https://flavorstudios.in/terms-of-service",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.svg"
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
  Users,
  Lock,
  FileText,
  AlertCircle,
  Phone,
  Globe,
  Copyright,
  MessageSquare,
  ExternalLink,
  Scale,
  UserX,
  Gavel,
  Eye,
} from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "use-of-site",
      title: "Use of the Site",
      icon: Users,
      content: [
        {
          text: "By using our Site, you agree to the following conditions:",
          list: [
            "You must be at least 13 years of age to use our Site.",
            "You agree to use the Site lawfully and not engage in prohibited activities, such as transmitting viruses or harmful content.",
            "You must not use the Site in a way that infringes upon the rights of others or restricts their use and enjoyment of the Site.",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: Copyright,
      content: [
        {
          text: "All content on this Site, including text, graphics, logos, images, audio, video, animations, and software, is the property of Flavor Studios or its licensors and protected by copyright, trademark, and other intellectual property laws.",
        },
        {
          text: "You may not copy, reproduce, distribute, or create derivative works from our content without explicit written permission from us.",
        },
      ],
    },
    {
      id: "user-generated-content",
      title: "User-Generated Content",
      icon: MessageSquare,
      content: [
        {
          text: "When you submit content to our Site:",
          list: [
            "You may submit or upload content to our Site, provided you own the rights or have obtained necessary permissions.",
            "By submitting content, you grant us a worldwide, royalty-free, non-exclusive license to use, modify, publicly display, distribute, and reproduce your content in connection with the Site and our services.",
            "You agree not to submit any offensive, unlawful, defamatory, or infringing material.",
          ],
        },
      ],
    },
    {
      id: "automated-moderation",
      title: "Automated Comment Moderation (Perspective API)",
      icon: Shield,
      content: [
        {
          text: "We use automated tools to maintain a safe environment, including Google's Perspective API, developed by Jigsaw (a unit of Google), to analyze and score user-generated comments for toxicity, spam, or abuse.",
        },
        {
          text: "Important details about our moderation system:",
          list: [
            "By submitting a comment, you acknowledge that your comment content (not your name or email) may be sent to Google servers for processing.",
            "Comments flagged as highly toxic may be blocked or require manual approval.",
            "We reserve the right to moderate, edit, or remove comments that violate our guidelines or are flagged by the Perspective API.",
          ],
        },
      ],
    },
    {
      id: "third-party-links",
      title: "Third-Party Links",
      icon: ExternalLink,
      content: [
        {
          text: "Our Site may include links to third-party websites. We do not control and are not responsible for the content, privacy practices, or terms of these external sites.",
        },
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      icon: AlertCircle,
      content: [
        {
          text: 'The Site is provided "as is" and "as available." We do not make warranties or representations about the accuracy, completeness, reliability, or availability of the content or services provided on the Site. Your use of the Site is at your own risk.',
        },
      ],
    },
  ]

  const legalSections = [
    {
      title: "Limitation of Liability",
      icon: Scale,
      text: "Flavor Studios, its directors, employees, affiliates, or partners will not be liable for any direct, indirect, incidental, consequential, or special damages resulting from your use or inability to use our Site.",
    },
    {
      title: "Indemnification",
      icon: Shield,
      text: "You agree to indemnify and hold harmless Flavor Studios, its officers, employees, partners, and affiliates from any claims, damages, liabilities, or expenses (including legal fees) arising out of your breach of these Terms or your use of the Site.",
    },
    {
      title: "Termination",
      icon: UserX,
      text: "We reserve the right to terminate or suspend your access to our Site immediately, without prior notice or liability, for any reason, including breach of these Terms.",
    },
    {
      title: "Governing Law",
      icon: Gavel,
      text: "These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.",
    },
    {
      title: "Changes to Terms",
      icon: FileText,
      text: "We reserve the right to update or modify these Terms at any time. Any changes will be effective immediately upon posting to this page. Continued use of the Site after such changes constitutes your acceptance of the revised Terms.",
    },
  ]

  return (
    <div className="py-6 sm:py-8 md:py-12 min-h-screen">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Terms of Service</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed sm:leading-loose">
                  Welcome to Flavor Studios ("we," "us," or "our"). These Terms of Service ("Terms") govern your access
                  to and use of our website, including any related media, mobile applications, and services
                  (collectively, the "Site").
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-amber-800 font-medium mb-2">Agreement to Terms</p>
                <p className="text-sm sm:text-base text-amber-700 leading-relaxed sm:leading-loose">
                  By accessing or using our Site, you agree to be bound by these Terms. If you disagree with any part of
                  the Terms, you must not access or use the Site.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-8 sm:mb-12 md:mb-16">
          {sections.map((section, index) => (
            <Card key={index} id={section.id} className="scroll-mt-20 mb-6 sm:mb-8 md:mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <section.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed sm:leading-loose mb-3">
                      {item.text}
                    </p>
                    {item.list && (
                      <ul className="space-y-2 ml-4">
                        {item.list.map((listItem, listIndex) => (
                          <li key={listIndex} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm sm:text-base text-gray-700 leading-relaxed sm:leading-loose">
                              {listItem}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal Sections */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Legal Provisions</h2>
          <div className="grid gap-6 sm:gap-8">
            {legalSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed sm:leading-loose">{section.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 sm:mb-12 md:mb-16 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-red-900">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              Important Legal Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-red-800 leading-relaxed sm:leading-loose">
                <strong>Jurisdiction:</strong> These Terms are governed by the laws of India. Any disputes will be
                resolved in accordance with Indian law.
              </p>
              <p className="text-sm sm:text-base text-red-800 leading-relaxed sm:leading-loose">
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the
                remaining provisions will continue to be valid and enforceable.
              </p>
              <p className="text-sm sm:text-base text-red-800 leading-relaxed sm:leading-loose">
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Flavor
                Studios regarding the use of our Site.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed sm:leading-loose mb-4 sm:mb-6">
              If you have any questions, concerns, or requests regarding these Terms of Service, please reach out to us
              through our Contact Page.
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
                <Button asChild className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
                  <Link href="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm"
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
        <div className="mt-8 sm:mt-12 md:mt-16 text-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Navigation</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {sections.map((section, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                asChild
                className="text-xs sm:text-sm h-11 sm:h-12 px-4 sm:px-6"
              >
                <Link href={`#${section.id}`}>{section.title}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Related Legal Documents */}
        <div className="mt-8 sm:mt-12 md:mt-16">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Related Legal Documents</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/privacy-policy">
                <Lock className="mr-2 h-4 w-4" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/dmca">
                <FileText className="mr-2 h-4 w-4" />
                DMCA Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/cookie-policy">
                <Shield className="mr-2 h-4 w-4" />
                Cookie Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/disclaimer">
                <AlertCircle className="mr-2 h-4 w-4" />
                Disclaimer
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/media-usage-policy">
                <Eye className="mr-2 h-4 w-4" />
                Media Usage Policy
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 md:mt-16 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Last updated: May 9, 2025 • These Terms of Service are effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
