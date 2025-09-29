import type { ReactNode } from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import AdblockBanner from "@/components/AdblockBanner";

import { getDynamicCategories } from "@/lib/dynamic-categories";
import { serverEnv } from "@/env/server";
import Script from "next/script";

// --- Type "Category" should have id, title, type, postCount, name, slug, tooltip, etc. ---
import type { Category } from "@/types/category";
import type { CategoryData } from "@/lib/dynamic-categories";

// 🟩 UPDATED GUARD: All fields properly checked!
function mapCategoryDataToCategory(
  cat: CategoryData,
  fallbackType: "blog" | "video",
): Category {
  return {
    id:
      typeof cat.id === "string"
        ? cat.id
        : typeof cat.slug === "string"
        ? `${fallbackType}-${cat.slug}`
        : `${fallbackType}-unknown`,
    name: typeof cat.name === "string" ? cat.name : "",
    slug: typeof cat.slug === "string" ? cat.slug : "",
    title:
      typeof cat.title === "string"
        ? cat.title
        : typeof cat.name === "string"
        ? cat.name
        : "",
    type: cat.type === "blog" || cat.type === "video" ? cat.type : fallbackType,
    postCount: Number(
      typeof cat.postCount !== "undefined"
        ? cat.postCount
        : typeof cat.count !== "undefined"
        ? cat.count
        : 0,
    ),
    order: typeof cat.order === "number" ? cat.order : 0,
    isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
    tooltip: typeof cat.tooltip === "string" ? cat.tooltip : "",
  };
}

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const cookieYesId = serverEnv.NEXT_PUBLIC_COOKIEYES_ID || "";

  // Previously fetched only for non-admin; marketing routes are non-admin, so fetch here.
  const categories = await getDynamicCategories();

  // Map to full Category type expected by Header
  const blogCategories: Category[] = (categories.blogCategories || []).map((cat: CategoryData) =>
    mapCategoryDataToCategory(cat, "blog"),
  );
  const videoCategories: Category[] = (categories.videoCategories || []).map((cat: CategoryData) =>
    mapCategoryDataToCategory(cat, "video"),
  );

  return (
    <>
      {/* ⭐️ AdBlock Support Banner (marketing only) */}
      <AdblockBanner />

      <Header blogCategories={blogCategories} videoCategories={videoCategories} />

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <Footer />
      <BackToTop />
      <PwaServiceWorker />

      {/* ⭐️ LOAD the stealth detection script only for marketing */}
      <Script src="/js/_support_banner.js" strategy="afterInteractive" />

      {cookieYesId && (
        <Script
          id="cookieyes"
          src={`https://cdn-cookieyes.com/client_data/${cookieYesId}/script.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
