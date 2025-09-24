"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function TalentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    skills: "",
    portfolio: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          skills: "",
          portfolio: "",
          message: "",
        });
        setErrors({});
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("[CAREER_FORM_ERROR]", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm sm:text-base text-gray-700">
            First Name
          </Label>
          <Input
            id="firstName"
            className="h-10 sm:h-11"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm sm:text-base text-gray-700">
            Last Name
          </Label>
          <Input
            id="lastName"
            className="h-10 sm:h-11"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm sm:text-base text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          className="h-10 sm:h-11"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills" className="text-sm sm:text-base text-gray-700">
          Skills &amp; Interests
        </Label>
        <Input
          id="skills"
          className="h-10 sm:h-11"
          value={formData.skills}
          onChange={(e) => handleChange("skills", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio" className="text-sm sm:text-base text-gray-700">
          Portfolio/Website (Optional)
        </Label>
        <Input
          id="portfolio"
          className="h-10 sm:h-11"
          value={formData.portfolio}
          onChange={(e) => handleChange("portfolio", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm sm:text-base text-gray-700">
          Tell Us About Yourself
        </Label>
        <Textarea
          id="message"
          className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Submitting...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Join Talent List
          </>
        )}
      </Button>

      {submitStatus === "success" && (
        <p className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" /> Submission received!
        </p>
      )}
      {submitStatus === "error" && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" /> Failed to submit. Please try again.
        </p>
      )}

      <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
        We&apos;ll only contact you about relevant opportunities and updates.
      </p>
    </form>
  );
}
