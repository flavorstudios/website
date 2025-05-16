import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">Effective Date: May 9, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p>
              Flavor Studios ("we," "us," or "our") respects your privacy and is committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website, including any other media form, media channel, mobile website, or mobile
              application related or connected thereto (collectively, the "Site"). Please read this Privacy Policy
              carefully.
            </p>

            <p>
              By accessing or using our Site, you agree to this Privacy Policy. If you do not agree with the terms,
              please do not access the Site.
            </p>

            <h2>Information We Collect</h2>
            <ul>
              <li>
                <strong>Personal Information:</strong> Name, email address, contact details, and other identifiable
                information provided voluntarily when registering, subscribing, or contacting us.
              </li>
              <li>
                <strong>Usage Data:</strong> Information automatically collected when you visit the Site, such as your
                IP address, browser type, operating system, access times, and pages viewed.
              </li>
              <li>
                <strong>Cookies:</strong> Small files placed on your device to enhance your browsing experience,
                remember preferences, and analyze website traffic.
              </li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information collected for the following purposes:</p>
            <ul>
              <li>Provide, operate, and maintain our Site.</li>
              <li>Improve, personalize, and expand our services and content.</li>
              <li>Understand and analyze how you use our Site.</li>
              <li>Develop new products, services, features, and functionalities.</li>
              <li>Communicate with you, including customer support and responding to inquiries.</li>
              <li>
                Send periodic emails and newsletters regarding updates, promotions, and other relevant information.
              </li>
              <li>Protect our Site from fraud, unauthorized activities, and maintain security.</li>
            </ul>

            <h2>Disclosure of Your Information</h2>
            <p>We may share your information under the following circumstances:</p>
            <ul>
              <li>
                With third-party service providers who assist us in operating our website and conducting business
                activities, under strict confidentiality agreements.
              </li>
              <li>If required by law or in response to a legal request.</li>
              <li>To enforce our policies, protect our rights, or ensure the safety of our users and the public.</li>
              <li>In connection with any merger, sale of company assets, financing, or acquisition.</li>
            </ul>

            <h2>Third-Party Websites</h2>
            <p>
              Our Site may contain links to third-party websites. We are not responsible for the privacy practices or
              content of these websites. Please review the privacy policies of third-party sites before providing any
              personal information.
            </p>

            <h2>Security of Your Information</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no security measures are
              completely secure, and we cannot guarantee absolute security. Please use caution when sharing personal
              information online.
            </p>

            <h2>Retention of Your Information</h2>
            <p>
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this
              Privacy Policy unless a longer retention period is required or permitted by law.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access, update, or delete your personal information.</li>
              <li>Opt-out of receiving promotional communications from us.</li>
              <li>Request restriction of processing or object to processing of your personal information.</li>
            </ul>
            <p>To exercise these rights, please contact us using the details provided below.</p>

            <h2>Children's Privacy</h2>
            <p>
              Our Site is not directed toward children under 13 years old, and we do not knowingly collect information
              from individuals under the age of 13.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated
              "Effective Date." We encourage you to review this Privacy Policy regularly.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your
              personal information, please reach out to us through our{" "}
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
