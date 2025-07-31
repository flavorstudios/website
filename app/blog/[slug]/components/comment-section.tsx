"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, User, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/date" // <-- Added import

interface Comment {
  id: string
  author: string
  content: string
  status: "pending" | "approved" | "spam" | "trash"
  createdAt: string
  parentId?: string
  flagged?: boolean // <-- Added for flagged status
}

interface CommentSectionProps {
  postId: string
}

const AUTHOR_KEY = "flavor_comment_author"

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  })
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [savedName, setSavedName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem(AUTHOR_KEY)
      if (name) {
        setSavedName(name)
        setFormData((prev) => ({ ...prev, name }))
      }
    }
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?postId=${postId}&postType=blog`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return
    setSubmitting(true)
    setSubmitStatus("idle")

    try {
      const name = formData.name.trim() || "Anonymous"
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTHOR_KEY, name)
        setSavedName(name)
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          postType: "blog",
          author: name,
          content: formData.content.trim(),
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({ name, content: "" })
        fetchComments()
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
      setSubmitStatus("error")
    } finally {
      setSubmitting(false)
    }
  }

  const approvedComments = comments.filter((comment) => comment.status === "approved")
  const pendingComments = comments.filter(
    (comment) =>
      comment.status === "pending" &&
      !!savedName &&
      comment.author.trim().toLowerCase() === savedName.trim().toLowerCase()
  )

  return (
    <div className="space-y-8">
      {/* Comments Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
                <p className="text-sm text-gray-600">
                  {approvedComments.length} {approvedComments.length === 1 ? "comment" : "comments"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Join the conversation</p>
              <p className="text-xs text-gray-400">Share your thoughts below</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="comment-name" className="block text-sm font-medium mb-1">
                Name (optional)
              </Label>
              <Input
                id="comment-name"
                placeholder="Your name (optional)"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="comment-content" className="block text-sm font-medium mb-1">
                Comment
              </Label>
              <Textarea
                id="comment-content"
                placeholder="Write your comment here..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full min-h-[100px]"
                required
              />
            </div>
            <p aria-live="polite" className="flex items-center gap-2 text-sm min-h-[24px]">
              {submitStatus === "success" && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    Comment submitted successfully! It will appear after moderation.
                  </span>
                </>
              )}
              {submitStatus === "error" && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Failed to submit comment. Please try again.</span>
                </>
              )}
            </p>
            <Button type="submit" disabled={submitting || !formData.content.trim()} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <CommentsSkeleton />
        ) : (
          <>
            {/* Approved Comments */}
            {approvedComments.length > 0 ? (
              <div className="space-y-4">
                {approvedComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Be the first to share your thoughts!</p>
                </CardContent>
              </Card>
            )}

            {/* Pending Comments (shown only to this author) */}
            {pendingComments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Pending Comments</h3>
                {pendingComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} isPending />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CommentCard({ comment, isPending = false }: { comment: Comment; isPending?: boolean }) {
  return (
    <Card className={isPending ? "border-yellow-200 bg-yellow-50" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{comment.author}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDate(comment.createdAt)}
              </div>
            </div>
          </div>
          {isPending && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Pending Approval
            </Badge>
          )}
        </div>
        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
      </CardContent>
    </Card>
  )
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
