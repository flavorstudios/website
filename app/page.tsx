import Link from "next/link"
import { ArrowRight, Play, Heart, Users, Film, Gamepad2, BookOpen, Coffee, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Flavor Studios – Original Anime That Speaks to the Soul",
  description:
    "Step into Flavor Studios — where powerful anime and heartfelt 3D stories are crafted frame by frame in Blender. Watch. Play. Feel. Support storytelling that leaves a mark on your soul.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight">
              Original Anime That <span className="text-primary">Speaks to the Soul</span>
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed">
              Step into Flavor Studios — where powerful anime and heartfelt 3D stories are crafted frame by frame in
              Blender. Watch. Play. Feel. Support storytelling that leaves a mark on your soul.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12 transition-all duration-300"
              >
                <Link href="/watch">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Our Stories
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/5 font-medium px-8 h-12 transition-all duration-300"
              >
                <Link href="/about">
                  Our Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/5 font-medium px-8 h-12 transition-all duration-300"
              >
                <Link href="/play">
                  Play & Explore
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Create Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">What We Create</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Original Anime",
                  description:
                    "Handcrafted anime series and shorts that explore deep themes of humanity, growth, and connection.",
                  icon: <Film className="h-6 w-6 text-primary" />,
                  link: "/watch/category/original-anime",
                },
                {
                  title: "Interactive Games",
                  description:
                    "Simple yet engaging games that complement our stories and immerse you in our creative universe.",
                  icon: <Gamepad2 className="h-6 w-6 text-primary" />,
                  link: "/play",
                },
                {
                  title: "Knowledge Sharing",
                  description: "Anime reviews, Blender tutorials, and behind-the-scenes content for the community.",
                  icon: <BookOpen className="h-6 w-6 text-primary" />,
                  link: "/blog",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-5 pb-1">
                    <div className="mb-3">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                      <Link href={item.link}>
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border border-primary/10 rounded-lg p-5 bg-primary/5 mb-2">
              <p className="text-lg">
                "We believe in the power of animation to heal, inspire, and connect. Every frame we create carries a
                piece of our heart, hoping to find its way to yours."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Featured Content</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Watch Content */}
              <Card className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-5 pb-1">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Film className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Original Content Coming Soon</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Watch Our Stories</h3>
                  <p className="text-muted-foreground mb-4">
                    Immerse yourself in our handcrafted anime and 3D animations
                  </p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    <Link href="/watch">
                      Explore Videos <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Blog Content */}
              <Card className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-5 pb-1">
                  <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-accent mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Fresh Insights & Tutorials</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Read Our Blog</h3>
                  <p className="text-muted-foreground mb-4">Anime reviews, Blender tutorials, and creative insights</p>
                  <Button asChild variant="ghost" className="text-accent hover:text-accent/80 p-0">
                    <Link href="/blog">
                      Read Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 font-orbitron">Explore All Our Content</h3>
              <p className="text-muted-foreground mb-6">
                Discover our complete collection of stories, games, and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Link href="/watch">All Videos</Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Link href="/blog">All Articles</Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Link href="/play">All Games</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron">Our Vision & Mission</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Meaningful Stories",
                  description:
                    "We create content that resonates deeply, exploring themes of growth, connection, and humanity.",
                  icon: <Heart className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Open Source Spirit",
                  description:
                    "Built entirely with Blender and open-source tools, proving that passion can create magic.",
                  icon: <Star className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Community First",
                  description: "We believe in building a community where anime lovers can connect and grow together.",
                  icon: <Users className="h-6 w-6 text-primary" />,
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-5 pb-1">
                    <div className="mb-3">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border border-primary/10 rounded-lg p-5 bg-primary/5 mb-2">
              <p className="text-lg">
                "We envision a world where animation transcends entertainment to become a medium of healing, growth, and
                human connection. Through our stories, we aim to touch souls, inspire dreams, and remind people that
                they are not alone in their journey."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Support CTA */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron">Join Our Creative Journey</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Be part of our story. Support independent animation and help us create content that matters.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 h-auto transition-all duration-300"
            >
              <Link href="/support">
                <Coffee className="mr-2 h-5 w-5" />
                Support Our Work
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Your support helps us continue creating meaningful content.
            </p>

            <p className="text-sm text-muted-foreground mt-4">
              Want to learn more?{" "}
              <Link href="/about" className="text-primary hover:underline">
                Read our story
              </Link>{" "}
              or check our{" "}
              <Link href="/faq" className="text-primary hover:underline">
                FAQ page
              </Link>{" "}
              for more information.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
