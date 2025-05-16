import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiePolicyPage() {
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
              Cookie Policy
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
              Flavor Studios ("we," "us," or "our") uses cookies and similar technologies to enhance your browsing
              experience on our website. This Cookie Policy explains what cookies are, how we use them, and your choices
              regarding their use.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">What Are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files placed on your device by websites you visit. They help websites remember your
              preferences, improve user experience, and provide anonymized tracking data to third-party applications.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Types of Cookies We Use</h2>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>
                <strong>Essential Cookies:</strong> Necessary for the website to function properly.
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors interact with our website.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your choices to personalize the experience.
              </li>
              <li>
                <strong>Analytical Cookies:</strong> Track visitor behavior to improve website performance.
              </li>
              <li>
                <strong>Third-party Cookies:</strong> Cookies from integrated third-party services like analytics and
                embedded content.
              </li>
            </ol>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">How We Use Cookies</h2>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>Enhance functionality and user experience.</li>
              <li>Analyze site usage to improve content.</li>
              <li>Remember preferences for personalized browsing.</li>
              <li>Optimize website performance.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Managing Your Cookies</h2>
            <p className="mb-6">
              You can control cookies via your browser settings. Disabling cookies may affect website functionality.
              Visit{" "}
              <a
                href="http://www.aboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.aboutcookies.org
              </a>{" "}
              for more details.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Third-Party Cookies and Content Usage</h2>
            <p className="mb-6">
              Our website uses third-party cookies and may include third-party content (images, media) for
              informational, educational, reporting, and commentary purposes under fair use guidelines. Proper
              attribution is always given. Third-party cookies and content are governed by respective third-party
              policies.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Changes to this Cookie Policy</h2>
            <p className="mb-6">
              We may update this policy periodically. Changes take effect upon posting with a new effective date.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">Contact Us</h2>
            <p className="mb-4">
              If you have questions regarding this policy, please reach out to us through our{" "}
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
