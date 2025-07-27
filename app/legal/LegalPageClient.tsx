"use client"

import {
  Shield,
  FileText,
  Copyright,
  Cookie,
  AlertCircle,
  Eye,
  Scale,
  AlertTriangle,
  Gavel,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

type LegalCategory = "Privacy" | "Legal" | "Copyright"
type LegalDoc = {
  title: string
  href: string
  icon: React.ElementType
  description: string
  lastUpdated: string
  category: LegalCategory
  color: string
}

export default function LegalPageClient() {
  const legalDocuments: LegalDoc[] = [
    {
      title: "Privacy Policy",
      href: "/privacy-policy",
      icon: Shield,
      description: "How we collect, use, and protect your personal information",
      lastUpdated: "May 9, 2025",
      category: "Privacy",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Terms of Service",
      href: "/terms-of-service",
      icon: FileText,
      description: "Rules and guidelines for using our website and services",
      lastUpdated: "May 9, 2025",
      category: "Legal",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "DMCA Policy",
      href: "/dmca",
      icon: Copyright,
      description: "Copyright infringement reporting and takedown procedures",
      lastUpdated: "May 9, 2025",
      category: "Copyright",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Cookie Policy",
      href: "/cookie-policy",
      icon: Cookie,
      description: "How we use cookies and similar tracking technologies",
      lastUpdated: "May 9, 2025",
      category: "Privacy",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Disclaimer",
      href: "/disclaimer",
      icon: AlertCircle,
      description: "Limitations of liability and important legal notices",
      lastUpdated: "May 9, 2025",
      category: "Legal",
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Media Usage Policy",
      href: "/media-usage-policy",
      icon: Eye,
      description: "Guidelines for using our media content and intellectual property",
      lastUpdated: "May 9, 2025",
      category: "Copyright",
      color: "bg-cyan-100 text-cyan-600",
    },
  ]

  const categories = ["All", "Privacy", "Legal", "Copyright"] as const
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All")

  const filteredDocuments =
    activeCategory === "All" ? legalDocuments : legalDocuments.filter((doc) => doc.category === activeCategory)

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">Legal Documents</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-normal pb-2">
            Legal Information
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Important legal documents and policies that govern your use of Flavor Studios&apos; website and services.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-12 sm:mb-16 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-amber-900">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              Important Legal Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                <strong>Effective Date:</strong> All legal documents on this page are effective as of May 9, 2025.
              </p>
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                <strong>Jurisdiction:</strong> These documents are governed by the laws of India.
              </p>
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                <strong>Updates:</strong> We may update these documents from time to time. Continued use of our services
                constitutes acceptance of any changes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              className={`focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeCategory === category
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-500 hover:text-white"
              } text-xs sm:text-sm rounded-md px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-colors`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Legal Documents Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 mb-12 sm:mb-16">
          {filteredDocuments.map((doc, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full" aria-label={doc.title}>
              <CardHeader>
                <div
                  className={`p-2 rounded-lg flex items-center justify-between mb-3 ${doc.color} ring-1 ring-inset ring-blue-100`}
                >
                  <doc.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl">{doc.title}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col justify-between flex-1">
                <div className="mb-4">
                  <p className="text-xs sm:text-sm text-gray-500">Last updated: {doc.lastUpdated}</p>
                </div>
                <Button asChild className="w-full h-9 sm:h-10 text-xs sm:text-sm" aria-label={`Read ${doc.title}`}>
                  <Link href={doc.href}>Read {doc.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Summary */}
        <Card className="mb-12 sm:mb-16 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Your Privacy</h4>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  We respect your privacy and protect your personal information according to our Privacy Policy and
                  Cookie Policy.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Your Rights</h4>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  You have rights regarding your data, content usage, and how you interact with our services as outlined
                  in our Terms of Service.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Our Content</h4>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  Our media content is protected by copyright. Please review our Media Usage Policy and DMCA Policy for
                  usage guidelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Legal Matters */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Legal Questions?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-4 sm:mb-6">
              If you have questions about any of these legal documents or need clarification on our policies, please
              don&apos;t hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm" aria-label="Contact Us for Legal Matters">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
