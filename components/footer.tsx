import Link from "next/link"
import { SocialIcons } from "@/components/social-icons"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ]

  const discoverLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Watch", href: "/watch" },
    { name: "Play", href: "/play" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/support" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "DMCA", href: "/dmca" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Media Usage Policy", href: "/media-usage-policy" },
  ]

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-6 md:gap-8 lg:gap-10">
          {/* Brand Section */}
          <div className="space-y-5 lg:pr-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Flavor Studios</span>
            </Link>
            <p className="text-white text-sm leading-relaxed">
              Crafting stories with soul, one frame at a time. Flavor Studios is a global animation studio dedicated to
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth,
              we aim to inspire, heal, and connect audiences worldwide.
            </p>
            {/* Use SocialIcons for all social branding */}
            <SocialIcons className="pt-2" variant="color" />
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white hover:text-gray-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Discover</h3>
            <ul className="space-y-3">
              {discoverLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white hover:text-gray-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white hover:text-gray-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white mt-8 pt-6 text-center space-y-2">
          <p className="text-white text-sm">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-white text-xs">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
