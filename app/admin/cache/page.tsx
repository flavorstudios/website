import type { Metadata } from "next"
import CacheManager from "@/components/admin/cache-manager"

export const metadata: Metadata = {
  title: "Cache Management | Flavor Studios",
  description: "Admin interface for managing content cache",
}

export default function AdminCachePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Cache Management
        </h1>
        <p className="text-muted-foreground mb-8">
          Use this interface to manually revalidate content caches across the website. This ensures visitors always see
          the most up-to-date content.
        </p>
        <CacheManager />
      </div>
    </main>
  )
}
