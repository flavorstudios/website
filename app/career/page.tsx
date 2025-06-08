import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Careers – Flavor Studios",
  description:
    "Explore creative career opportunities at Flavor Studios. Join our talent list, discover recently filled positions, and stay connected for future roles in animation, writing, voice acting, and more.",
  path: "/career",
  openGraph: {
    title: "Careers at Flavor Studios",
    description:
      "Animation, writing, voice acting & more—discover opportunities at Flavor Studios and join our creative talent list.",
    images: ["https://flavorstudios.in/cover.jpg"],
    type: "website",
    url: "https://flavorstudios.in/career",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Careers at Flavor Studios",
    description:
      "Explore creative jobs in animation, writing, and production. Join our talent pool for future roles.",
    image: "https://flavorstudios.in/cover.jpg",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Careers at Flavor Studios",
    description:
      "Explore creative career opportunities at Flavor Studios. Join our talent list, discover recently filled positions, and stay connected for future roles in animation, writing, voice acting, and more.",
    url: "https://flavorstudios.in/career",
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Heart,
  MapPin,
  ExternalLink,
  Mail,
  Youtube,
  Instagram,
  CheckCircle,
  Star,
  MessageCircle,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

export default function CareerPage() {
  const closedPositions = [
    {
      title: "2D Animator",
      type: "Full-time",
      location: "Remote",
      status: "Closed",
      description: "Create stunning 2D animations for our original anime series and short-form content.",
    },
    {
      title: "Scriptwriter",
      type: "Contract",
      location: "Remote",
      status: "Closed",
      description: "Develop compelling scripts and storylines for our anime projects and educational content.",
    },
    {
      title: "Voiceover Artist",
      type: "Project-based",
      location: "Remote",
      status: "Closed",
      description: "Bring characters to life with professional voice acting for our animated series.",
    },
    {
      title: "Anime Content Creator",
      type: "Full-time",
      location: "Remote",
      status: "Closed",
      description: "Create engaging anime-related content for our YouTube channel and social media platforms.",
    },
    {
      title: "Web Developer",
      type: "Contract",
      location: "Remote",
      status: "Closed",
      description: "Develop and maintain our website and digital platforms using modern web technologies.",
    },
    {
      title: "Digital Marketing Specialist",
      type: "Part-time",
      location: "Remote",
      status: "Closed",
      description: "Drive our digital marketing efforts across social media, YouTube, and other platforms.",
    },
  ]

  const stayConnectedOptions = [
    {
      title: "Join Our Talent List",
      description: "Be the first to know about new opportunities",
      icon: UserPlus,
      action: "Join List",
      href: "#talent-form",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Follow Us on Instagram",
      description: "Stay updated with our latest projects and behind-the-scenes content",
      icon: Instagram,
      action: "Follow Instagram",
      href: "https://www.instagram.com/flavorstudios",
      external: true,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      title: "Subscribe on YouTube",
      description: "Watch our content and see our creative process in action",
      icon: Youtube,
      action: "Subscribe",
      href: "https://www.youtube.com/@flavorstudios",
      external: true,
      color: "bg-red-600 hover:bg-red-700",
    },
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
            Join Our Creative Team
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Join Our Story
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Connect with us today and be part of our creative journey tomorrow.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="bg-yellow-400 border border-yellow-500 rounded-lg p-4 sm:p-6 max-w-4xl mx-auto">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-black mb-2 sm:mb-3 leading-tight">
              We're Grateful for Your Interest – All Roles Are Currently Filled
            </h2>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Thank you for your interest in joining Flavor Studios. At this time, all positions are filled. We'll
              notify you when new opportunities become available.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-12 sm:mb-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-blue-900 text-center">
                About Flavor Studios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base lg:text-lg text-blue-800 leading-relaxed max-w-3xl mx-auto">
                At Flavor Studios, we bring stories to life through heart-driven animation, meaningful storytelling, and
                creative passion. Even when we're not actively hiring, we welcome visionary minds and creators to stay
                in touch for future possibilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closed Positions */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Recently Filled Positions
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These positions were recently filled, but represent the types of roles we typically hire for. Join our
              talent list to be notified when similar opportunities become available.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
            {closedPositions.map((position, index) => (
              <Card
                key={index}
                className="relative border-2 border-gray-200 bg-gray-50/50 hover:shadow-md transition-all duration-300"
              >
                {/* Position Filled Banner */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-yellow-400 border border-yellow-500 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 flex items-center gap-1 sm:gap-1.5">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-black" />
                    <span className="text-[10px] sm:text-xs font-medium text-black">Position Filled</span>
                  </div>
                </div>

                <CardHeader className="pb-3 sm:pb-4 pr-16 sm:pr-24 text-center">
                  <CardTitle className="text-sm sm:text-lg lg:text-xl mb-3 text-gray-900">{position.title}</CardTitle>

                  <div className="flex flex-wrap gap-2 mb-3 justify-center">
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                      {position.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                      <MapPin className="h-3 w-3 mr-1" />
                      {position.location}
                    </Badge>
                  </div>

                  <CardDescription className="text-xs sm:text-sm leading-relaxed text-gray-700">
                    {position.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="bg-yellow-400 border border-yellow-500 rounded-lg p-3 text-center">
                    <p className="text-xs sm:text-sm text-black font-medium">This position has been filled</p>
                    <p className="text-xs text-black mt-1">Similar roles may open in the future</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action for Closed Positions */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-gray-900">
                Interested in Similar Roles?
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed max-w-2xl mx-auto">
                While these specific positions are filled, we're always looking for talented individuals. Join our
                talent list to be the first to know about new opportunities.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base">
                <Link href="#talent-form">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Our Talent List
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stay Connected */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Stay Connected</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Follow our journey, engage with our content, and be the first to know when new opportunities arise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {stayConnectedOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 bg-gray-100 rounded-xl w-fit">
                    <option.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">{option.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className={`w-full h-10 sm:h-11 text-sm sm:text-base ${option.color}`}>
                    <Link
                      href={option.href}
                      target={option.external ? "_blank" : undefined}
                      rel={option.external ? "noopener noreferrer" : undefined}
                    >
                      {option.action}
                      {option.external && <ExternalLink className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Talent List Form */}
        <section id="talent-form" className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Join Our Talent List
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stay in the loop for future opportunities that match your skills and interests.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="space-y-4 sm:space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base text-gray-700">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="Your first name" className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base text-gray-700">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Your last name" className="h-10 sm:h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base text-gray-700">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="your.email@example.com" className="h-10 sm:h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm sm:text-base text-gray-700">
                  Skills & Interests
                </Label>
                <Input id="skills" placeholder="e.g., Animation, Voice Acting, Writing..." className="h-10 sm:h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-sm sm:text-base text-gray-700">
                  Portfolio/Website (Optional)
                </Label>
                <Input id="portfolio" placeholder="https://yourportfolio.com" className="h-10 sm:h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm sm:text-base text-gray-700">
                  Tell Us About Yourself
                </Label>
                <Textarea
                  id="message"
                  placeholder="Share your experience, passion for animation, or what excites you about Flavor Studios..."
                  className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base">
                <UserPlus className="mr-2 h-4 w-4" />
                Join Talent List
              </Button>

              <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
                We'll only contact you about relevant opportunities and updates.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">
              Have Questions or Want to Connect?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-blue-800 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
              Whether you have questions about our work, want to discuss potential collaborations, or simply want to
              introduce yourself and your skills, we'd love to hear from you. Reach out and let's start a conversation.
            </p>
            <div className="flex justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
