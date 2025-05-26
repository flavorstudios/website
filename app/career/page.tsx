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
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Connect with us today and be part of our creative journey tomorrow.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-yellow-400 border border-yellow-500 rounded-lg p-4 sm:p-6 text-center mx-2 sm:mx-0">
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
        <Card className="mb-12 sm:mb-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              About Flavor Studios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base lg:text-lg text-blue-800 leading-relaxed">
              At Flavor Studios, we bring stories to life through heart-driven animation, meaningful storytelling, and
              creative passion. Even when we're not actively hiring, we welcome visionary minds and creators to stay in
              touch for future possibilities.
            </p>
          </CardContent>
        </Card>

        {/* Closed Positions */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Closed Positions</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              These positions are currently filled, but represent the types of roles we typically hire for. Stay
              connected to be notified when new opportunities become available.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {closedPositions.map((position, index) => (
              <Card key={index} className="opacity-75 hover:opacity-90 transition-opacity">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg lg:text-xl mb-2">{position.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {position.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {position.location}
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Position filled
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {position.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button disabled className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="secondary">
                    {position.status}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stay Connected */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Stay Connected</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Follow our journey, engage with our content, and be the first to know when new opportunities arise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {stayConnectedOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="mx-auto mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-100 rounded-xl w-fit">
                    <option.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-sm sm:text-base lg:text-lg">{option.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed px-2">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className={`w-full h-9 sm:h-10 text-xs sm:text-sm ${option.color}`}>
                    <Link
                      href={option.href}
                      target={option.external ? "_blank" : undefined}
                      rel={option.external ? "noopener noreferrer" : undefined}
                    >
                      {option.action}
                      {option.external && <ExternalLink className="ml-2 h-3 w-3" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Talent List Form */}
        <section id="talent-form" className="mb-8 sm:mb-12 lg:mb-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                Join Our Talent List
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base">
                Stay in the loop for future opportunities that match your skills and interests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm lg:text-base">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="Your first name" className="h-9 sm:h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm lg:text-base">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Your last name" className="h-9 sm:h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm lg:text-base">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="your.email@example.com" className="h-9 sm:h-10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-xs sm:text-sm lg:text-base">
                  Skills & Interests
                </Label>
                <Input id="skills" placeholder="e.g., Animation, Voice Acting, Writing..." className="h-9 sm:h-10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-xs sm:text-sm lg:text-base">
                  Portfolio/Website (Optional)
                </Label>
                <Input id="portfolio" placeholder="https://yourportfolio.com" className="h-9 sm:h-10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs sm:text-sm lg:text-base">
                  Tell Us About Yourself
                </Label>
                <Textarea
                  id="message"
                  placeholder="Share your experience, passion for animation, or what excites you about Flavor Studios..."
                  className="min-h-[80px] sm:min-h-[100px] resize-none text-xs sm:text-sm"
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm">
                <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Join Talent List
              </Button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                We'll only contact you about relevant opportunities and updates.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="text-center max-w-3xl mx-auto">
            <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 lg:mb-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">
              Have Questions or Want to Connect?
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-blue-800 leading-relaxed mb-4 sm:mb-6 lg:mb-8 px-2">
              Whether you have questions about our work, want to discuss potential collaborations, or simply want to
              introduce yourself and your skills, we'd love to hear from you. Reach out and let's start a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 lg:h-11 px-4 sm:px-6 text-xs sm:text-sm"
              >
                <Link href="/contact">
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Contact Us
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-9 sm:h-10 lg:h-11 px-4 sm:px-6 text-xs sm:text-sm"
              >
                <Link href="mailto:contact@flavorstudios.in">
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Email Directly
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
