import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Disclaimer – Flavor Studios",
  description: "Read important disclaimers regarding the content and information provided by Flavor Studios.",
}

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
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg">
            <p className="mb-6">
              The information provided by Flavor Studios ("we," "us," or "our") on our website and associated media
              platforms is intended for general informational and entertainment purposes only. All content is presented
              in good faith; however, we make no warranty or guarantee regarding the accuracy, adequacy, reliability,
              completeness, or timeliness of the information.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Limitation of Liability</h2>
            <p className="mb-6">
              Under no circumstances shall Flavor Studios or its affiliates, employees, directors, or partners be liable
              for any direct, indirect, incidental, special, consequential, or exemplary damages arising from your use
              of, or reliance on, any content on the Site. Your use of the Site is entirely at your own risk.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">External Links Disclaimer</h2>
            <p className="mb-6">
              Our Site may contain links to external websites or services not operated or controlled by Flavor Studios.
              We do not guarantee or endorse the accuracy, relevance, or completeness of any information on third-party
              websites.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Media and Intellectual Property</h2>
            <p className="mb-6">
              All media content — including videos, graphics, animations, and illustrations — provided by Flavor Studios
              is protected by copyright, trademark, and intellectual property laws. Use of any of our content must
              strictly follow our{" "}
              <Link href="/media-usage-policy" className="text-primary hover:underline">
                Media Usage Policy
              </Link>
              .
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Third-Party Content Usage</h2>
            <p className="mb-6">
              Flavor Studios may occasionally feature third-party content (such as anime images, footage, or reviews)
              for educational, reporting, or commentary purposes under applicable Fair Use provisions. We make every
              effort to credit the rightful owners. If you believe your content was used without proper permission or
              attribution, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">User-Generated Content Disclaimer</h2>
            <p className="mb-6">
              Flavor Studios is not responsible for any content posted by users or third parties on our website or
              social channels. Such content does not reflect the opinions or positions of Flavor Studios. Users remain
              solely responsible for their submissions.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Automated Moderation Tools</h2>
            <p className="mb-6">
              To maintain a safe and respectful environment, we use automated tools — including Google's Perspective API
              — to help detect and manage harmful, toxic, or spammy comments. While these tools assist in moderation, we
              do not guarantee 100% accuracy in filtering content. We reserve the right to edit, block, or remove any
              user submissions at our discretion.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">No Professional Advice</h2>
            <p className="mb-6">
              The content on our Site is not a substitute for professional advice, including legal, financial, mental
              health, or business consulting. You should always seek appropriate guidance tailored to your personal
              situation.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Accuracy of Information</h2>
            <p className="mb-6">
              Although we strive to maintain updated and accurate information, the content may occasionally contain
              errors or omissions. We reserve the right to modify or correct content at any time, without prior notice.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Changes to this Disclaimer</h2>
            <p className="mb-6">
              We may update this Disclaimer from time to time. Changes will take effect immediately upon posting the
              revised version to this page. Continued use of the Site signifies your acceptance of the updated terms.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Contact Us</h2>
            <p className="mb-4">
              If you have any questions or concerns regarding this Disclaimer, feel free to contact us through our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Page
              </Link>
              .
            </p>
            <p className="mb-6">
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
