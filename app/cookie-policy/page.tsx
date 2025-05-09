export const metadata = {
  title: "Cookie Policy | Flavor Studios",
  description: "Cookie Policy for Flavor Studios website",
}

export default function CookiePolicyPage() {
  return (
    <div className="relative pt-16">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">Effective Date: May 9, 2025</p>

            <div className="prose prose-invert max-w-none">
              <p>
                Flavor Studios ("we," "us," or "our") uses cookies and similar technologies to enhance your browsing
                experience on our website. This Cookie Policy explains what cookies are, how we use them, and your
                choices regarding their use.
              </p>

              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files placed on your device by websites you visit. They help websites remember
                your preferences, improve user experience, and provide anonymized tracking data to third-party
                applications.
              </p>

              <h2>Types of Cookies We Use</h2>
              <ol>
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

              <h2>How We Use Cookies</h2>
              <ul>
                <li>Enhance functionality and user experience.</li>
                <li>Analyze site usage to improve content.</li>
                <li>Remember preferences for personalized browsing.</li>
                <li>Optimize website performance.</li>
              </ul>

              <h2>Managing Your Cookies</h2>
              <p>
                You can control cookies via your browser settings. Disabling cookies may affect website functionality.
                Visit{" "}
                <a href="http://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">
                  www.aboutcookies.org
                </a>{" "}
                for more details.
              </p>

              <h2>Third-Party Cookies and Content Usage</h2>
              <p>
                Our website uses third-party cookies and may include third-party content (images, media) for
                informational, educational, reporting, and commentary purposes under fair use guidelines. Proper
                attribution is always given. Third-party cookies and content are governed by respective third-party
                policies.
              </p>

              <h2>Changes to this Cookie Policy</h2>
              <p>We may update this policy periodically. Changes take effect upon posting with a new effective date.</p>

              <h2>Contact Us</h2>
              <p>If you have questions regarding this policy, contact us at:</p>
              <p>
                Flavor Studios
                <br />
                Email: contact@flavorstudios.in
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
