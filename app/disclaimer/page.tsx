import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 mb-8 border border-primary/20 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-orbitron tracking-tight">Disclaimer</h1>
            <p className="text-lg text-muted-foreground">Effective Date: May 9, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p>
              The information provided by Flavor Studios ("we," "us," or "our") on our website and associated media
              platforms is for general informational and entertainment purposes only. All content provided on the Site
              is presented in good faith; however, we make no representation or warranty regarding the accuracy,
              adequacy, reliability, completeness, or timeliness of any information provided.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Under no circumstances shall Flavor Studios or its affiliates, employees, directors, or partners be liable
              for any direct, indirect, incidental, special, consequential, or exemplary damages arising out of or in
              connection with your use or reliance on the content presented on the Site. Your use of our Site and
              reliance on any information is entirely at your own risk.
            </p>

            <h2>External Links Disclaimer</h2>
            <p>
              Our website may contain links to external websites or services that are not affiliated with or controlled
              by Flavor Studios. We do not endorse, guarantee, or assume responsibility for the accuracy, relevance, or
              completeness of any information provided by third-party websites linked to our Site.
            </p>

            <h2>Media and Intellectual Property</h2>
            <p>
              All media content, including videos, graphics, animations, and images provided by Flavor Studios, is
              protected by copyright and other intellectual property laws. Any use of our media content must comply with
              our{" "}
              <Link href="/media-usage-policy" className="text-primary hover:underline">
                Media Usage Policy
              </Link>
              .
            </p>

            <h2>Third-Party Content Usage</h2>
            <p>
              Flavor Studios may feature content, including images and media from external creators and websites. Such
              third-party content is used strictly for informational, educational, reporting, or commentary purposes,
              adhering to fair use guidelines and applicable laws. We make every effort to credit and attribute
              third-party content appropriately. If you believe your content has been used improperly, please contact us
              immediately.
            </p>

            <h2>User-Generated Content Disclaimer</h2>
            <p>
              Flavor Studios is not responsible or liable for content posted by users or third parties on our website or
              social media platforms. Users are solely responsible for any content they post, and such content does not
              reflect the views or positions of Flavor Studios.
            </p>

            <h2>No Professional Advice</h2>
            <p>
              Information provided by Flavor Studios is not intended as professional advice, including but not limited
              to legal, financial, or business advice. Always seek professional advice tailored specifically to your
              individual circumstances.
            </p>

            <h2>Accuracy of Content</h2>
            <p>
              While we endeavor to maintain accurate and updated information, Flavor Studios cannot guarantee that all
              content is free of errors or inaccuracies. We reserve the right to make modifications or corrections to
              our content at any time without prior notice.
            </p>

            <h2>Changes to this Disclaimer</h2>
            <p>
              We may revise and update this Disclaimer periodically. Changes are effective immediately upon posting the
              revised Disclaimer on this website. Continued use of the Site constitutes your acceptance of any updates.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Disclaimer, please reach out to us through our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Page
              </Link>
              .
            </p>
            <p>
              Flavor Studios
              <br />
              Website:{" "}
              <a
                href="https://flavorstudios.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://flavorstudios.in
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
