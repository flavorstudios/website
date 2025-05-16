import Link from "next/link"
import Image from "next/image"
import { Coffee, Heart, Star, Users, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export const metadata = {
  title: "Support Flavor Studios – Help Us Create Soulful Anime",
  description:
    "Love what we create? Support us through Buy Me a Coffee or YouTube Memberships. Every contribution fuels original, independent anime built with heart.",
}

export default function SupportPage() {
  const supportTiers = [
    {
      name: "Fan",
      price: "$5",
      description: "Perfect for casual supporters who enjoy our content.",
      benefits: [
        "Access to supporter-only blog posts",
        "Your name in credits on one video",
        "Early access to new videos (24h)",
      ],
      popular: false,
      icon: <Coffee className="h-6 w-6" />,
    },
    {
      name: "Supporter",
      price: "$10",
      description: "Our most popular tier for dedicated anime enthusiasts.",
      benefits: [
        "All Fan tier benefits",
        "Exclusive monthly wallpapers",
        "Vote on future video topics",
        "Monthly Q&A participation",
      ],
      popular: true,
      icon: <Heart className="h-6 w-6" />,
    },
    {
      name: "Patron",
      price: "$25",
      description: "The ultimate way to support our content creation.",
      benefits: [
        "All Supporter tier benefits",
        "Custom digital anime-style avatar",
        "Behind-the-scenes content",
        "Early access to new videos (72h)",
        "Direct Discord access to our team",
      ],
      popular: false,
      icon: <Star className="h-6 w-6" />,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Coffee className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Support Our Work</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-6 text-muted-foreground">
              Help us continue creating high-quality anime content and get exclusive perks as a thank you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Check className="h-5 w-5 text-primary" />
                <span>Ad-free content</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Check className="h-5 w-5 text-primary" />
                <span>Exclusive perks</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Check className="h-5 w-5 text-primary" />
                <span>Direct creator access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 font-orbitron text-center">Choose Your Support Tier</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportTiers.map((tier, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${tier.popular ? "border-primary shadow-lg border-2 animate-glow" : "hover:border-primary/50"}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-white text-xs px-3 py-1 rotate-45 transform translate-y-3 translate-x-8 shadow-md">
                        Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-bold font-orbitron">{tier.name}</h3>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground"> / month</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${tier.popular ? "bg-primary hover:bg-primary/90" : "bg-primary/80 hover:bg-primary"}`}
                    >
                      Choose {tier.name}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center text-sm text-muted-foreground">
              <p>All payments are processed securely through Stripe.</p>
              <p>You can cancel your subscription at any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* One-Time Support */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Prefer a One-Time Donation?</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Support us with a one-time donation of any amount. Every contribution helps us create better content for
              the anime community.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {["$5", "$10", "$25", "$50"].map((amount, index) => (
                <Button key={index} variant="outline" className="h-16 text-lg hover:bg-primary/10 hover:border-primary">
                  {amount}
                </Button>
              ))}
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90 mt-2">
              <Coffee className="mr-2 h-5 w-5" />
              Buy Me a Coffee
            </Button>
          </div>
        </div>
      </section>

      {/* Supporters */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Our Amazing Supporters</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              We're grateful to each and every person who supports our passion. Here are some of our top supporters.
            </p>

            <div className="flex justify-center items-center mb-8">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">347 Supporters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 mb-2">
                    <Image
                      src={`/placeholder-8r4x9.png?key=ckpjw&height=64&width=64&query=anime%20avatar%20${index + 1}`}
                      alt={`Supporter ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Supporter#{index + 1}</span>
                  <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 12) + 1} months</span>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" className="mt-10 hover:bg-primary/10">
              <Link href="/supporters">
                View All Supporters
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 font-orbitron text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              {[
                {
                  question: "How will my support be used?",
                  answer:
                    "Your support directly funds our content creation process, allowing us to invest in better equipment, software, and resources to improve our videos and blog content. It also helps cover hosting costs and enables us to dedicate more time to creating the anime content you love.",
                },
                {
                  question: "Can I change or cancel my subscription?",
                  answer:
                    "You can upgrade, downgrade, or cancel your subscription at any time from your account dashboard. Changes will take effect at the start of your next billing cycle.",
                },
                {
                  question: "How do I access supporter-exclusive content?",
                  answer:
                    "After becoming a supporter, you'll receive a welcome email with instructions on how to access your exclusive content and benefits. This typically includes special login credentials for our supporter portal.",
                },
                {
                  question: "Is my payment information secure?",
                  answer:
                    "Yes, we use Stripe for all payment processing, which maintains the highest level of security certification in the industry. We never store your full credit card information on our servers.",
                },
                {
                  question: "Do you offer student discounts?",
                  answer:
                    "Yes! We understand that students may have limited budgets. Contact us with proof of your student status, and we'll provide you with a special discount code.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 shadow-sm border hover:border-primary/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold mb-3 font-orbitron">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Still have questions about supporting us?</p>
              <Button asChild variant="outline" className="hover:bg-primary/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
