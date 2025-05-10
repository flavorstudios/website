import Head from "next/head"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="relative pt-16">
      <Head>
        <title>Privacy Policy – Flavor Studios</title>
        <meta
          name="description"
          content="Read how Flavor Studios handles your personal data, cookies, and privacy when you interact with our platform."
        />
      </Head>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-4xl">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-3xl md:text-4xl font-bold">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Effective Date: May 9, 2025</p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                Flavor Studios ("we," "us," or "our") respects your privacy and is committed to protecting your personal
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website, including any other media form, media channel, mobile website, or mobile
                application related or connected thereto (collectively, the "Site"). Please read this Privacy Policy
                carefully.
              </p>

              <p className="text-lg leading-relaxed mb-8">
                By accessing or using our Site, you agree to this Privacy Policy. If you do not agree with the terms,
                please do not access the Site.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2">
                  <span className="font-bold">Personal Information:</span>
                  <span>
                    Name, email address, contact details, and other identifiable information provided voluntarily when
                    registering, subscribing, or contacting us.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">Usage Data:</span>
                  <span>
                    Information automatically collected when you visit the Site, such as your IP address, browser type,
                    operating system, access times, and pages viewed.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">Cookies:</span>
                  <span>
                    Small files placed on your device to enhance your browsing experience, remember preferences, and
                    analyze website traffic.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information collected for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
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

              <h2 className="text-2xl font-bold mt-8 mb-4">Disclosure of Your Information</h2>
              <p className="mb-4">We may share your information under the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  With third-party service providers who assist us in operating our website and conducting business
                  activities, under strict confidentiality agreements.
                </li>
                <li>If required by law or in response to a legal request.</li>
                <li>To enforce our policies, protect our rights, or ensure the safety of our users and the public.</li>
                <li>In connection with any merger, sale of company assets, financing, or acquisition.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Websites</h2>
              <p className="mb-6">
                Our Site may contain links to third-party websites. We are not responsible for the privacy practices or
                content of these websites. Please review the privacy policies of third-party sites before providing any
                personal information.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Security of Your Information</h2>
              <p className="mb-6">
                We implement reasonable security measures to protect your information. However, no security measures are
                completely secure, and we cannot guarantee absolute security. Please use caution when sharing personal
                information online.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Retention of Your Information</h2>
              <p className="mb-6">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this
                Privacy Policy unless a longer retention period is required or permitted by law.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Access, update, or delete your personal information.</li>
                <li>Opt-out of receiving promotional communications from us.</li>
                <li>Request restriction of processing or object to processing of your personal information.</li>
              </ul>
              <p className="mb-6">To exercise these rights, please contact us using the details provided below.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
              <p className="mb-6">
                Our Site is not directed toward children under 13 years old, and we do not knowingly collect information
                from individuals under the age of 13.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p className="mb-6">
                We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated
                "Effective Date." We encourage you to review this Privacy Policy regularly.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
              <p className="mb-2">If you have questions about this Privacy Policy, please contact us at:</p>
              <p className="mb-6">
                Flavor Studios
                <br />
                Email: contact@flavorstudios.in
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
