"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  MailOpen,
  Reply,
  Archive,
  Star,
  Search,
  Filter,
  Send,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import AdminPageHeader from "@/components/AdminPageHeader"

interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  createdAt: string | Date
  status: "unread" | "read" | "replied" | "archived"
  priority: "low" | "medium" | "high"
  flagged?: boolean
  labels?: string[]
  starred?: boolean
  scores?: {
    toxicity?: number
    insult?: number
    threat?: number
    [key: string]: unknown
  } | null
}

const AVAILABLE_LABELS = ["general", "support", "billing", "spam"]

export default function EmailInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [labelFilter, setLabelFilter] = useState("all")
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [emailError, setEmailError] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState(true)
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/from-addresses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.addresses) && data.addresses.length) {
          setAdminEmails(data.addresses)
          setFromEmail(data.addresses[0])
        } else {
          throw new Error("No from-addresses provided")
        }
      })
      .catch(() => {
        setEmailError("Unable to load email addresses for reply. Please contact your administrator.")
        setAdminEmails([])
        setFromEmail("")
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
        setLoadingState(false)
      }
    }
    loadMessages()
  }, [])

  const filteredMessages = messages.filter((message) => {
    const fullName = `${message.firstName} ${message.lastName}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      fullName.includes(search) ||
      message.email.toLowerCase().includes(search) ||
      message.subject.toLowerCase().includes(search) ||
      message.message.toLowerCase().includes(search)

    const matchesStatus = filterStatus === "all" || message.status === filterStatus
    const matchesPriority = priorityFilter === "all" || message.priority === priorityFilter
    const matchesFlagged = !flaggedOnly || message.flagged
    const matchesLabel =
      labelFilter === "all" || (message.labels || []).includes(labelFilter)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesFlagged &&
      matchesLabel
    )
  })

  const toggleMessageSelection = (id: string, checked: boolean) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev)
      if (checked) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }

  const allSelected =
    selectedMessages.size > 0 && filteredMessages.every((m) => selectedMessages.has(m.id))

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedMessages(new Set(filteredMessages.map((m) => m.id)))
    else setSelectedMessages(new Set())
  }

  const updateMessageStatus = async (id: string, status: ContactMessage["status"]) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status } : msg)))
    try {
      await fetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
    } catch (err) {
      console.error("Failed to update message status", err)
    }
  }

  const bulkUpdateStatus = async (ids: string[], status: ContactMessage["status"]) => {
    setMessages((prev) =>
      prev.map((msg) => (ids.includes(msg.id) ? { ...msg, status } : msg))
    )
    try {
      await Promise.all(
        ids.map((id) =>
          fetch("/api/admin/contact-messages", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
          })
        )
      )
    } catch (err) {
      console.error("Failed to bulk update messages", err)
    } finally {
      setSelectedMessages(new Set())
    }
  }

  const toggleStar = async (id: string, starred: boolean) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, starred } : msg))
    )
    try {
      await fetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, starred }),
      })
    } catch (err) {
      console.error("Failed to update star", err)
    }
  }

  const handleLabelChange = async (
    id: string,
    label: string,
    checked: boolean
  ) => {
    const msg = messages.find((m) => m.id === id)
    const labels = new Set(msg?.labels || [])
    if (checked) labels.add(label)
    else labels.delete(label)
    const updatedLabels = Array.from(labels)

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, labels: updatedLabels } : m))
    )
    try {
      await fetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, labels: updatedLabels }),
      })
    } catch (err) {
      console.error("Failed to update labels", err)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim() || !fromEmail) return

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
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (!filteredMessages.length) return
        if (!selectedMessage) {
          setSelectedMessage(filteredMessages[0])
          return
        }
        const idx = filteredMessages.findIndex((m) => m.id === selectedMessage.id)
        if (idx < filteredMessages.length - 1) setSelectedMessage(filteredMessages[idx + 1])
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (!selectedMessage) return
        const idx = filteredMessages.findIndex((m) => m.id === selectedMessage.id)
        if (idx > 0) setSelectedMessage(filteredMessages[idx - 1])
      } else if (e.key === "a" && selectedMessage) {
        e.preventDefault()
        updateMessageStatus(selectedMessage.id, "archived")
      } else if (e.key === "r" && selectedMessage) {
        e.preventDefault()
        replyRef.current?.focus()
        } else if (e.key === "s" && selectedMessage) {
        e.preventDefault()
        toggleStar(selectedMessage.id, !selectedMessage.starred)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault()
        const currentlyAllSelected =
          selectedMessages.size > 0 &&
          filteredMessages.every((m) => selectedMessages.has(m.id))
        toggleSelectAll(!currentlyAllSelected)
      } else if (e.key === "Escape") {
        setSelectedMessage(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedMessage, filteredMessages, selectedMessages])

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

  const formatDate = (dt: string | Date, withTime = false) => {
    const dateObj = typeof dt === "string" ? new Date(dt) : dt
    return withTime ? dateObj.toLocaleString() : dateObj.toLocaleDateString()
  }

  const threadMessages =
    selectedMessage
      ? messages
          .filter((m) => m.email === selectedMessage.email && m.id !== selectedMessage.id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      : []

  return (
    <div className="space-y-6">
      {/* --- Standardized Admin Section Header --- */}
      <AdminPageHeader title="Email Inbox" subtitle="View and respond to contact messages" />
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {messages.filter((m) => m.status === "unread").length} unread
        </Badge>
      </div>

      {emailError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-2">
          {emailError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleSelectAll(!!v)}
                  aria-label="Select all messages"
                />
                <div className="relative flex-1 min-w-[120px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    ref={searchInputRef}
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
                <Select value={labelFilter} onValueChange={setLabelFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All labels</SelectItem>
                    {AVAILABLE_LABELS.map((lbl) => (
                      <SelectItem key={lbl} value={lbl}>
                        {lbl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Switch
                    id="flagged-switch"
                    checked={flaggedOnly}
                    onCheckedChange={setFlaggedOnly}
                  />
                  <label htmlFor="flagged-switch" className="text-xs text-gray-600">
                    Flagged
                  </label>
                </div>
              </div>
              {selectedMessages.size > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus(Array.from(selectedMessages), "archived")}
                  >
                    <Archive className="h-4 w-4 mr-2" /> Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus(Array.from(selectedMessages), "read")}
                  >
                    <MailOpen className="h-4 w-4 mr-2" /> Mark Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus(Array.from(selectedMessages), "unread")}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Mark Unread
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {loadingState ? (
                  <div className="flex justify-center items-center py-10 text-gray-400">Loading messages...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex justify-center items-center py-10 text-gray-400">No messages found.</div>
                ) : (
                  filteredMessages.map((message) => (
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
                        <Checkbox
                          checked={selectedMessages.has(message.id)}
                          onCheckedChange={(v) => toggleMessageSelection(message.id, !!v)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select message from ${message.email}`}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white text-xs">
                            {`${message.firstName?.[0] ?? ""}${message.lastName?.[0] ?? ""}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`font-medium text-sm ${
                                message.status === "unread" ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {`${message.firstName} ${message.lastName}`}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleStar(message.id, !message.starred)
                                }}
                                aria-label={message.starred ? "Unstar message" : "Star message"}
                                className="text-gray-400 hover:text-yellow-500"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    message.starred ? "fill-yellow-400 text-yellow-400" : ""
                                  }`}
                                />
                              </button>
                              <div className="flex items-center gap-1">
                                <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                  {message.priority}
                                </Badge>
                              {message.flagged && (
                                  <Badge variant="destructive" className="ml-1" aria-label="Flagged message">
                                    Flagged
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{message.subject}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {message.message.slice(0, 80)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge className={`text-xs ${getStatusColor(message.status)}`}>{message.status}</Badge>
                              {message.labels?.map((lbl) => (
                                <Badge key={lbl} variant="outline" className="text-xs">
                                  {lbl}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">{formatDate(message.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
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
                    {selectedMessage.flagged && (
                      <Badge variant="destructive" className="ml-2" aria-label="Flagged message">
                        Flagged
                      </Badge>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedMessage.firstName} {selectedMessage.lastName} &lt;{selectedMessage.email}&gt;
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(selectedMessage.createdAt, true)}</p>
                    {selectedMessage.scores && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-semibold mb-1">Moderation scores:</p>
                        <ul className="list-disc ml-4 space-y-0.5">
                          {typeof selectedMessage.scores.toxicity === "number" && (
                            <li>Toxicity: {selectedMessage.scores.toxicity.toFixed(2)}</li>
                          )}
                          {typeof selectedMessage.scores.insult === "number" && (
                            <li>Insult: {selectedMessage.scores.insult.toFixed(2)}</li>
                          )}
                          {typeof selectedMessage.scores.threat === "number" && (
                            <li>Threat: {selectedMessage.scores.threat.toFixed(2)}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {selectedMessage.labels && selectedMessage.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedMessage.labels.map((lbl) => (
                          <Badge key={lbl} variant="outline" className="text-xs">
                            {lbl}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleStar(selectedMessage.id, !selectedMessage.starred)
                      }
                      aria-label={
                        selectedMessage.starred ? "Unstar message" : "Star message"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          selectedMessage.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                        }`}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Tag className="h-4 w-4 mr-2" /> Labels
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Labels</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {AVAILABLE_LABELS.map((lbl) => (
                          <DropdownMenuCheckboxItem
                            key={lbl}
                            checked={selectedMessage.labels?.includes(lbl)}
                            onCheckedChange={(v) =>
                              handleLabelChange(selectedMessage.id, lbl, !!v)
                            }
                          >
                            {lbl}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {threadMessages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Previous messages</h3>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {threadMessages.map((msg) => (
                        <div key={msg.id} className="p-2 rounded border">
                          <p className="text-xs text-gray-500">{formatDate(msg.createdAt, true)}</p>
                          <p className="text-sm text-gray-700 truncate">{msg.subject}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Reply
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                      <Select value={fromEmail} onValueChange={setFromEmail} disabled={!!emailError}>
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
                      ref={replyRef}
                      disabled={!!emailError}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {emailError
                        ? "Reply is disabled until addresses are available."
                        : "This will trigger a manual API call for email sending"}
                    </p>
                    <Button onClick={handleReply} disabled={!replyText.trim() || !!emailError}>
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
