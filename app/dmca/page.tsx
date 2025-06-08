import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "DMCA Policy",
  description: "Learn how to submit a DMCA notice to Flavor Studios. Our DMCA Policy outlines your rights and our process for copyright takedown requests.",
  path: "/dmca",
  openGraph: {
    images: ["https://flavorstudios.in/cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/cover.jpg"
  },
  robots: "noindex, nofollow", // This ensures the legal page is not indexed
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DMCA Policy",
    description: "Learn how to submit a DMCA notice to Flavor Studios. Our DMCA Policy outlines your rights and our process for copyright takedown requests.",
    url: "https://flavorstudios.in/dmca",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png"
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
  FileText,
  AlertTriangle,
  Phone,
  Globe,
  Copyright,
  UserX,
  Scale,
  AlertCircle,
  CheckCircle,
  Clock,
  Gavel,
  Eye,
} from "lucide-react"
import Link from "next/link"

export default function DMCAPage() {
  const dmcaSteps = [
    {
      step: "1",
      title: "Identify Infringement",
      description: "Locate the specific content that infringes your copyright on our website.",
      icon: Copyright,
    },
    {
      step: "2",
      title: "Gather Information",
      description: "Collect all required information including URLs, your contact details, and proof of ownership.",
      icon: FileText,
    },
    {
      step: "3",
      title: "Submit Notice",
      description: "Send a complete DMCA notice to our designated agent with all required elements.",
      icon: Mail,
    },
    {
      step: "4",
      title: "Review Process",
      description: "We will review your notice and take appropriate action within a reasonable timeframe.",
      icon: CheckCircle,
    },
  ]

  const requiredElements = [
    "A physical or electronic signature of the copyright owner or authorized representative",
    "Identification of the copyrighted work claimed to have been infringed",
    "Identification of the infringing material and information to locate it (URL or direct link)",
    "Your name, address, telephone number, and email address",
    "A good faith belief statement that the use is not authorized",
    "A statement under penalty of perjury that the information is accurate and you are authorized to act",
  ]

  const counterNoticeElements = [
    "Your physical or electronic signature",
    "Identification of the removed material and its previous location",
    "A statement under penalty of perjury that removal was due to mistake or misidentification",
    "Your name, address, telephone number, and email address",
    "Consent to jurisdiction of courts in India and acceptance of service of process",
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">DMCA Policy</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Copyright className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  Flavor Studios ("we," "us," or "our") respects the intellectual property rights of others and expects
                  its users to do the same. It is our policy to respond to clear notices of alleged copyright
                  infringement in accordance with the Digital Millennium Copyright Act ("DMCA") and other applicable
                  intellectual property laws.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-amber-800 font-medium mb-2">Policy Overview</p>
                <p className="text-sm sm:text-base text-amber-700 leading-relaxed">
                  This DMCA Notice and Takedown Policy outlines the procedures for reporting claims of copyright
                  infringement and how we handle such notices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DMCA Process Steps */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">DMCA Notice Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:block absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              <div className="space-y-4 sm:space-y-6 md:space-y-12">
                {dmcaSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold shadow-lg">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="ml-3 sm:ml-4 md:ml-8 flex-1">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                              <step.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl">{step.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filing a DMCA Notice */}
        <Card className="mb-8 sm:mb-12" id="filing-notice">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              1. Filing a DMCA Notice (Copyright Infringement Notification)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement
              and is accessible on our website, please submit a written DMCA notice to our Designated Agent that
              includes the following:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Required Elements:</h4>
              <ul className="space-y-2 sm:space-y-3">
                {requiredElements.map((element, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{element}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">Submit DMCA Notices to:</h4>
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-blue-800 font-medium">Designated DMCA Agent</p>
                <p className="text-sm sm:text-base text-blue-800">Flavor Studios</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm sm:text-base text-blue-700 font-medium">contact@flavorstudios.in</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Counter Notification */}
        <Card className="mb-8 sm:mb-12" id="counter-notification">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              2. Counter Notification (Restoring Removed Content)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              If you believe your content was removed (or access to it was disabled) in error or misidentification, you
              may submit a written counter-notification to our Designated Agent that includes:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Required Elements:</h4>
              <ul className="space-y-2 sm:space-y-3">
                {counterNoticeElements.map((element, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{element}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2 text-base sm:text-lg">Restoration Timeline</h4>
                  <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                    Upon receipt of a valid counter-notification, we may restore the removed content within 10–14
                    business days unless the original complainant files a court action.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Policies */}
        <div className="grid gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Repeat Infringer Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                3. Repeat Infringer Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Flavor Studios has a zero-tolerance policy for repeat copyright infringers. If a user is found to
                repeatedly violate copyright laws, we reserve the right to terminate their access to our services.
              </p>
            </CardContent>
          </Card>

          {/* Misuse Warning */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-amber-900">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                4. Misuse of DMCA Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                Submitting false or misleading DMCA notices or counter-notices can result in legal liability. We
                strongly recommend that you consult a legal professional before submitting any claim.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-12 sm:mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              5. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-4 sm:mb-6">
              If you have any questions regarding this DMCA Policy, please reach out to us through our Contact Page.
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
                    Send DMCA Notice
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Legal Notice */}
        <Card className="mb-12 sm:mb-16 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-red-900">
              <div className="p-2 bg-red-100 rounded-lg">
                <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              Important Legal Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-red-800 leading-relaxed">
                <strong>Jurisdiction:</strong> This DMCA policy is governed by the laws of India. Counter-notifications
                must include consent to Indian court jurisdiction.
              </p>
              <p className="text-sm sm:text-base text-red-800 leading-relaxed">
                <strong>Legal Consequences:</strong> False DMCA claims may result in liability for damages, including
                costs and attorney fees under Section 512(f) of the DMCA.
              </p>
              <p className="text-sm sm:text-base text-red-800 leading-relaxed">
                <strong>Professional Advice:</strong> We recommend consulting with a qualified attorney before filing
                any DMCA notice or counter-notice.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Navigation</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="#filing-notice">Filing Notice</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="#counter-notification">Counter Notice</Link>
            </Button>
          </div>
        </div>

        {/* Related Legal Documents */}
        <div className="text-center">
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
              <Link href="/cookie-policy">
                <Copyright className="mr-2 h-4 w-4" />
                Cookie Policy
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
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Last updated: May 9, 2025 • This DMCA Policy is effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
