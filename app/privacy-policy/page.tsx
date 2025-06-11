import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Privacy Policy – Flavor Studios",
  description:
    "Read how Flavor Studios collects, uses, and safeguards your personal data while using https://flavorstudios.in. Your privacy matters to us.",
  path: "/privacy-policy",
  openGraph: {
    title: "Privacy Policy – Flavor Studios",
    description:
      "Read how Flavor Studios collects, uses, and safeguards your personal data while using https://flavorstudios.in. Your privacy matters to us.",
    url: "https://flavorstudios.in/privacy-policy",
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
    title: "Privacy Policy – Flavor Studios",
    description:
      "Read how Flavor Studios collects, uses, and safeguards your personal data while using https://flavorstudios.in. Your privacy matters to us.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  robots: "noindex, nofollow",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description:
      "Read how Flavor Studios collects, uses, and safeguards your personal data while using https://flavorstudios.in. Your privacy matters to us.",
    url: "https://flavorstudios.in/privacy-policy",
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
});

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Shield, Eye, Lock, Users, FileText, AlertCircle, Phone, Cookie, Copyright } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: Eye,
      content: [
        {
          subtitle: "Personal Information",
          text: "Name, email address, contact details, and other identifiable information provided voluntarily when registering, subscribing, or contacting us.",
        },
        {
          subtitle: "Usage Data",
          text: "Information automatically collected when you visit the Site, such as your IP address, browser type, operating system, access times, and pages viewed.",
        },
        {
          subtitle: "Cookies",
          text: "Small files placed on your device to enhance your browsing experience, remember preferences, and analyze website traffic.",
        },
      ],
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      icon: Shield,
      content: [
        {
          text: "We use the information collected for the following purposes:",
          list: [
            "Provide, operate, and maintain our Site.",
            "Improve, personalize, and expand our services and content.",
            "Understand and analyze how you use our Site.",
            "Develop new products, services, features, and functionalities.",
            "Communicate with you, including customer support and responding to inquiries.",
            "Send periodic emails and newsletters regarding updates, promotions, and other relevant information.",
            "Protect our Site from fraud, unauthorized activities, and maintain security.",
          ],
        },
      ],
    },
    {
      id: "automated-moderation",
      title: "Automated Comment Moderation (Perspective API)",
      icon: AlertCircle,
      content: [
        {
          text: "To maintain a safe and respectful community, we use Google's Perspective API — an AI-powered content moderation tool developed by Jigsaw, a subsidiary of Google. This service helps detect toxic, spammy, or harmful content in comments submitted to our website.",
        },
        {
          text: "Please note:",
          list: [
            "Only the content of your comment is sent to Google's servers for moderation.",
            "No personally identifiable information (like your name or email) is included in that data.",
            "This helps us reduce spam and ensure safer interactions on our platform.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      title: "Disclosure of Your Information",
      icon: Users,
      content: [
        {
          text: "We may share your information under the following circumstances:",
          list: [
            "With third-party service providers who assist us in operating our website and conducting business activities, under strict confidentiality agreements.",
            "If required by law or in response to a legal request.",
            "To enforce our policies, protect our rights, or ensure the safety of our users and the public.",
            "In connection with any merger, sale of company assets, financing, or acquisition.",
          ],
        },
      ],
    },
    {
      id: "third-party",
      title: "Third-Party Websites & Services",
      icon: FileText,
      content: [
        {
          text: "Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. Please review the privacy policies of third-party sites before providing any personal information.",
        },
        {
          text: "We also use trusted third-party services, such as Google's Perspective API, to moderate user-generated content. These services may process limited data according to their own privacy policies. For more information, please review Google's Privacy Policy.",
        },
      ],
    },
    {
      id: "security",
      title: "Security of Your Information",
      icon: Lock,
      content: [
        {
          text: "We implement reasonable security measures to protect your information. However, no security measures are completely secure, and we cannot guarantee absolute security. Please use caution when sharing personal information online.",
        },
      ],
    },
  ]

  const additionalSections = [
    {
      title: "Retention of Your Information",
      text: "We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required or permitted by law.",
    },
    {
      title: "Your Rights",
      text: "You have the right to:",
      list: [
        "Access, update, or delete your personal information.",
        "Opt-out of receiving promotional communications from us.",
        "Request restriction of processing or object to processing of your personal information.",
      ],
      note: "To exercise these rights, please contact us using the details provided below.",
    },
    {
      title: "Children's Privacy",
      text: "Our Site is not directed toward children under 13 years old, and we do not knowingly collect information from individuals under the age of 13.",
    },
    {
      title: "Changes to This Privacy Policy",
      text: 'We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated "Effective Date." We encourage you to review this Privacy Policy regularly.',
    },
  ]

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Privacy Policy</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base md:text-lg text-blue-800 font-medium mb-2">
                  Effective Date: May 9, 2025
                </p>
                <p className="text-sm sm:text-base md:text-lg text-blue-700 leading-relaxed sm:leading-loose">
                  Flavor Studios ("we," "us," or "our") respects your privacy and is committed to protecting your
                  personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you visit our website.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base md:text-lg text-amber-800 font-medium mb-2">Important Notice</p>
                <p className="text-sm sm:text-base md:text-lg text-amber-700 leading-relaxed sm:leading-loose">
                  By accessing or using our Site, you agree to this Privacy Policy. If you do not agree with the terms,
                  please do not access the Site.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-6 sm:mb-8 md:mb-12">
          {sections.map((section, index) => (
            <Card key={index} id={section.id} className="scroll-mt-20">
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
                    {item.subtitle && (
                      <h4 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 mb-2">
                        {item.subtitle}
                      </h4>
                    )}
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed sm:leading-loose mb-3">
                      {item.text}
                    </p>
                    {item.list && (
                      <ul className="space-y-2 ml-4">
                        {item.list.map((listItem, listIndex) => (
                          <li key={listIndex} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed sm:leading-loose">
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

        {/* Additional Sections */}
        <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
          {additionalSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed sm:leading-loose mb-3">
                  {section.text}
                </p>
                {section.list && (
                  <ul className="space-y-2 ml-4 mb-4">
                    {section.list.map((listItem, listIndex) => (
                      <li key={listIndex} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed sm:leading-loose">
                          {listItem}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 italic leading-relaxed sm:leading-loose">
                    {section.note}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

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
            <p className="text-sm sm:text-base md:text-lg text-blue-800 leading-relaxed sm:leading-loose mb-4 sm:mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your
              personal information, please reach out to us through our Contact Page.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm sm:text-base md:text-lg">Flavor Studios</p>
                  <p className="text-blue-700 text-sm sm:text-base md:text-lg">Website: https://flavorstudios.in</p>
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

        {/* Related Legal Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Related Legal Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base md:text-lg text-blue-800 leading-relaxed sm:leading-loose mb-4 sm:mb-6">
              For more information about our policies, please refer to the following documents:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
                <Link href="/terms-of-service">
                  <FileText className="mr-2 h-4 w-4" />
                  Terms of Service
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
                <Link href="/cookie-policy">
                  <Cookie className="mr-2 h-4 w-4" />
                  Cookie Policy
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
                <Link href="/dmca">
                  <Copyright className="mr-2 h-4 w-4" />
                  DMCA Policy
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm">
                <Link href="/disclaimer">
                  <Shield className="mr-2 h-4 w-4" />
                  Disclaimer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="mt-12 sm:mt-16 text-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Navigation</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {sections.map((section, index) => (
              <Button key={index} variant="outline" size="sm" asChild className="text-xs sm:text-sm px-3 py-2">
                <Link href={`#${section.id}`}>{section.title}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Last updated: May 9, 2025 • This Privacy Policy is effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
