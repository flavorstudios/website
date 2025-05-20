import Link from "next/link"
import { Coffee, ArrowRight, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Support Flavor Studios – Help Us Create Soulful Anime",
  description:
    "Support our independent animation studio. Your contribution helps us create emotionally powerful anime and original 3D animations using open-source tools.",
}

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              Support Our <span className="text-primary">Creative Vision</span>
            </h1>

            <p className="text-xl mb-8 text-muted-foreground leading-relaxed">
              At Flavor Studios, we're committed to crafting emotionally powerful anime, original 3D animations, and
              meaningful storytelling experiences — all built independently using Blender and open-source tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12 transition-all duration-300"
              >
                <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 h-5 w-5" />
                  Buy Me a Coffee
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/5 font-medium px-8 h-12 transition-all duration-300"
              >
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 font-orbitron">Your Support Makes a Difference</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "Creative Freedom",
                  description:
                    "Your support helps us maintain creative independence and artistic integrity in all our projects.",
                  icon: <Star className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Quality Content",
                  description:
                    "We invest in better tools, training, and resources to elevate the quality of our animations.",
                  icon: <Heart className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Community Growth",
                  description: "Help us build a thriving community of animation enthusiasts and independent creators.",
                  icon: <Coffee className="h-6 w-6 text-primary" />,
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="mb-4">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border border-primary/10 rounded-lg p-6 bg-primary/5">
              <p className="text-lg">
                "If you believe in the value of independent animation and want to support our work, your contribution
                can help us continue producing high-quality content and grow our creative mission."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-orbitron">Ready to Support Our Journey?</h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Every contribution, no matter the size, helps us bring our creative vision to life.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 h-auto transition-all duration-300"
            >
              <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-5 w-5" />
                Buy Me a Coffee ☕
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              Your support is processed securely through Buy Me a Coffee.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
