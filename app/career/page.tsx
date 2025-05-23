import Link from "next/link"
import { ArrowRight, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Join the Team – Work at Flavor Studios",
  description:
    "Looking to work in indie anime or 3D storytelling? Explore future opportunities and stay connected with Flavor Studios.",
}

export default function CareerPage() {
  const closedPositions = [
    {
      id: "animator",
      title: "2D Animator",
      type: "Full-time",
      location: "Remote",
    },
    {
      id: "scriptwriter",
      title: "Scriptwriter",
      type: "Contract",
      location: "Remote",
    },
    {
      id: "voiceover",
      title: "Voiceover Artist",
      type: "Project-based",
      location: "Remote",
    },
    {
      id: "content-creator",
      title: "Anime Content Creator",
      type: "Full-time",
      location: "Remote",
    },
    {
      id: "web-developer",
      title: "Web Developer",
      type: "Contract",
      location: "Remote",
    },
    {
      id: "marketing",
      title: "Digital Marketing Specialist",
      type: "Part-time",
      location: "Remote",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Notification Banner */}
      <div className="w-full bg-[#FFB300] text-[#1A1A1A] py-6 px-4 animate-fade-in">
        <div className="container mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-orbitron">
            We're Grateful for Your Interest – All Roles Are Currently Filled
          </h2>
          <p className="text-sm md:text-base font-poppins max-w-2xl mx-auto">
            Thank you for your interest in joining Flavor Studios. At this time, all positions are filled. We'll notify
            you when new opportunities become available.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight text-left">
              Join Our <span className="text-primary">Story</span>
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed text-left">
              Connect with us today and be part of our creative journey tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* About Flavor Studios */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-primary/5 transition-all duration-500">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 font-orbitron text-center">
                About <span className="text-primary">Flavor Studios</span>
              </h2>

              <p className="text-lg md:text-xl text-center leading-relaxed mb-6 animate-fade-in">
                At Flavor Studios, we bring stories to life through heart-driven animation, meaningful storytelling, and
                creative passion. Even when we're not actively hiring, we welcome visionary minds and creators to stay
                in touch for future possibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closed Positions */}
      <section className="py-12 md:py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron text-center">Closed Positions</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              These positions are currently filled, but represent the types of roles we typically hire for. Stay
              connected to be notified when new opportunities become available.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedPositions.map((position) => (
                <Card
                  key={position.id}
                  className="overflow-hidden border-primary/10 hover:border-primary/20 transition-all duration-300 group"
                >
                  <CardContent className="p-6 relative">
                    <div className="absolute -right-12 top-6 rotate-45 bg-[#FFB300] text-[#1A1A1A] px-10 py-1 text-xs font-medium shadow-md font-orbitron">
                      Position Filled
                    </div>

                    <h3 className="text-xl font-bold font-orbitron mb-2 pr-6 group-hover:text-primary transition-colors duration-300">
                      {position.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs bg-background/50">
                        {position.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-background/50">
                        {position.location}
                      </Badge>
                    </div>

                    <div className="pt-2">
                      <Badge variant="secondary" className="bg-[#FFB300] text-[#1A1A1A] font-orbitron">
                        Closed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stay Connected CTA */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/0"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-orbitron">Stay Connected</h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Follow our journey, engage with our content, and be the first to know when new opportunities arise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Join Our Talent List
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Follow Us on Instagram
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Subscribe on YouTube
                </a>
              </Button>
            </div>

            <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl">
              <h3 className="text-xl font-bold mb-4 font-orbitron text-center">Have Questions or Want to Connect?</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
                Whether you have questions about our work, want to discuss potential collaborations, or simply want to
                introduce yourself and your skills, we'd love to hear from you. Reach out and let's start a
                conversation.
              </p>

              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  <Link href="/contact">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
