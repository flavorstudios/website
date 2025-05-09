"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({ ...prev, inquiryType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitStatus("success")

      // Reset form after successful submission
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Your Name
        </Label>
        <Input
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="john@example.com"
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiryType" className="text-gray-300">
          Inquiry Type
        </Label>
        <Select value={formState.inquiryType} onValueChange={handleSelectChange}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="support">Technical Support</SelectItem>
            <SelectItem value="business">Business Opportunity</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-gray-300">
          Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          value={formState.subject}
          onChange={handleChange}
          placeholder="How can we help you?"
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-gray-300">
          Your Message
        </Label>
        <Textarea
          id="message"
          name="message"
          value={formState.message}
          onChange={handleChange}
          placeholder="Please provide details about your inquiry..."
          required
          className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {submitStatus === "success" && (
        <div className="p-3 bg-green-900/50 border border-green-700 text-green-400 rounded-md text-center">
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-3 bg-red-900/50 border border-red-700 text-red-400 rounded-md text-center">
          There was an error sending your message. Please try again.
        </div>
      )}
    </form>
  )
}
