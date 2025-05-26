import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Phone,
  Globe,
  AlertTriangle,
  Copyright,
  Users,
  Scale,
  MessageSquare,
  Download,
  Edit,
  Gavel,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function MediaUsagePolicyPage() {
  const permissibleUses = [
    {
      icon: Eye,
      title: "Personal Viewing",
      description: "Watching and enjoying our content for personal entertainment",
    },
    {
      icon: FileText,
      title: "Educational Use",
      description: "Using our content for educational purposes in academic settings",
    },
    {
      icon: MessageSquare,
      title: "Reviews & Commentary",
      description: "Creating reviews, critiques, or commentary about our content",
    },
    {
      icon: Users,
      title: "News Reporting",
      description: "Using our content for legitimate news reporting purposes",
    },
  ]

  const prohibitedUses = [
    {
      icon: XCircle,
      title: "Unauthorized Commercial Use",
      description: "Commercial distribution or reproduction without written permission",
      severity: "high",
    },
    {
      icon: Edit,
      title: "Unauthorized Modifications",
      description: "Altering, modifying, or creating derivative works without authorization",
      severity: "high",
    },
    {
      icon: AlertTriangle,
      title: "Inappropriate Context",
      description: "Using our media in defamatory, misleading, offensive, or unlawful contexts",
      severity: "medium",
    },
  ]

  const requestRequirements = [
    "Detailed description of intended use",
    "Specific media asset(s) requested",
    "Duration and scope of intended use",
    "Contact information for response",
    "Intended audience and distribution channels",
    "Commercial or non-commercial nature of use",
  ]

  const attributionExamples = [
    {
      context: "Blog Post",
      example: "Image courtesy of Flavor Studios (https://flavorstudios.in)",
    },
    {
      context: "Video Review",
      example: "Footage courtesy of Flavor Studios - https://flavorstudios.in",
    },
    {
      context: "Social Media",
      example: "Credit: @FlavorStudios | flavorstudios.in",
    },
    {
      context: "Academic Paper",
      example: "Source: Flavor Studios. Retrieved from https://flavorstudios.in",
    },
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">Legal Document</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Media Usage Policy</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <Copyright className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">Effective Date: May 9, 2025</p>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  Flavor Studios ("we," "us," or "our") creates original animation content and media assets protected by
                  copyright and intellectual property laws. This Media Usage Policy outlines acceptable use of our media
                  assets, including videos, images, graphics, animations, and other related content available through
                  our website and related platforms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissible Uses */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              Permissible Uses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Media assets provided by Flavor Studios may be used for the following purposes, provided appropriate
              credit is given:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
              {permissibleUses.map((use, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <use.icon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-green-900 mb-1">{use.title}</h4>
                    <p className="text-xs sm:text-sm text-green-800 leading-relaxed">{use.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Attribution Requirement</h4>
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                Proper attribution should clearly indicate "Courtesy of Flavor Studios" and include a direct link to our
                official website when applicable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attribution Examples */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Attribution Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
              Here are proper attribution examples for different contexts:
            </p>
            <div className="space-y-3 sm:space-y-4">
              {attributionExamples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                      {example.context}
                    </Badge>
                    <code className="text-xs sm:text-sm bg-white px-3 py-2 rounded border block break-words">
                      {example.example}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              The following uses of our media assets are strictly prohibited:
            </p>
            <div className="space-y-3 sm:space-y-4">
              {prohibitedUses.map((prohibition, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border ${
                    prohibition.severity === "high" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${prohibition.severity === "high" ? "bg-red-100" : "bg-orange-100"}`}>
                    <prohibition.icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        prohibition.severity === "high" ? "text-red-600" : "text-orange-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h4
                      className={`font-semibold text-sm sm:text-base mb-1 ${
                        prohibition.severity === "high" ? "text-red-900" : "text-orange-900"
                      }`}
                    >
                      {prohibition.title}
                    </h4>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        prohibition.severity === "high" ? "text-red-800" : "text-orange-800"
                      }`}
                    >
                      {prohibition.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Content */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              Third-Party Content Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
              Flavor Studios may use third-party content (images, videos, graphics) for informational, educational,
              reporting, and commentary purposes under fair use guidelines. Proper credit and attribution are given
              wherever applicable.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">Content Owners Notice</h4>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    If you own rights to content used and believe it has been used incorrectly, please contact us
                    promptly through our contact page or DMCA process.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requesting Permission */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
              </div>
              Requesting Permission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              For commercial use, publication, redistribution, or any other uses not explicitly covered by permissible
              uses, please contact us to request prior written approval.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Permission requests should include:
              </h4>
              <ul className="space-y-2">
                {requestRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-cyan-900 mb-2 text-sm sm:text-base">Response Timeline</h4>
              <p className="text-xs sm:text-sm text-cyan-800 leading-relaxed">
                We aim to respond to permission requests within 5-7 business days. Complex requests may require
                additional time for review.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ownership and Rights */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
              Ownership and Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              All media assets remain the sole property of Flavor Studios and its licensors. We reserve all rights not
              expressly granted by this policy.
            </p>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card className="mb-8 sm:mb-12 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-red-900">
              <div className="p-2 bg-red-100 rounded-lg">
                <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-red-800 leading-relaxed">
              Flavor Studios actively monitors and enforces its media usage rights. Unauthorized use may result in legal
              action, including claims for damages, injunctions, and removal of infringing content.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <div className="p-2 bg-gray-100 rounded-lg">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              Changes to this Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We reserve the right to update this Media Usage Policy at our discretion. Any modifications will be
              effective immediately upon posting the updated policy on our website. Continued use of our media assets
              after policy changes constitutes acceptance of the revised terms.
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
              For questions regarding this Media Usage Policy or to request permission for specific media use, please
              reach out to us through our Contact Page.
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
                    Request Permission
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

        {/* Quick Reference */}
        <Card className="mb-12 sm:mb-16 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-green-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              Quick Reference Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">✅ Allowed</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-green-800">
                  <li>• Personal viewing and enjoyment</li>
                  <li>• Educational use with attribution</li>
                  <li>• Reviews and commentary</li>
                  <li>• News reporting with credit</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">❌ Prohibited</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-red-800">
                  <li>• Commercial use without permission</li>
                  <li>• Modifications or derivatives</li>
                  <li>• Inappropriate or offensive contexts</li>
                  <li>• Redistribution without authorization</li>
                </ul>
              </div>
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
                <Copyright className="mr-2 h-4 w-4" />
                DMCA Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/cookie-policy">
                <Shield className="mr-2 h-4 w-4" />
                Cookie Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href="/disclaimer">
                <AlertCircle className="mr-2 h-4 w-4" />
                Disclaimer
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Last updated: May 9, 2025 • This Media Usage Policy is effective immediately upon posting.
          </p>
        </div>
      </div>
    </div>
  )
}
