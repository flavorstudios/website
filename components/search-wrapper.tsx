"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function SearchWrapper() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4 font-orbitron">Looking for something specific?</h2>
      <div className="relative">
        <Link href={`/search${query ? `?q=${query}` : ""}`} className="w-full">
          <Button variant="outline" className="w-full">
            Search our site
          </Button>
        </Link>
      </div>
    </div>
  )
}
