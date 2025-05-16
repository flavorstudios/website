import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "About Us – Flavor Studios: Where Anime Meets Emotion",
  description:
    "Discover Flavor Studios – an independent animation studio crafting powerful anime and 3D stories with soul. Built in Blender, powered by passion.",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">About Flavor Studios</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              Passionate creators dedicated to producing high-quality anime-inspired content and building a vibrant
              community of fans.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-orbitron gradient-text">Our Story</h2>
              <div className="space-y-4">
                <p>
                  Flavor Studios was born from a deep love for anime and a desire to create original content that
                  captures the essence of what makes anime special. Founded in 2020, our journey began with a simple
                  YouTube channel and has grown into a creative studio with a passionate community.
                </p>
                <p>
                  What started as a hobby project quickly gained traction as viewers connected with our authentic
                  approach to anime content. We've since expanded our offerings to include in-depth analysis, reviews,
                  original animations, and a blog dedicated to all things anime.
                </p>
                <p>
                  Through our content, we aim to celebrate the art form we love while fostering a welcoming community
                  where anime fans from all backgrounds can connect, engage, and share their passion.
                </p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-xl border border-primary/20 animate-glow">
              <Image
                src="/placeholder.svg?key=n8aol"
                alt="Flavor Studios Workspace"
                width={800}
                height={600}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-orbitron gradient-text">Our Mission</h2>
          <p className="text-xl max-w-3xl mx-auto mb-12">
            To create original anime-inspired content that entertains, educates, and brings together a community of
            passionate fans.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-orbitron">Create</h3>
                <p className="text-muted-foreground">
                  Produce high-quality, original content that respects the art form and resonates with anime fans
                  globally.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-orbitron">Educate</h3>
                <p className="text-muted-foreground">
                  Share knowledge about anime history, production techniques, and cultural context to deepen
                  appreciation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-orbitron">Connect</h3>
                <p className="text-muted-foreground">
                  Build a welcoming, inclusive community where anime enthusiasts can share their passion and connect.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 font-orbitron gradient-text text-center">Meet Our Team</h2>
          <p className="text-xl max-w-3xl mx-auto mb-12 text-center text-muted-foreground">
            The passionate individuals behind Flavor Studios who bring our content to life.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Alex Chen", role: "Founder & Creative Director", image: "team%20member%201%20anime%20style" },
              { name: "Jordan Taylor", role: "Content Producer", image: "team%20member%202%20anime%20style" },
              { name: "Morgan Lee", role: "Animator & Visual Artist", image: "team%20member%203%20anime%20style" },
            ].map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={`/abstract-geometric-shapes.png?key=pd2r1&height=400&width=400&query=${member.image}`}
                      alt={member.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-xl font-bold font-orbitron">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
