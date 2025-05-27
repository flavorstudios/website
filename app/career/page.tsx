import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers - Join Our Animation Team",
  description:
    "Join Flavor Studios and help create emotionally resonant anime content. Explore career opportunities in 3D animation, storytelling, and creative production.",
  openGraph: {
    title: "Careers - Join Our Animation Team | Flavor Studios",
    description:
      "Join Flavor Studios and help create emotionally resonant anime content. Explore career opportunities in animation.",
    type: "website",
    url: "https://flavorstudios.in/career",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers - Join Our Animation Team | Flavor Studios",
    description:
      "Join Flavor Studios and help create emotionally resonant anime content. Explore career opportunities in animation.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/career",
  },
}

const CareerPage = () => {
  return (
    <div>
      <h1>Careers</h1>
      <p>Join our team!</p>
    </div>
  )
}

export default CareerPage
