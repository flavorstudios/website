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
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-orbitron tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">Last Updated: May 16, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Introduction</h2>
            <p>
              At Flavor Studios ("we," "our," or "us"), we respect your privacy and are committed to protecting your
              personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website, including any other media form, media channel, mobile website, or mobile
              application related or connected to it (collectively, the "Site").
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy,
              please do not access the Site.
            </p>

            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, information we obtain automatically when you visit
              the Site, and information from third-party sources.
            </p>

            <h3>Personal Data</h3>
            <p>When you interact with our Site, we may collect personal data including but not limited to:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Username and password</li>
              <li>Comments, feedback, and other content you provide</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our Site, we may automatically collect certain information about your device and usage,
              including:
            </p>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website</li>
              <li>Pages you view</li>
              <li>Time spent on pages</li>
              <li>Links you click</li>
              <li>Other browsing data</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We may use the information we collect for various purposes, including:</p>
            <ul>
              <li>Providing, maintaining, and improving our Site</li>
              <li>Processing transactions and sending related information</li>
              <li>Responding to comments, questions, and requests</li>
              <li>Sending administrative information, updates, and marketing communications</li>
              <li>Monitoring and analyzing trends, usage, and activities</li>
              <li>Detecting, preventing, and addressing technical issues</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>Sharing Your Information</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>To protect and defend our rights and property</li>
              <li>With your consent or at your direction</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Site and hold certain
              information. Cookies are files with a small amount of data that may include an anonymous unique
              identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
              sent.
            </p>

            <h2>Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the
              security of any personal information we process. However, please note that no electronic transmission or
              storage of information can be entirely secure, and we cannot guarantee absolute security.
            </p>

            <h2>Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectify inaccurate personal data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p>To exercise these rights, please contact us using the information provided below.</p>

            <h2>Children's Privacy</h2>
            <p>
              Our Site is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: privacy@flavorstudios.com
              <br />
              Contact Form:{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
