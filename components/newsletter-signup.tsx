"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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
    // This 'relative' container is the key to the fix.
    // It will now reliably contain the success/error messages.
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:flex-row"
        aria-busy={isSubmitting}
      >
        <Input
          type="email"
          placeholder="Enter your email address"
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          aria-label="Email address"
        />
        <Button
          type="submit"
          className="bg-white px-8 font-semibold text-blue-600 hover:bg-blue-50"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>

      <div
        aria-live={submitStatus === "error" ? "assertive" : "polite"}
        role={submitStatus === "error" ? "alert" : submitStatus === "success" ? "status" : undefined}
        className="mt-2 min-h-[1.5rem] text-center text-sm font-medium"
      >
        {submitStatus === "success" && (
          <p className="text-green-300">Thank you for subscribing!</p>
        )}

      {submitStatus === "error" && (
          <p className="text-red-300">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
