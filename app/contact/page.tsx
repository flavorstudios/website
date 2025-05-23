import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Clock, ArrowRight, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Contact Flavor Studios – Collaborations & Questions",
  description:
    "Reach out for inquiries, ideas, or just to say hi. We're always excited to connect with fellow creators and fans.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Aligned with content below */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight">
              Contact <span className="text-primary">Us</span>
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed max-w-2xl">
              Have a question, feedback, or want to collaborate? We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold mb-8 font-orbitron">Get In Touch</h2>
                <p className="text-muted-foreground mb-10">
                  Whether you have a question about our content, want to collaborate, or just want to say hello, we're
                  here to help. Fill out the form and we'll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-orbitron">Email</h3>
                      <p className="text-muted-foreground">contact@flavorstudios.in</p>
                      <p className="text-sm text-muted-foreground mt-1">For general inquiries and support</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-orbitron">Social Media</h3>
                      <p className="text-muted-foreground">@FlavorStudios</p>
                      <p className="text-sm text-muted-foreground mt-1">DM us on any social platform</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-orbitron">Response Time</h3>
                      <p className="text-muted-foreground">Within 24-48 hours</p>
                      <p className="text-sm text-muted-foreground mt-1">We try to respond as quickly as possible</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-card rounded-lg border animate-glow">
                  <h3 className="text-lg font-bold mb-4 font-orbitron">Business Inquiries</h3>
                  <p className="text-muted-foreground mb-4">
                    For sponsorships, business partnerships, or collaboration opportunities:
                  </p>
                  <p className="font-medium">contact@flavorstudios.in</p>
                </div>

                {/* FAQ CTA Button */}
                <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-bold mb-4 font-orbitron">Have Questions?</h3>
                  <p className="text-muted-foreground mb-6">
                    Check out our frequently asked questions page for quick answers to common questions.
                  </p>
                  <Button asChild className="group">
                    <a href="/faq" className="inline-flex items-center">
                      Visit our FAQ Page
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Form */}
              <div className="bg-card p-8 rounded-lg border shadow-sm">
                <h3 className="text-2xl font-bold mb-6 font-orbitron">Send Us a Message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Select>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="collab">Collaboration</SelectItem>
                        <SelectItem value="business">Business Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="privacy" className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Send Message
                  </Button>
                </form>

                {/* What to Expect - New Enhancement */}
                <div className="mt-8 pt-8 border-t">
                  <h4 className="text-lg font-bold mb-4 font-orbitron">What to Expect</h4>
                  <ul className="space-y-3">
                    {[
                      "You'll receive an email confirmation immediately",
                      "Our team will review your message within 24 hours",
                      "We'll respond with helpful information or next steps",
                      "For complex inquiries, we may schedule a follow-up call",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Process Timeline */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 font-orbitron text-center">Our Contact Process</h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-primary/30"></div>

              {/* Timeline items */}
              <div className="space-y-16">
                {[
                  {
                    title: "Submit Your Message",
                    description:
                      "Fill out our contact form with your details and inquiry. Be as specific as possible to help us understand your needs.",
                  },
                  {
                    title: "Confirmation & Review",
                    description:
                      "You'll receive an immediate confirmation. Our team reviews all inquiries within 24 hours during business days.",
                  },
                  {
                    title: "Personalized Response",
                    description:
                      "We'll respond with tailored information addressing your specific questions or concerns.",
                  },
                  {
                    title: "Follow-Up & Resolution",
                    description:
                      "For complex matters, we may schedule additional communication to ensure your inquiry is fully resolved.",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative flex items-center">
                    <div className={`w-1/2 pr-8 text-right ${index % 2 !== 0 ? "order-2" : ""}`}>
                      <h3 className="text-xl font-bold mb-2 font-orbitron">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center z-10">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>

                    <div className={`w-1/2 pl-8 ${index % 2 === 0 ? "order-2" : ""}`}>
                      {index % 2 !== 0 && (
                        <>
                          <h3 className="text-xl font-bold mb-2 font-orbitron">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
