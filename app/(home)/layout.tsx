import type { ReactNode } from "react"
import Script from "next/script"

import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import PwaServiceWorker from "@/components/PwaServiceWorker"
import AdblockBanner from "@/components/AdblockBanner"

import { getDynamicCategories } from "@/lib/dynamic-categories"
import { serverEnv } from "@/env/server"
import type { CategoryData } from "@/lib/dynamic-categories"
import type { Category } from "@/types/category"

import { HomeNavigation } from "./components/HomeNavigation"

function mapCategoryDataToCategory(
  category: CategoryData,
  fallbackType: "blog" | "video",
): Category {
  return {
    id:
      typeof category.id === "string"
        ? category.id
        : typeof category.slug === "string"
        ? `${fallbackType}-${category.slug}`
        : `${fallbackType}-unknown`,
    name: typeof category.name === "string" ? category.name : "",
    slug: typeof category.slug === "string" ? category.slug : "",
    title:
      typeof category.title === "string"
        ? category.title
        : typeof category.name === "string"
        ? category.name
        : "",
    type: category.type === "blog" || category.type === "video" ? category.type : fallbackType,
    postCount: Number(
      typeof category.postCount !== "undefined"
        ? category.postCount
        : typeof category.count !== "undefined"
        ? category.count
        : 0,
    ),
    order: typeof category.order === "number" ? category.order : 0,
    isActive: typeof category.isActive === "boolean" ? category.isActive : true,
    tooltip: typeof category.tooltip === "string" ? category.tooltip : "",
  }
}

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const cookieYesId = serverEnv.NEXT_PUBLIC_COOKIEYES_ID || ""
  const categories = await getDynamicCategories()

  const blogCategories: Category[] = (categories.blogCategories || []).map((category) =>
    mapCategoryDataToCategory(category, "blog"),
  )
  const videoCategories: Category[] = (categories.videoCategories || []).map((category) =>
    mapCategoryDataToCategory(category, "video"),
  )

  return (
    <>
      <AdblockBanner />
      <HomeNavigation blogCategories={blogCategories} videoCategories={videoCategories} />
      <main id="main" tabIndex={-1} role="main" className="bg-slate-950">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <PwaServiceWorker />
      {cookieYesId && (
        <Script
          id="cookieyes"
          src={`https://cdn-cookieyes.com/client_data/${cookieYesId}/script.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}