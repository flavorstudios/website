"use client"

import Link from "next/link"
import { useCallback } from "react"

type FooterLink = {
  name: string
  href: string
  ariaLabel?: string
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  const companyLinks: FooterLink[] = [
    { name: "Home", href: "/" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ]

  const discoverLinks: FooterLink[] = [
    { name: "About Flavor Studios", href: "/about" },
    { name: "Watch", href: "/watch" },
    { name: "Play", href: "/play" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/support" },
  ]

  const legalLinks: FooterLink[] = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "DMCA", href: "/dmca" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Usage Policy", href: "/media-usage-policy", ariaLabel: "Usage Policy" },
  ]

  const navGroups: { title: string; links: FooterLink[] }[] = [
    { title: "Company", links: companyLinks },
    { title: "Discover", links: discoverLinks },
    { title: "Legal", links: legalLinks },
  ]

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

  const footerBottomLinks: FooterLink[] = [{ name: "Home", href: "/" }, ...legalLinks]

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
        className="pointer-events-none absolute left-1/2 h-[clamp(10rem,28vw,14rem)] w-[170%] -translate-x-1/2 bg-black"
        style={{
          top: "calc(-1 * clamp(10rem, 28vw, 14rem))",
          borderBottomLeftRadius: "55% 100%",
          borderBottomRightRadius: "55% 100%",
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
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-[clamp(2rem,4vw,4rem)] px-[clamp(1rem,4vw,3rem)] pb-[clamp(2.5rem,5vw,4rem)] pt-[calc(clamp(2rem,4vw,4rem)+3rem)]">
        <button
          type="button"
          onClick={handleBackToTop}
          className="mx-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#e50914] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] transition duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label="Back to top"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ↑
          </span>
          Back To Top
        </button>

        <div className="grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col items-center gap-[clamp(0.9rem,2vw,1.4rem)] text-center lg:items-start lg:text-left">
            <div className="text-[clamp(2.25rem,5vw,3.5rem)] font-black uppercase tracking-[0.2em]" aria-label="Flavor Studios logo">
              Flavor Studios
            </div>
            <p className="max-w-2xl text-[clamp(0.95rem,1.4vw,1.05rem)] leading-[1.65] text-white/70">
              Crafting stories with soul, one frame at a time. Flavor Studios is a global animation studio dedicated to creating
              meaningful 3D animations and original anime. Through powerful storytelling and emotional depth, we aim to inspire,
              heal, and connect audiences worldwide.
            </p>
          <ul
              className="flex flex-wrap items-center justify-center gap-[clamp(0.35rem,0.9vw,0.6rem)] lg:justify-start"
              aria-label="Social media"
            >
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <Link
                    href={social.href}
                    className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-[#2a2a2a] px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white transition duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-[clamp(1.1rem,2.5vw,1.75rem)] text-center lg:items-stretch lg:text-left">
            <nav className="grid w-full gap-[clamp(1.1rem,2.5vw,1.75rem)] lg:grid-cols-3" aria-label="Footer primary navigation">
              {navGroups.map((group) => (
                <section key={group.title} className="grid gap-[clamp(0.6rem,1vw,0.85rem)]">
                  <h2 className="text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold uppercase tracking-[0.16em] text-white">
                    {group.title}
                  </h2>
                  <ul className="grid gap-[clamp(0.35rem,0.9vw,0.6rem)]">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          aria-label={link.ariaLabel ?? link.name}
                          className="text-[clamp(0.8rem,1.4vw,1rem)] font-semibold uppercase tracking-[0.18em] text-white transition duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
            <Link
              href="/signin"
              className="inline-flex min-w-max items-center justify-center rounded-full bg-[#2a2a2a] px-10 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid gap-[clamp(0.75rem,1.25vw,1.15rem)] text-center">
          <ul
            className="flex flex-wrap items-center justify-center gap-[clamp(0.35rem,0.9vw,0.6rem)] text-[clamp(0.7rem,1vw,0.85rem)] text-white/60"
            aria-label="Legal"
          >
            {footerBottomLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-label={link.ariaLabel ?? link.name}
                  className="transition duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[clamp(0.7rem,1vw,0.85rem)] text-white/60">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-[clamp(0.7rem,1vw,0.85rem)] text-white/60">Built with Passion. Powered by Dreams.</p>
        </div>
      </div>
    </footer>
  )
}
