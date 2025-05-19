import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service – Flavor Studios",
  description: "Read the terms and conditions that govern your use of Flavor Studios website and services.",
}

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-orbitron tracking-tight">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">Effective Date: May 9, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg">
            <p className="mb-6">
              Welcome to Flavor Studios ("we," "us," or "our"). These Terms of Service ("Terms") govern your access to
              and use of our website, including any related media, mobile applications, and services (collectively, the
              "Site"). By accessing or using our Site, you agree to be bound by these Terms. If you disagree with any
              part of the Terms, you must not access or use the Site.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Use of the Site</h2>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>You must be at least 13 years of age to use our Site.</li>
              <li>
                You agree to use the Site lawfully and not engage in prohibited activities, such as transmitting viruses
                or harmful content.
              </li>
              <li>
                You must not use the Site in a way that infringes upon the rights of others or restricts their use and
                enjoyment of the Site.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Intellectual Property Rights</h2>
            <p className="mb-6">
              All content on this Site, including text, graphics, logos, images, audio, video, animations, and software,
              is the property of Flavor Studios or its licensors and protected by copyright, trademark, and other
              intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from our
              content without explicit written permission from us.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">User-Generated Content</h2>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                You may submit or upload content to our Site, provided you own the rights or have obtained necessary
                permissions.
              </li>
              <li>
                By submitting content, you grant us a worldwide, royalty-free, non-exclusive license to use, modify,
                publicly display, distribute, and reproduce your content in connection with the Site and our services.
              </li>
              <li>You agree not to submit any offensive, unlawful, defamatory, or infringing material.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">
              Automated Comment Moderation (Perspective API)
            </h2>
            <p className="mb-4">
              We use automated tools to maintain a safe environment, including Google's Perspective API, developed by
              Jigsaw (a unit of Google), to analyze and score user-generated comments for toxicity, spam, or abuse.
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                By submitting a comment, you acknowledge that your comment content (not your name or email) may be sent
                to Google servers for processing.
              </li>
              <li>Comments flagged as highly toxic may be blocked or require manual approval.</li>
              <li>
                We reserve the right to moderate, edit, or remove comments that violate our guidelines or are flagged by
                the Perspective API.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Third-Party Links</h2>
            <p className="mb-6">
              Our Site may include links to third-party websites. We do not control and are not responsible for the
              content, privacy practices, or terms of these external sites.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Disclaimer</h2>
            <p className="mb-6">
              The Site is provided "as is" and "as available." We do not make warranties or representations about the
              accuracy, completeness, reliability, or availability of the content or services provided on the Site. Your
              use of the Site is at your own risk.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Limitation of Liability</h2>
            <p className="mb-6">
              Flavor Studios, its directors, employees, affiliates, or partners will not be liable for any direct,
              indirect, incidental, consequential, or special damages resulting from your use or inability to use our
              Site.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Indemnification</h2>
            <p className="mb-6">
              You agree to indemnify and hold harmless Flavor Studios, its officers, employees, partners, and affiliates
              from any claims, damages, liabilities, or expenses (including legal fees) arising out of your breach of
              these Terms or your use of the Site.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Termination</h2>
            <p className="mb-6">
              We reserve the right to terminate or suspend your access to our Site immediately, without prior notice or
              liability, for any reason, including breach of these Terms.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to
              conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to update or modify these Terms at any time. Any changes will be effective
              immediately upon posting to this page. Continued use of the Site after such changes constitutes your
              acceptance of the revised Terms.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Contact Us</h2>
            <p className="mb-4">
              If you have any questions, concerns, or requests regarding these Terms of Service, please reach out to us
              through our{" "}
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
