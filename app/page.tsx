import Link from "next/link"
import { ArrowRight, Play, Heart, Users, Sparkles, Film, Gamepad2, BookOpen, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Flavor Studios – Original Anime That Speaks to the Soul",
  description:
    "Step into Flavor Studios — where powerful anime and heartfelt 3D stories are crafted frame by frame in Blender. Watch. Play. Feel. Support storytelling that leaves a mark on your soul.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-accent/30 rounded-full animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Studio Badge */}
            <div className="mb-8 flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5 text-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Independent Animation Studio
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-extrabold mb-8 leading-tight">
              <span className="block mb-2">
                <span className="gradient-text">FLAVOR</span>
              </span>
              <span className="block">
                <span className="gradient-text">STUDIOS</span>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Where <span className="text-primary font-semibold">powerful anime</span> and{" "}
              <span className="text-accent font-semibold">heartfelt 3D stories</span> are crafted{" "}
              <span className="italic">frame by frame</span> in Blender
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl mb-12 text-muted-foreground/80 max-w-2xl mx-auto">
              Creating original anime-inspired content and sharing our passion with the world.{" "}
              <span className="text-foreground font-medium">Watch. Play. Feel.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg">
                <Link href="/watch">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Our Stories
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 h-14 px-8 text-lg"
              >
                <Link href="/about">
                  <Heart className="mr-2 h-5 w-5" />
                  Our Journey
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">14</div>
                <div className="text-sm text-muted-foreground">Blog Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent mb-1">7</div>
                <div className="text-sm text-muted-foreground">Watch Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Made in Blender</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Stories to Tell</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 gradient-text">
                Crafting Stories That Matter
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We believe in the power of animation to heal, inspire, and connect. Every frame is a brushstroke in our
                canvas of emotions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Original Anime */}
              <div className="group relative p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <Film className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-bold mb-4">Original Anime</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Handcrafted anime series and shorts that explore deep themes of humanity, growth, and connection.
                    Every story is built frame by frame with love.
                  </p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    <Link href="/watch/category/original-anime">
                      Explore Stories <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Interactive Games */}
              <div className="group relative p-8 rounded-2xl bg-card border border-accent/10 hover:border-accent/30 transition-all duration-500 hover:shadow-lg hover:shadow-accent/10">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                    <Gamepad2 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-bold mb-4">Interactive Experiences</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Simple yet engaging games that complement our stories. Play, explore, and immerse yourself in our
                    creative universe.
                  </p>
                  <Button asChild variant="ghost" className="text-accent hover:text-accent/80 p-0">
                    <Link href="/play">
                      Start Playing <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Knowledge Sharing */}
              <div className="group relative p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-bold mb-4">Knowledge & Insights</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Anime reviews, Blender tutorials, and behind-the-scenes content. We share our journey and learnings
                    with the community.
                  </p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    <Link href="/blog">
                      Read Our Blog <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-8 gradient-text">Our Vision</h2>
            <div className="text-xl md:text-2xl leading-relaxed space-y-6 text-muted-foreground">
              <p>
                We envision a world where{" "}
                <span className="text-foreground font-semibold">animation transcends entertainment</span> to become a
                medium of healing, growth, and human connection.
              </p>
              <p>
                Through our stories, we aim to <span className="text-primary font-semibold">touch souls</span>, inspire
                dreams, and remind people that they are not alone in their journey.
              </p>
              <p className="text-lg italic text-muted-foreground/80">
                "Every frame we create carries a piece of our heart, hoping to find its way to yours."
              </p>
            </div>
            <div className="mt-12">
              <Button asChild size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                <Link href="/about">
                  <Users className="mr-2 h-5 w-5" />
                  Meet Our Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Preview */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 gradient-text">Latest Creations</h2>
              <p className="text-xl text-muted-foreground">
                Discover our newest stories, insights, and interactive experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Watch Content */}
              <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <Film className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Original Content Coming Soon</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Watch Our Stories</h3>
                  <p className="text-muted-foreground mb-4">
                    Immerse yourself in our handcrafted anime and 3D animations
                  </p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    <Link href="/watch">
                      Explore Videos <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Blog Content */}
              <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all duration-500 hover:shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-accent mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Fresh Insights & Tutorials</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Read Our Blog</h3>
                  <p className="text-muted-foreground mb-4">Anime reviews, Blender tutorials, and creative insights</p>
                  <Button asChild variant="ghost" className="text-accent hover:text-accent/80 p-0">
                    <Link href="/blog">
                      Read Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Play Content */}
              <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl md:col-span-2 lg:col-span-1">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <Gamepad2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Interactive Experiences</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Play & Explore</h3>
                  <p className="text-muted-foreground mb-4">Simple games and interactive experiences for everyone</p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    <Link href="/play">
                      Start Playing <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Support Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-8 gradient-text">Join Our Journey</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Be part of our story. Support independent animation, connect with fellow anime lovers, and help us create
              content that matters.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-orbitron font-bold mb-4">Community</h3>
                <p className="text-muted-foreground mb-6">
                  Connect with fellow anime enthusiasts, share your thoughts, and be part of our growing community.
                </p>
                <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              <div className="p-8 rounded-2xl bg-card border border-accent/10 hover:border-accent/30 transition-all duration-300">
                <Coffee className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-orbitron font-bold mb-4">Support Us</h3>
                <p className="text-muted-foreground mb-6">
                  Help us continue creating meaningful content. Every contribution fuels our passion and creativity.
                </p>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                  <Link href="/support">
                    <Coffee className="mr-2 h-4 w-4" />
                    Buy Me A Coffee
                  </Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">Ready to dive deeper into our world?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  <Link href="/watch">
                    <Play className="mr-2 h-5 w-5" />
                    Start Watching
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <Link href="/faq">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 gradient-text">
              Built with Passion. Powered by Dreams.
            </h2>
            <p className="text-lg text-muted-foreground">
              Every frame, every story, every moment is crafted with love and dedication to touch your soul.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
