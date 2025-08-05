"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Clock,
  HelpCircle,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { useTranslations } from "@/lib/i18n";

type SubmitStatus = "idle" | "success" | "error" | "flagged";
type FormErrors = Record<string, string>;

export default function ContactPageClient() {
  const t = useTranslations("contact");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    privacyAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({});

  const contactInfo = [
    {
      icon: Mail,
      title: t("info.email.title"),
      details: "contact@flavorstudios.in",
      description: t("info.email.description"),
    },
    {
      icon: Users,
      title: t("info.social.title"),
      details: "@FlavorStudios",
      description: t("info.social.description"),
    },
    {
      icon: Clock,
      title: t("info.response.title"),
      details: t("info.response.details"),
      description: t("info.response.description"),
    },
  ];

  const contactProcess = [
    {
      step: "1",
      title: t("process.steps.1.title"),
      description: t("process.steps.1.description"),
      icon: Send,
    },
    {
      step: "2",
      title: t("process.steps.2.title"),
      description: t("process.steps.2.description"),
      icon: CheckCircle,
    },
    {
      step: "3",
      title: t("process.steps.3.title"),
      description: t("process.steps.3.description"),
      icon: MessageSquare,
    },
    {
      step: "4",
      title: t("process.steps.4.title"),
      description: t("process.steps.4.description"),
      icon: Users,
    },
  ];

  const expectations = [
    t("expectations.items.1"),
    t("expectations.items.2"),
    t("expectations.items.3"),
    t("expectations.items.4"),
  ];

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("form.fields.firstName.error.required");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("form.fields.lastName.error.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("form.fields.email.error.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("form.fields.email.error.invalid");
    }

    if (!formData.subject) {
      newErrors.subject = t("form.fields.subject.error.required");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("form.fields.message.error.required");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("form.fields.message.error.minLength");
    }

    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = t("form.fields.privacy.error.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();

      if (data.flagged) {
        setSubmitStatus("flagged");
        setIsSubmitting(false);
        return;
      }

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        privacyAccepted: false,
      });
      setErrors({});
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">{t("badge")}</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t("intro")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          {/* Contact Info & Social */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t("info.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      {(() => {
                        const Icon = info.icon;
                        return Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> : null;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base">{info.title}</div>
                      <div className="text-blue-600 text-xs sm:text-sm break-words">{info.details}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{info.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Business Inquiries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t("business.title")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("business.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-blue-600 text-xs sm:text-sm break-all">
                      contact@flavorstudios.in
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t("follow.title")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("follow.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialLinks showLabels />
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{t("form.title")}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t("form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {submitStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800">{t("form.success.title")}</h4>
                      <p className="text-sm text-green-700">{t("form.success.description")}</p>
                    </div>
                  </div>
                )}

                {submitStatus === "flagged" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">{t("form.flagged.title")}</h4>
                      <p className="text-sm text-yellow-700">{t("form.flagged.description")}</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800">{t("form.error.title")}</h4>
                      <p className="text-sm text-red-700">{t("form.error.description")}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm sm:text-base">
                        {t("form.fields.firstName.label")}
                      </Label>
                      <Input
                        id="firstName"
                        placeholder={t("form.fields.firstName.placeholder")}
                        className="h-10 sm:h-11"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm sm:text-base">
                        {t("form.fields.lastName.label")}
                      </Label>
                      <Input
                        id="lastName"
                        placeholder={t("form.fields.lastName.placeholder")}
                        className="h-10 sm:h-11"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      {t("form.fields.email.label")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("form.fields.email.placeholder")}
                      className="h-10 sm:h-11"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
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
                    <Label htmlFor="subject" className="text-sm sm:text-base">
                      {t("form.fields.subject.label")}
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className="h-10 sm:h-11" aria-invalid={!!errors.subject}>
                        <SelectValue placeholder={t("form.fields.subject.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t("form.fields.subject.options.general")}</SelectItem>
                        <SelectItem value="collaboration">{t("form.fields.subject.options.collaboration")}</SelectItem>
                        <SelectItem value="business">{t("form.fields.subject.options.business")}</SelectItem>
                        <SelectItem value="press">{t("form.fields.subject.options.press")}</SelectItem>
                        <SelectItem value="technical">{t("form.fields.subject.options.technical")}</SelectItem>
                        <SelectItem value="feedback">{t("form.fields.subject.options.feedback")}</SelectItem>
                        <SelectItem value="other">{t("form.fields.subject.options.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p id="subject-error" className="text-sm text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm sm:text-base">
                      {t("form.fields.message.label")}
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={t("form.fields.message.placeholder")}
                      className="min-h-[100px] sm:min-h-[120px] resize-none"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="privacy"
                      className="mt-0.5"
                      checked={formData.privacyAccepted}
                      onCheckedChange={(checked: boolean) => handleInputChange("privacyAccepted", !!checked)}
                      aria-invalid={!!errors.privacyAccepted}
                      aria-describedby={errors.privacyAccepted ? "privacy-error" : undefined}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="privacy" className="text-xs sm:text-sm leading-relaxed">
                        {t.rich("form.fields.privacy.label", {
                          privacyPolicy: (chunks) => (
                            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                              {chunks}
                            </Link>
                          ),
                        })}
                      </Label>
                      {errors.privacyAccepted && (
                        <p id="privacy-error" className="text-sm text-red-600">
                          {errors.privacyAccepted}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("form.buttons.sending")}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("form.buttons.send")}
                      </>
                    )}
                  </Button>
                </form>

                {/* What to Expect Section */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">{t("expectations.title")}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {expectations.map((expectation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white font-bold" />
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-blue-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: expectation }} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Process Timeline - Mobile Optimized */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12">{t("process.title")}</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line - Hidden on mobile, shown on larger screens */}
              <div className="hidden sm:block absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              <div className="space-y-6 sm:space-y-12">
                {contactProcess.map((process, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                        {process.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="ml-4 sm:ml-8 flex-1">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                              {(() => {
                                const Icon = process.icon;
                                return Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> : null;
                              })()}
                            </div>
                            <CardTitle className="text-lg sm:text-xl">{process.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: process.description }} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Call-to-Action Section */}
        <section className="mt-8 sm:mt-12 lg:mt-16 text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 sm:p-8">
          <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">{t("cta.title")}</h2>
          <p className="text-base sm:text-lg text-blue-700 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            {t("cta.description")}
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-6 sm:px-8">
            <Link href="/faq">
              <HelpCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t("cta.button")}
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
