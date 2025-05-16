import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DMCAPage() {
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
              DMCA Notice and Takedown Policy
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
              Flavor Studios ("we," "us," or "our") respects the intellectual property rights of others and expects its
              users to do the same. It is our policy to respond to clear notices of alleged copyright infringement in
              accordance with the Digital Millennium Copyright Act ("DMCA") and other applicable intellectual property
              laws.
            </p>

            <p className="mb-6">
              This DMCA Notice and Takedown Policy outlines the procedures for reporting claims of copyright
              infringement and how we handle such notices.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">
              1. Filing a DMCA Notice (Copyright Infringement Notification)
            </h2>
            <p className="mb-4">
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement
              and is accessible on our website, please submit a written DMCA notice to our Designated Agent that
              includes the following:
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.
              </li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>
                Identification of the material that is claimed to be infringing and information reasonably sufficient to
                permit us to locate the material (URL or direct link).
              </li>
              <li>Your name, address, telephone number, and email address.</li>
              <li>
                A statement that you have a good faith belief that the use of the material in the manner complained of
                is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                A statement that the information in the notification is accurate and, under penalty of perjury, that you
                are the copyright owner or authorized to act on behalf of the owner.
              </li>
            </ul>

            <p className="font-medium mb-4">Submit DMCA Notices to:</p>
            <p className="mb-6">
              Designated DMCA Agent
              <br />
              Flavor Studios
              <br />
              Email:{" "}
              <a href="mailto:contact@flavorstudios.in" className="text-primary hover:underline">
                contact@flavorstudios.in
              </a>
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">
              2. Counter Notification (Restoring Removed Content)
            </h2>
            <p className="mb-4">
              If you believe your content was removed (or access to it was disabled) in error or misidentification, you
              may submit a written counter-notification to our Designated Agent that includes:
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>Your physical or electronic signature.</li>
              <li>
                Identification of the material that has been removed or to which access has been disabled and the
                location at which the material appeared before it was removed or access to it was disabled.
              </li>
              <li>
                A statement under penalty of perjury that you have a good faith belief that the material was removed or
                disabled as a result of mistake or misidentification.
              </li>
              <li>Your name, address, telephone number, and email address.</li>
              <li>
                A statement that you consent to the jurisdiction of the courts in India and that you will accept service
                of process from the person who provided the original DMCA notice or their agent.
              </li>
            </ul>
            <p className="mb-6">
              Upon receipt of a valid counter-notification, we may restore the removed content within 10–14 business
              days unless the original complainant files a court action.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">3. Repeat Infringer Policy</h2>
            <p className="mb-6">
              Flavor Studios has a zero-tolerance policy for repeat copyright infringers. If a user is found to
              repeatedly violate copyright laws, we reserve the right to terminate their access to our services.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">4. Misuse of DMCA Notices</h2>
            <p className="mb-6">
              Submitting false or misleading DMCA notices or counter-notices can result in legal liability. We strongly
              recommend that you consult a legal professional before submitting any claim.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-orbitron">5. Contact Information</h2>
            <p className="mb-4">
              If you have any questions regarding this DMCA Policy, please reach out to us through our{" "}
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
