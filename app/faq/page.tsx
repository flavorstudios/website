import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqCategories = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is Flavor Studios?",
          answer:
            "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We create videos, blog posts, and interactive experiences for anime fans around the world.",
        },
        {
          question: "How often do you release new content?",
          answer:
            "We typically release new videos weekly and blog posts 2-3 times per week. Our schedule may vary during special events or series productions.",
        },
        {
          question: "Do you create original anime?",
          answer:
            "While we primarily focus on anime analysis, reviews, and educational content, we do create short-form original animations and are working towards producing longer-form original content in the future.",
        },
        {
          question: "Where can I find all your content?",
          answer:
            "Our content is available on our website, YouTube channel, and various social media platforms. The most comprehensive collection is right here on our website.",
        },
      ],
    },
    {
      title: "Content & Submissions",
      items: [
        {
          question: "Can I suggest topics for future videos or blog posts?",
          answer:
            "We welcome suggestions from our community. You can submit your ideas through our contact form or by commenting on our social media posts.",
        },
        {
          question: "Do you accept guest blog posts or collaborations?",
          answer:
            "Yes, we occasionally feature guest writers and collaborate with other creators. Please reach out through our contact page with your proposal and samples of your work.",
        },
        {
          question: "How do you select which anime to review?",
          answer:
            "We consider a mix of popular new releases, classics, and hidden gems. Our selection is based on team interests, community requests, and current trends in the anime community.",
        },
        {
          question: "Can I use your content in my own projects?",
          answer:
            "Our content is protected by copyright. For educational use or limited excerpts, please review our Media Usage Policy. For commercial use or substantial portions, please contact us for permission.",
        },
      ],
    },
    {
      title: "Support & Membership",
      items: [
        {
          question: "How can I support Flavor Studios?",
          answer:
            "You can support us by subscribing to our YouTube channel, sharing our content, and if you're able, becoming a financial supporter through our 'Buy Me A Coffee' page.",
        },
        {
          question: "What benefits do supporters receive?",
          answer:
            "Supporters get access to exclusive content, early video releases, behind-the-scenes material, and special recognition in our videos and on our website, depending on the support tier.",
        },
        {
          question: "Can I cancel my support subscription at any time?",
          answer:
            "Yes, you can cancel your support subscription at any time. Your benefits will continue until the end of your current billing period.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes, we use industry-standard security measures and trusted payment processors to ensure your payment information is secure. We never store your full credit card information on our servers.",
        },
      ],
    },
    {
      title: "Technical & Website",
      items: [
        {
          question: "The website/video isn't working properly. What should I do?",
          answer:
            "First, try refreshing the page or clearing your browser cache. If the issue persists, please report it through our contact form with details about the problem and your device/browser information.",
        },
        {
          question: "Do you have a mobile app?",
          answer:
            "We don't currently have a dedicated mobile app, but our website is fully responsive and optimized for mobile devices.",
        },
        {
          question: "How can I be notified of new content?",
          answer:
            "You can subscribe to our newsletter, enable notifications on our YouTube channel, or follow us on social media to be notified when we release new content.",
        },
        {
          question: "Is my personal data protected?",
          answer:
            "Yes, we take data protection seriously. Please review our Privacy Policy for detailed information on how we collect, use, and protect your personal data.",
        },
      ],
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
              <span className="gradient-text">Frequently Asked Questions</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-6 text-muted-foreground">
              Find answers to common questions about Flavor Studios, our content, and how to get involved.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron gradient-text">{category.title}</h2>

                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem
                      key={itemIndex}
                      value={`item-${categoryIndex}-${itemIndex}`}
                      className="border-b border-border"
                    >
                      <AccordionTrigger className="text-lg font-medium py-4 hover:text-primary transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20 text-center">
              <h3 className="text-xl font-bold mb-4 font-orbitron">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                If you couldn't find the answer you were looking for, feel free to reach out to us directly.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron text-center">Quick Links</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Support Us",
                  description: "Learn how you can support our content creation.",
                  link: "/support",
                },
                { title: "Contact", description: "Get in touch with our team directly.", link: "/contact" },
                { title: "Privacy Policy", description: "How we protect and use your data.", link: "/privacy-policy" },
                {
                  title: "Terms of Service",
                  description: "Rules and guidelines for using our services.",
                  link: "/terms-of-service",
                },
                {
                  title: "Media Usage Policy",
                  description: "Guidelines for using our content.",
                  link: "/media-usage-policy",
                },
                { title: "Careers", description: "Join our team and create with us.", link: "/career" },
              ].map((link, index) => (
                <div
                  key={index}
                  className="bg-background p-6 rounded-lg border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-lg font-bold mb-2 font-orbitron">{link.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full hover:bg-primary/10">
                    <Link href={link.link}>
                      Visit
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
