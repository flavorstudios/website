import Link from "next/link"
import { Youtube, Facebook, Instagram, Twitter, AtSign, Send, MessageCircle, BookOpen } from "lucide-react"

const socialLinks = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@flavorstudios",
    icon: <Youtube className="h-5 w-5" />,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/flavourstudios",
    icon: <Facebook className="h-5 w-5" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/flavorstudios",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/flavor_studios",
    icon: <Twitter className="h-5 w-5" />,
  },
  {
    name: "Threads",
    href: "https://www.threads.net/@flavorstudios",
    icon: <AtSign className="h-5 w-5" />,
  },
  {
    name: "Telegram",
    href: "https://t.me/flavorstudios",
    icon: <Send className="h-5 w-5" />,
  },
  {
    name: "Discord",
    href: "https://discord.com/channels/@flavorstudios",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    name: "Reddit",
    href: "https://www.reddit.com/r/flavorstudios/",
    icon: <BookOpen className="h-5 w-5" />,
  },
]

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Career", href: "/career" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "https://buymeacoffee.com/flavorstudios" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Play", href: "/play" },
      { label: "Watch", href: "/watch" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "DMCA", href: "/dcma" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Media Usage Policy", href: "/media-usage-policy" },
    ],
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card/30 backdrop-blur-sm">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-heading text-xl font-bold tracking-tight heading-gradient">
                <span className="lowercase">f</span>
                <span className="uppercase">L</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Creating emotional 3D animations with deep stories and meaningful life lessons.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={link.name}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} Flavor Studios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
