import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Mail,
  Clock,
  MessageCircle,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  HelpCircle,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Check,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { JsonLd } from "@/components/seo/json-ld"
import { generateContactPageSchema } from "@/lib/seo-utils"

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch",
  description:
    "Contact Flavor Studios for inquiries, collaborations, and support. We respond within 24-48 hours during business days. Reach out via email or social media.",
  openGraph: {
    title: "Contact Flavor Studios - Get in Touch",
    description:
      "Contact us for inquiries, collaborations, and support. We respond within 24-48 hours during business days.",
    type: "website",
    url: "https://flavorstudios.in/contact",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Flavor Studios - Get in Touch",
    description:
      "Contact us for inquiries, collaborations, and support. We respond within 24-48 hours during business days.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/contact",
  },
}

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "contact@flavorstudios.in",
      description: "For general inquiries and support",
    },
    {
      icon: MessageCircle,
      title: "Social Media",
      details: "@FlavorStudios",
      description: "DM us on any social platform",
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "Within 24-48 hours during business days (Monday-Friday)",
      description: "We try to respond as quickly as possible",
    },
  ]

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com/@flavorstudios", icon: Youtube, color: "text-red-600" },
    { name: "Facebook", href: "https://www.facebook.com/flavourstudios", icon: Facebook, color: "text-blue-700" },
    { name: "Instagram", href: "https://www.instagram.com/flavorstudios", icon: Instagram, color: "text-pink-600" },
    { name: "Twitter", href: "https://twitter.com/flavor_studios", icon: Twitter, color: "text-blue-600" },
    {
      name: "Discord",
      href: "https://discord.com/channels/@flavorstudios",
      icon: MessageCircle,
      color: "text-indigo-600",
    },
    { name: "Telegram", href: "https://t.me/flavorstudios", icon: Send, color: "text-blue-500" },
    { name: "Threads", href: "https://www.threads.net/@flavorstudios", icon: MessageCircle, color: "text-gray-600" },
    { name: "Reddit", href: "https://www.reddit.com/r/flavorstudios/", icon: Users, color: "text-orange-600" },
  ]

  const contactProcess = [
    {
      step: "1",
      title: "Submit Your Message",
      description:
        "Fill out our contact form with your details and inquiry. Be as specific as possible to help us understand your needs.",
      icon: Send,
    },
    {
      step: "2",
      title: "Initial Assessment",
      description:
        "You'll receive an immediate confirmation. Our team reviews all inquiries within 24 hours during business days.",
      icon: CheckCircle,
    },
    {
      step: "3",
      title: "Personalized Response",
      description: "We'll respond with tailored information addressing your specific questions or concerns.",
      icon: MessageSquare,
    },
    {
      step: "4",
      title: "Ongoing Support",
      description:
        "For complex matters, we may schedule additional communication to ensure your inquiry is fully resolved.",
      icon: Users,
    },
  ]

  const expectations = [
    "You'll receive an email confirmation immediately.",
    "Our team will review your message within 24 hours.",
    "We'll respond with helpful information or next steps.",
    "For complex inquiries, we may schedule a follow-up call.",
  ]

  return (
    <>
      <JsonLd data={generateContactPageSchema()} />
      <div className="min-h-screen py-8 sm:py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">Connect With Us</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Get In Touch
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you have a question about our content, want to collaborate, or just want to say hello, we're here
              to help. Fill out the form and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-12 sm:mb-16">
            {/* Contact Info & Social */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <info.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm sm:text-base">{info.title}</div>
                        <div className="text-blue-600 text-xs sm:text-sm break-words">{info.details}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{info.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Business Inquiries */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Business Inquiries</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    For sponsorships, business partnerships, or collaboration opportunities:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm break-all">
                        contact@flavorstudios.in
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Follow Us</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Connect with us on social media for updates and community discussions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {socialLinks.map((social) => (
                      <Button
                        key={social.name}
                        variant="outline"
                        asChild
                        className="justify-start h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <Link href={social.href} target="_blank" rel="noopener noreferrer">
                          <social.icon className={`mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${social.color}`} />
                          {social.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm sm:text-base">
                        First Name
                      </Label>
                      <Input id="firstName" placeholder="Your first name" className="h-10 sm:h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm sm:text-base">
                        Last Name
                      </Label>
                      <Input id="lastName" placeholder="Your last name" className="h-10 sm:h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      Email
                    </Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" className="h-10 sm:h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm sm:text-base">
                      Subject
                    </Label>
                    <Select>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="business">Business Partnership</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm sm:text-base">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-[100px] sm:min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox id="privacy" className="mt-0.5" />
                    <Label htmlFor="privacy" className="text-xs sm:text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>

                  {/* What to Expect Section */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">What to Expect</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {expectations.map((expectation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white font-bold" />
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-800 leading-relaxed">{expectation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Process Timeline - Mobile Optimized */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Contact Process</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:block absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

                <div className="space-y-6 sm:space-y-12">
                  {contactProcess.map((process, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                          {process.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="ml-4 sm:ml-8 flex-1">
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                <process.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>
                              <CardTitle className="text-lg sm:text-xl">{process.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-sm sm:text-base leading-relaxed">
                              {process.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Call-to-Action Section */}
          <section className="mt-12 sm:mt-16 text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 sm:p-8">
            <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">Need Quick Answers?</h2>
            <p className="text-base sm:text-lg text-blue-700 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              Before reaching out, check our comprehensive FAQ page where we've answered the most common questions about
              our content, collaborations, and services.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-6 sm:px-8">
              <Link href="/faq">
                <HelpCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse FAQ
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  )
}
