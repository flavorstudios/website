"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Reply, Archive, Star, Search, Filter, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  timestamp: string | Date
  status: "unread" | "read" | "replied" | "archived"
  priority: "low" | "medium" | "high"
}

export function EmailInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  // Load admin email addresses from server
  useEffect(() => {
    fetch("/api/admin/from-addresses")
      .then((res) => res.json())
      .then((data) => {
        // Secure: Only display addresses provided by the server (never hard-coded in production)
        if (Array.isArray(data.addresses) && data.addresses.length) {
          setAdminEmails(data.addresses)
          setFromEmail(data.addresses[0])
        } else {
          throw new Error("No from-addresses provided")
        }
      })
      .catch(() => {
        // fallback for local/dev only (NEVER expose real admin emails in prod)
        setAdminEmails([
          "contact@flavorstudios.in",
          "hello@flavorstudios.in",
          "support@flavorstudios.in",
          "admin@flavorstudios.in",
        ])
        setFromEmail("contact@flavorstudios.in")
      })
  }, [])

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch("/api/admin/contact-messages")
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [])

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || message.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const updateMessageStatus = (id: string, status: ContactMessage["status"]) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status } : msg)))
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      const response = await fetch("/api/admin/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          to: selectedMessage.email,
          from: fromEmail,
          subject: `Re: ${selectedMessage.subject}`,
          message: replyText,
        }),
      })

      if (response.ok) {
        updateMessageStatus(selectedMessage.id, "replied")
        setReplyText("")
        // Optionally: Show success notification
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-700"
      case "read":
        return "bg-gray-100 text-gray-700"
      case "replied":
        return "bg-green-100 text-green-700"
      case "archived":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Helper to format date safely
  const formatDate = (dt: string | Date, withTime = false) => {
    const dateObj = typeof dt === "string" ? new Date(dt) : dt
    return withTime
      ? dateObj.toLocaleString()
      : dateObj.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Email Inbox
        </h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {messages.filter((m) => m.status === "unread").length} unread
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    } ${message.status === "unread" ? "bg-blue-50/30" : ""}`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (message.status === "unread") {
                        updateMessageStatus(message.id, "read")
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white text-xs">
                          {message.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium text-sm ${message.status === "unread" ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {message.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">{message.subject}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={`text-xs ${getStatusColor(message.status)}`}>{message.status}</Badge>
                          <p className="text-xs text-gray-400">{formatDate(message.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail & Reply */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(selectedMessage.timestamp, true)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMessageStatus(selectedMessage.id, "archived")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Reply
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                      <Select value={fromEmail} onValueChange={setFromEmail}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {adminEmails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                      <Input value={selectedMessage.email} disabled />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">This will trigger a manual API call for email sending</p>
                    <Button onClick={handleReply} disabled={!replyText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
