"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const t = useTranslations("newsletter");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // This is a placeholder for actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setEmail("");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <Input
          type="email"
          placeholder={t("placeholder")}
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          aria-label={t("ariaLabel")}
        />
        <Button
          type="submit"
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("subscribing")}
            </>
          ) : (
            t("subscribe")
          )}
        </Button>
      </form>

      {/* Messages are now outside the form but inside the relative container */}
      {submitStatus === "success" && (
        <div className="absolute left-0 right-0 -bottom-8 text-sm text-green-300">
          {t("success")}
        </div>
      )}

      {submitStatus === "error" && (
        <div className="absolute left-0 right-0 -bottom-8 text-sm text-red-300">
          {t("error")}
        </div>
      )}
    </div>
  );
}
