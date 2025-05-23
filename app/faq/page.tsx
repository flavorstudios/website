import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// Define FAQ data structure for schema generation
const faqCategories = [
  {
    title: "General Questions",
    items: [
      {
        question: "What is Flavor Studios?",
        answer:
          "Flavor Studios is an independent animation studio that creates original anime and 3D animated stories built in Blender.",
      },
      {
        question: "How can I support Flavor Studios?",
        answer: "You can support us via Buy Me a Coffee or YouTube Memberships, available on our Support page.",
      },
      {
        question: "How often do you release new content?",
        answer: "We typically release new content every few months.",
      },
    ],
  },
  {
    title: "Technical Questions",
    items: [
      {
        question: "What software do you use?",
        answer: "We primarily use Blender for 3D animation and editing.",
      },
      {
        question: "How long does it take to make an episode?",
        answer: "The production time varies, but it generally takes several months to complete an episode.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div>
      {/* Hero Section - Left-aligned like Support page */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {" "}
            {/* Changed from max-w-3xl to max-w-4xl to match content width */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight text-left">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl mb-6 text-muted-foreground leading-relaxed text-left">
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

            <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20 text-left">
              {" "}
              {/* Changed from text-center to text-left */}
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
            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-orbitron text-left">Quick Links</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Rest of the code remains the same */}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
