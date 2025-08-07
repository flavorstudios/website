// app/support/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Star,
  Users,
  Zap,
  Palette,
  Award,
  MessageCircle,
  ExternalLink,
  HelpCircle,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { useTranslations } from "@/lib/i18n"; // Client-only translation hook
import { getTranslations } from "next-intl/server"; // Server-only for SSR/meta/schema

// === Internationalized SEO METADATA ===
export async function generateMetadata() {
  const t = await getTranslations();
  const title = t("metadata.support.title", { siteName: SITE_NAME });
  const description = t("metadata.support.description", { siteName: SITE_NAME });
  return getMetadata({
    title,
    description,
    path: "/support",
    robots: "index,follow",
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/cover.jpg`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_BRAND_TWITTER,
      creator: SITE_BRAND_TWITTER,
      title,
      description,
      images: [`${SITE_URL}/cover.jpg`],
    },
  });
}

// === JSON-LD WebPage Schema for Support Page, i18n ===
async function getI18nSchema() {
  const t = await getTranslations();
  return getSchema({
    type: "WebPage",
    path: "/support",
    title: t("metadata.support.title", { siteName: SITE_NAME }),
    description: t("metadata.support.description", { siteName: SITE_NAME }),
    image: `${SITE_URL}/cover.jpg`,
  });
}

export default async function SupportPage() {
  const t = useTranslations("support"); // Client-side translations
  const schema = await getI18nSchema(); // Server-side schema

  const impactAreas = [
    {
      title: t("impact.items.creativeFreedom.title"),
      description: t("impact.items.creativeFreedom.description"),
      icon: Palette,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: t("impact.items.qualityContent.title"),
      description: t("impact.items.qualityContent.description"),
      icon: Award,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: t("impact.items.communityGrowth.title"),
      description: t("impact.items.communityGrowth.description"),
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const supportWays = [
    {
      title: t("otherWays.shareContent.title"),
      description: t("otherWays.shareContent.description"),
      icon: Youtube,
      action: t("otherWays.shareContent.action"),
      href: "https://www.youtube.com/@flavorstudios",
      external: true,
    },
    {
      title: t("otherWays.leaveReviews.title"),
      description: t("otherWays.leaveReviews.description"),
      icon: Star,
      action: t("otherWays.leaveReviews.action"),
      href: "https://www.reddit.com/r/flavorstudios/",
      external: true,
    },
    {
      title: t("otherWays.joinCommunity.title"),
      description: t("otherWays.joinCommunity.description"),
      icon: Zap,
      action: t("otherWays.joinCommunity.action"),
      href: "https://discord.gg/agSZAAeRzn",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* === SEO: Inject JSON-LD Schema === */}
      <StructuredData schema={schema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <Badge className="mb-3 sm:mb-4 lg:mb-6 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
              {t("badge")}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 lg:mb-10 px-2">
              {t("description")}
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6 px-2">
              <Button
                asChild
                size="default"
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  {t("buyCoffee")}
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                asChild
                className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-4 border-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
              >
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  {t("contact")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                asChild
                className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-4 border-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                <Link href="/faq">
                  <HelpCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  {t("faq")}
                </Link>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 px-2">{t("securePayments")}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Impact Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t("impact.title")}</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              {t("impact.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg hover:-translate-y-1"
                >
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div
                      className={`mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r ${area.color} rounded-2xl w-fit shadow-lg`}
                    >
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{area.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <blockquote className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-white leading-relaxed">
                {t("quote.text")}
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Main Support CTA - Full Width */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 border-t-4 border-yellow-400 rounded-lg">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  {t("mainSupport.title")}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
                  {t("mainSupport.description")}
                </p>
              </div>
              <div className="max-w-3xl mx-auto text-center">
                <div className="mb-6 sm:mb-8">
                  <div className="bg-yellow-200 rounded-full p-6 sm:p-8 w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg">
                    <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{t("mainSupport.supportUs")}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                    {t("mainSupport.supportUsDescription")}
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg sm:text-xl h-14 sm:h-16 px-8 sm:px-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-6 sm:mb-8"
                >
                  <Link href="https://buymeacoffee.com/flavorstudios" target="_blank" rel="noopener noreferrer">
                    <Coffee className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                    {t("mainSupport.button")}
                    <ExternalLink className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div>
                    {t("mainSupport.benefits.securePayments")}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div>
                    {t("mainSupport.benefits.instantProcessing")}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div>
                    {t("mainSupport.benefits.noAccountRequired")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways to Support Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t("otherWays.title")}</h2>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              {t("otherWays.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {supportWays.map((way, index) => {
              const Icon = way.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="mx-auto mb-3 sm:mb-4 p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl w-fit transition-colors">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold">{way.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600 mb-3 sm:mb-4">{way.description}</p>
                    <Button variant="outline" size="sm" className="w-full h-10 sm:h-11 text-xs sm:text-sm" asChild>
                      <Link
                        href={way.href}
                        target={way.external ? "_blank" : undefined}
                        rel={way.external ? "noopener noreferrer" : undefined}
                      >
                        {way.action}
                        {way.external && <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* === Follow Us Section (as per audit, centralized component) === */}
        <section className="py-6 sm:py-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {t("followUs.title")}
            </h3>
            <SocialLinks />
          </div>
        </section>
        {/* === End Follow Us Section === */}

        {/* FAQ Link - Full Width */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-blue-600" aria-hidden="true" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{t("faqSection.title")}</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                {t("faqSection.description")}
              </p>
              <Button
                variant="default"
                size="lg"
                asChild
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-base sm:text-lg"
              >
                <Link href="/faq">
                  {t("faqSection.button")}
                  <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
