import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Briefcase, Clock, MapPin, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CareerPage() {
  const openPositions = [
    {
      id: "content-creator",
      title: "Anime Content Creator",
      type: "Full-time",
      location: "Remote",
      salary: "Competitive",
      description:
        "We're looking for a passionate anime content creator to join our team and help produce high-quality videos and blog posts.",
      responsibilities: [
        "Create engaging anime-related video content",
        "Write in-depth blog posts and analyses",
        "Stay up-to-date with the latest anime releases and trends",
        "Engage with our community across social platforms",
      ],
      requirements: [
        "Deep knowledge and passion for anime",
        "Experience with video editing and production",
        "Excellent writing and communication skills",
        "Familiarity with YouTube and content creation best practices",
      ],
    },
    {
      id: "animator",
      title: "2D Animator",
      type: "Part-time",
      location: "Remote",
      salary: "Project-based",
      description:
        "Join our creative team to help bring our original anime-inspired characters and stories to life through animation.",
      responsibilities: [
        "Create fluid and expressive character animations",
        "Collaborate with our art team on visual storytelling",
        "Maintain consistent style and quality across projects",
        "Meet project deadlines and milestones",
      ],
      requirements: [
        "Portfolio demonstrating 2D animation skills",
        "Experience with animation software (e.g., Adobe Animate, Toon Boom)",
        "Understanding of animation principles",
        "Passion for anime and animation styles",
      ],
    },
    {
      id: "web-developer",
      title: "Web Developer",
      type: "Contract",
      location: "Remote",
      salary: "Competitive",
      description:
        "We're seeking a skilled web developer to help enhance and maintain our website and interactive features.",
      responsibilities: [
        "Maintain and improve our website functionality",
        "Develop new interactive features for our community",
        "Ensure optimal performance and user experience",
        "Collaborate with our design team",
      ],
      requirements: [
        "Experience with modern web development (React, Next.js)",
        "Strong understanding of frontend and backend technologies",
        "Knowledge of responsive design principles",
        "Problem-solving skills and attention to detail",
      ],
    },
  ]

  const benefits = [
    {
      title: "Flexible Schedule",
      description: "Work when you're most productive with our flexible scheduling options.",
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: "Remote Work",
      description: "Join our team from anywhere in the world with our fully remote work environment.",
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      title: "Competitive Compensation",
      description: "Receive fair compensation for your skills and contributions to our team.",
      icon: <Banknote className="h-6 w-6" />,
    },
    {
      title: "Growth Opportunities",
      description: "Develop your skills and advance your career with our supportive team.",
      icon: <ArrowRight className="h-6 w-6" />,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Join Our Team</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10 text-muted-foreground">
              Help us create amazing anime content and be part of our growing creative studio.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <a href="#positions">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Working Here */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-lg overflow-hidden shadow-xl border border-primary/20 animate-glow">
                <Image
                  src="/placeholder-g6l95.png"
                  alt="Our Team"
                  width={800}
                  height={600}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6 font-orbitron gradient-text">Why Work With Us?</h2>
                <div className="space-y-4">
                  <p>
                    At Flavor Studios, we're building a team of passionate creators who love anime and want to share
                    that passion with the world. We believe in creating a supportive, collaborative environment where
                    creativity thrives.
                  </p>
                  <p>
                    As a growing creative studio, we offer unique opportunities to make a real impact. Your ideas will
                    be heard, your work will be seen by our audience, and you'll have the chance to grow alongside us.
                  </p>
                  <p>
                    We value diversity of thought, experience, and perspective. We believe that bringing together people
                    with different backgrounds and viewpoints leads to more innovative and engaging content.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-orbitron">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 font-orbitron text-center">Open Positions</h2>

            <div className="grid grid-cols-1 gap-8">
              {openPositions.map((position, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold font-orbitron mb-2">{position.title}</h3>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {position.type}
                          </span>
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {position.location}
                          </span>
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <Banknote className="h-4 w-4 mr-1" />
                            {position.salary}
                          </span>
                        </div>
                      </div>
                      <Button asChild className="mt-4 md:mt-0 bg-primary hover:bg-primary/90">
                        <Link href={`/career/${position.id}`}>
                          Apply Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <p className="mb-6">{position.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-3 font-orbitron">Responsibilities</h4>
                        <ul className="space-y-2">
                          {position.responsibilities.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold mb-3 font-orbitron">Requirements</h4>
                        <ul className="space-y-2">
                          {position.requirements.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20 text-center">
              <h3 className="text-xl font-bold mb-4 font-orbitron">Don't see a position that fits?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We're always looking for talented individuals who are passionate about anime and content creation. Send
                us your resume and tell us how you can contribute to our team.
              </p>
              <Button asChild variant="outline" className="hover:bg-primary/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 font-orbitron">What Our Team Says</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    "Working at Flavor Studios has been an amazing experience. I get to combine my passion for anime with my skills in content creation, and I'm constantly learning and growing.",
                  name: "Alex Chen",
                  role: "Content Creator",
                  avatar: "team%20member%201%20anime%20style",
                },
                {
                  quote:
                    "The flexibility and creative freedom at Flavor Studios is unmatched. I love being able to bring my ideas to the table and see them come to life in our projects.",
                  name: "Jordan Taylor",
                  role: "Animator",
                  avatar: "team%20member%202%20anime%20style",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 mb-4">
                        <Image
                          src={`/abstract-geometric-shapes.png?key=ckpjw&height=64&width=64&query=${testimonial.avatar}`}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-center mb-4 italic">"{testimonial.quote}"</p>
                      <div className="text-center">
                        <h4 className="font-bold font-orbitron">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Ready to Join Our Team?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take the first step towards an exciting career in anime content creation. Browse our open positions and
              apply today!
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <a href="#positions">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
