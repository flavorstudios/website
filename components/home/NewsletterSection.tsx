import { NewsletterSignup } from "@/components/newsletter-signup";
import { useTranslations } from "@/lib/i18n";

export default function NewsletterSection() {
  const t = useTranslations("home");

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                {t("newsletter.title")}
              </h2>
              <p className="text-xl md:text-2xl text-blue-100">
                {t("newsletter.description")}
              </p>
            </div>
            <div className="max-w-md mx-auto relative">
              <NewsletterSignup />
              <p className="text-sm text-blue-200 mt-3">
                {t("newsletter.finePrint")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                {t("newsletter.bullets.weeklyUpdates")}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                {t("newsletter.bullets.exclusiveContent")}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                {t("newsletter.bullets.noSpam")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
