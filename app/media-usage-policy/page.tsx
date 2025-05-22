import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Media Usage Policy – Flavor Studios",
  description: "Learn about the guidelines for using Flavor Studios media assets and content.",
}

export default function MediaUsagePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 mb-8 border border-primary/20 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight">
              Media Usage <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground">Effective Date: May 9, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg">
            <p className="mb-6">
              Flavor Studios ("we," "us," or "our") creates original animation content and media assets protected by
              copyright and intellectual property laws. This Media Usage Policy outlines acceptable use of our media
              assets, including videos, images, graphics, animations, and other related content available through our
              website and related platforms.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Permissible Uses</h2>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                Media assets provided by Flavor Studios may be used for personal viewing, education, reviews,
                commentary, news reporting, or criticism purposes, provided appropriate credit is given.
              </li>
              <li>
                Proper attribution should clearly indicate "Courtesy of Flavor Studios" and include a direct link to our
                official website when applicable.
              </li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Prohibited Uses</h2>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                Unauthorized commercial use, distribution, or reproduction of our media assets without prior written
                permission.
              </li>
              <li>Altering, modifying, or creating derivative works from our media without explicit authorization.</li>
              <li>Use of our media assets in any defamatory, misleading, offensive, or unlawful context.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Third-Party Content Usage</h2>
            <p className="mb-6">
              Flavor Studios may use third-party content (images, videos, graphics) for informational, educational,
              reporting, and commentary purposes under fair use guidelines. Proper credit and attribution are given
              wherever applicable. If you own rights to content used and believe it has been used incorrectly, please
              contact us promptly.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Requesting Permission</h2>
            <p className="mb-4">
              For commercial use, publication, redistribution, or any other uses not explicitly covered by permissible
              uses, please contact us to request prior written approval.
            </p>
            <p className="mb-4">Requests should include:</p>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>Detailed description of intended use.</li>
              <li>Specific media asset(s) requested.</li>
              <li>Duration and scope of intended use.</li>
              <li>Contact information for response.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Ownership and Rights</h2>
            <p className="mb-6">
              All media assets remain the sole property of Flavor Studios and its licensors. We reserve all rights not
              expressly granted by this policy.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Enforcement</h2>
            <p className="mb-6">
              Flavor Studios actively monitors and enforces its media usage rights. Unauthorized use may result in legal
              action, including claims for damages, injunctions, and removal of infringing content.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Changes to this Policy</h2>
            <p className="mb-6">
              We reserve the right to update this Media Usage Policy at our discretion. Any modifications will be
              effective immediately upon posting the updated policy on our website.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 font-orbitron">Contact Us</h2>
            <p className="mb-4">
              For questions regarding this Media Usage Policy or to request permission for specific media use, please
              reach out to us through our{" "}
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
