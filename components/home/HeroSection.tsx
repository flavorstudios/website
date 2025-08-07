import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function HeroSection() {
  const t = useTranslations("home.hero");
  return (
    <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="max-w-4xl text-center space-y-8">
            <div className="flex justify-center">
              <Badge className="bg-blue-600 text-white px-6 py-3 text-base font-medium">
                {t("badge")}
              </Badge>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                {t("title1")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t("title2")}
                </span>{" "}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mx-auto">
                {t("description")}
              </p>
            </div>
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Link href="/blog">
                  {t("button")}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
