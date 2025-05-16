import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Flavor Studios – Collaborations & Questions",
  description:
    "Reach out for inquiries, ideas, or just to say hi. We're always excited to connect with fellow creators and fans.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Contact Us</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-6 text-muted-foreground">
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
                      <p className="text-muted-foreground">contact@flavorstudios.com</p>
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
                  <p className="font-medium">business@flavorstudios.com</p>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Quick answers to the most common questions we receive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[
                {
                  question: "How long does it take to get a response?",
                  answer: "We typically respond to all inquiries within 24-48 hours during business days.",
                },
                {
                  question: "I want to collaborate with Flavor Studios. How do I proceed?",
                  answer:
                    "Please use the contact form and select 'Collaboration' as the subject. Include details about your proposal and we'll get back to you.",
                },
                {
                  question: "Do you accept guest blog posts?",
                  answer:
                    "Yes, we occasionally feature guest writers who are passionate about anime. Contact us with your topic idea and writing samples.",
                },
                {
                  question: "How can I report a technical issue with the website?",
                  answer:
                    "Please use the contact form and select 'Support' as the subject. Include details about the issue you're experiencing and any relevant screenshots.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg border hover:border-primary/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold mb-2 font-orbitron">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
