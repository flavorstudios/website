import { useTranslations } from "@/lib/i18n";

export default function ErrorFallback({ section }: { section: string }) {
  const t = useTranslations("home");
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {t("errorFallback", { section })}
      </p>
    </div>
  );
}
