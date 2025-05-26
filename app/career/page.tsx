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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Join Our Story</h1>
          <p className="text-lg text-gray-700">Connect with us today and be part of our creative journey tomorrow.</p>
        </div>

        {/* Status Banner */}
        <div className="text-center mb-8">
          <div className="bg-yellow-400 border border-yellow-500 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-black mb-3">
              We're Grateful for Your Interest – All Roles Are Currently Filled
            </h2>
            <p className="text-base text-black">
              Thank you for your interest in joining Flavor Studios. At this time, all positions are filled.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-12 text-center">
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
        <section className="mb-8 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900">Recently Filled Positions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-400 border border-yellow-500 rounded-full px-3 py-1 flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-black" />
                    <span className="text-xs font-medium text-black">Position Filled</span>
                  </div>
                </div>

                <CardHeader className="pb-3 sm:pb-4 pr-24 text-center">
                  <CardTitle className="text-base sm:text-lg lg:text-xl mb-3 text-gray-900">{position.title}</CardTitle>

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
        <section className="mb-8 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900">Stay Connected</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Follow our journey, engage with our content, and be the first to know when new opportunities arise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Join Our Talent List */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-3 bg-gray-100 rounded-xl w-fit">
                  <UserPlus className="h-6 w-6 text-gray-700" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">Join Our Talent List</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600">
                  Be the first to know about new opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full h-10 sm:h-11 text-sm sm:text-base bg-blue-600 hover:bg-blue-700">
                  <Link href="#talent-form">Join List</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Follow Us on Instagram */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-3 bg-gray-100 rounded-xl w-fit">
                  <Instagram className="h-6 w-6 text-gray-700" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">Follow Us on Instagram</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600">
                  Stay updated with our latest projects and behind-the-scenes content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full h-10 sm:h-11 text-sm sm:text-base bg-pink-600 hover:bg-pink-700">
                  <Link href="https://www.instagram.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                    Follow Instagram
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscribe on YouTube */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-3 bg-gray-100 rounded-xl w-fit">
                  <Youtube className="h-6 w-6 text-gray-700" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">Subscribe on YouTube</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600">
                  Watch our content and see our creative process in action
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full h-10 sm:h-11 text-sm sm:text-base bg-red-600 hover:bg-red-700">
                  <Link href="https://www.youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
                    Subscribe
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Talent List Form */}
        <section id="talent-form" className="mb-8 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900">Join Our Talent List</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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

              <p className="text-sm text-gray-500 text-center leading-relaxed">
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
            <p className="text-lg text-blue-800 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
              Whether you have questions about our work, want to discuss potential collaborations, or simply want to
              introduce yourself and your skills, we'd love to hear from you. Reach out and let's start a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg inline-flex items-center justify-center"
              >
                Contact Us
              </a>
              <a
                href="mailto:contact@flavorstudios.in"
                className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg inline-flex items-center justify-center"
              >
                Email Directly
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
