import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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
              Terms of Service
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
              Welcome to Flavor Studios. These Terms of Service ("Terms") govern your access to and use of the Flavor
              Studios website, including any content, functionality, and services offered on or through the website (the
              "Site").
            </p>
            <p>
              Please read these Terms carefully before using our Site. By accessing or using the Site, you agree to be
              bound by these Terms. If you do not agree to these Terms, you must not access or use the Site.
            </p>

            <h2>Eligibility</h2>
            <p>
              The Site is offered and available to users who are 13 years of age or older. By using the Site, you
              represent and warrant that you meet the eligibility requirements. If you do not meet these requirements,
              you must not access or use the Site.
            </p>

            <h2>Account Registration</h2>
            <p>
              To access certain features of the Site, you may be required to register for an account. When you register,
              you agree to provide accurate, current, and complete information and to update such information to keep it
              accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your account credentials and for any activity that occurs under your
              account. You agree to notify us immediately of any unauthorized access to or use of your account.
            </p>

            <h2>User Content</h2>
            <p>
              Our Site may allow you to post, link, store, share, and otherwise make available certain information,
              text, graphics, videos, or other material ("User Content"). You are responsible for the User Content that
              you post on or through the Site, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting User Content on or through the Site, you grant us a non-exclusive, transferable,
              sub-licensable, royalty-free, worldwide license to use, modify, publicly perform, publicly display,
              reproduce, and distribute such User Content on and through the Site.
            </p>
            <p>You represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
              <li>
                The posting of your User Content does not violate the privacy rights, publicity rights, copyrights,
                contract rights, or any other rights of any person or entity
              </li>
            </ul>

            <h2>Prohibited Uses</h2>
            <p>
              You may use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the
              Site:
            </p>
            <ul>
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>
                To transmit, or procure the sending of, any advertising or promotional material, including any "junk
                mail," "chain letter," "spam," or any other similar solicitation
              </li>
              <li>
                To impersonate or attempt to impersonate Flavor Studios, a Flavor Studios employee, another user, or any
                other person or entity
              </li>
              <li>
                To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Site, or
                which may harm Flavor Studios or users of the Site
              </li>
            </ul>

            <h2>Intellectual Property Rights</h2>
            <p>
              The Site and its entire contents, features, and functionality (including but not limited to all
              information, software, text, displays, images, video, and audio, and the design, selection, and
              arrangement thereof) are owned by Flavor Studios, its licensors, or other providers of such material and
              are protected by copyright, trademark, patent, trade secret, and other intellectual property or
              proprietary rights laws.
            </p>
            <p>
              These Terms permit you to use the Site for your personal, non-commercial use only. You must not reproduce,
              distribute, modify, create derivative works of, publicly display, publicly perform, republish, download,
              store, or transmit any of the material on our Site, except as follows:
            </p>
            <ul>
              <li>
                Your computer may temporarily store copies of such materials in RAM incidental to your accessing and
                viewing those materials
              </li>
              <li>
                You may store files that are automatically cached by your Web browser for display enhancement purposes
              </li>
              <li>
                You may print or download one copy of a reasonable number of pages of the Site for your own personal,
                non-commercial use and not for further reproduction, publication, or distribution
              </li>
            </ul>

            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Site immediately, without prior notice or
              liability, under our sole discretion, for any reason whatsoever and without limitation, including but not
              limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Site, or contact us to request
              account deletion.
            </p>

            <h2>Disclaimer of Warranties</h2>
            <p>
              The Site is provided on an "AS IS" and "AS AVAILABLE" basis. Flavor Studios expressly disclaims all
              warranties of any kind, whether express or implied, including but not limited to the implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              In no event shall Flavor Studios, its directors, employees, partners, agents, suppliers, or affiliates, be
              liable for any indirect, incidental, special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Site.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without
              regard to its conflict of law provisions.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
              provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>
              Email: legal@flavorstudios.com
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
