"use client"

import Link from "next/link"
import { useCallback } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com/@flavorstudios" },
    { name: "Facebook", href: "https://www.facebook.com/flavourstudios" },
    { name: "Instagram", href: "https://www.instagram.com/flavorstudios" },
    { name: "Twitter", href: "https://twitter.com/flavor_studios" },
    { name: "Discord", href: "https://discord.com/channels/@flavorstudios" },
    { name: "Telegram", href: "https://t.me/flavorstudios" },
    { name: "Threads", href: "https://www.threads.net/@flavorstudios" },
    { name: "Reddit", href: "https://www.reddit.com/r/flavorstudios/" },
  ]

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
    { name: "Usage Policy", href: "/media-usage-policy", ariaLabel: "Usage Policy" },
  ]

  const legalRowLinks = [
    { name: "Home", href: "/" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "DMCA", href: "/dmca" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Usage Policy", href: "/media-usage-policy", ariaLabel: "Usage Policy" },
  ]

  const handleBackToTop = useCallback(() => {
    const target = document.getElementById("top")

    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
      return
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="relative overflow-hidden bg-black text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-60 h-[14rem] w-[170%] -translate-x-1/2"
        style={{
          borderBottomLeftRadius: "55% 100%",
          borderBottomRightRadius: "55% 100%",
          backgroundColor: "#000",
          boxShadow: "0 36px 90px rgba(229, 9, 20, 0.35)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% -15%, rgba(229, 9, 20, 0.45), rgba(0, 0, 0, 0) 62%)",
          opacity: 0.75,
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-6 pb-16 pt-32 md:px-10 lg:px-12">
        <button
          type="button"
          onClick={handleBackToTop}
          className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-[#e50914] px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label="Back to top"
        >
          <span aria-hidden="true" className="text-base">
            ˄
          </span>
          Back To Top
        </button>
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold uppercase tracking-[0.2em]">
              Flavor Studios
            </div>
            <p className="max-w-2xl text-[clamp(0.95rem,1.4vw,1.05rem)] leading-relaxed text-[#9ca3af]">
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth, we
              aim to inspire, heal, and connect audiences worldwide.
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-start" aria-label="Social media">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <Link
                    href={social.href}
                    className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full bg-[#2a2a2a] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-10 text-center lg:items-stretch lg:text-left">
            <nav className="grid w-full gap-8 lg:grid-cols-3" aria-label="Footer primary">
              <section className="grid gap-4">
                <h2 className="text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold uppercase tracking-[0.18em]">Company</h2>
                <ul className="grid gap-3">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[clamp(0.8rem,1.4vw,1rem)] font-semibold uppercase tracking-[0.22em] text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="grid gap-4">
                <h2 className="text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold uppercase tracking-[0.18em]">Discover</h2>
                <ul className="grid gap-3">
                  {discoverLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[clamp(0.8rem,1.4vw,1rem)] font-semibold uppercase tracking-[0.22em] text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="grid gap-4">
                <h2 className="text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold uppercase tracking-[0.18em]">Legal</h2>
                <ul className="grid gap-3">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        aria-label={link.ariaLabel}
                        className="text-[clamp(0.8rem,1.4vw,1rem)] font-semibold uppercase tracking-[0.22em] text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </nav>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-full bg-[#2a2a2a] px-10 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid gap-4 text-center">
          <ul className="flex flex-wrap items-center justify-center gap-3 text-[clamp(0.7rem,1vw,0.85rem)] text-[#9ca3af]" aria-label="Legal">
            {legalRowLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-label={link.ariaLabel}
                  className="transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[clamp(0.7rem,1vw,0.85rem)] text-[#9ca3af]">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-[clamp(0.7rem,1vw,0.85rem)] text-[#9ca3af]">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
