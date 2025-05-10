import type { Metadata } from "next"
import CareerPageClient from "./CareerPageClient"

export const metadata: Metadata = {
  title: "Join Our Team – Careers at Flavor Studios",
  description:
    "Explore career opportunities with Flavor Studios. Join our mission to create meaningful 3D anime that resonates with hearts around the world.",
}

export default function CareerPage() {
  return <CareerPageClient />
}
