"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Check, X, Trash2, MessageSquare, Search, AlertTriangle, Shield } from "lucide-react"

interface Comment {
  id: string
  postId: string
  postType: "blog" | "video"
  postTitle: string
  author: string
  email: string
  website?: string
  content: string
  status: "pending" | "approved" | "spam" | "trash"
  createdAt: string
  ip: string
}

export function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      const response = await fetch("/api/admin/comments", {
        credentials: "include",
      })
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateCommentStatus = async (id: string, status: Comment["status"]) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      })

      if (response.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error("Failed to update comment:", error)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || comment.status === activeTab
    return matchesSearch && matchesTab
  })

  const getStatusCounts = () => {
    return {
      all: comments.length,
      pending: comments.filter((c) => c.status === "pending").length,
      approved: comments.filter((c) => c.status === "approved").length,
      spam: comments.filter((c) => c.status === "spam").length,
      trash: comments.filter((c) => c.status === "trash").length,
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comments & Reviews</h2>
          <p className="text-gray-600">Moderate user comments and feedback</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
            aria-label="Search comments"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.spam}</div>
            <div className="text-sm text-gray-600">Spam</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.trash}</div>
            <div className="text-sm text-gray-600">Trash</div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="spam">Spam ({statusCounts.spam})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({statusCounts.trash})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {activeTab === "pending" && statusCounts.pending > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Comments Awaiting Review</h4>
                <p className="text-sm text-yellow-700">
                  {statusCounts.pending} comments need your approval before they appear publicly.
                </p>
              </div>
            </div>
          )}

          {filteredComments.length > 0 ? (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onUpdateStatus={updateCommentStatus}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CommentCard({
  comment,
  onUpdateStatus,
  onDelete,
}: {
  comment: Comment
  onUpdateStatus: (id: string, status: Comment["status"]) => void
  onDelete: (id: string) => void
}) {
  const getStatusBadge = (status: Comment["status"]) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      spam: "bg-red-100 text-red-800",
      trash: "bg-gray-100 text-gray-800",
    }
    return styles[status]
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {comment.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{comment.email}</span>
                  {comment.website && (
                    <>
                      <span>•</span>
                      <a
                        href={comment.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge className={getStatusBadge(comment.status)} aria-label={`Status: ${comment.status}`}>
                {comment.status}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium">On:</span> {comment.postTitle} ({comment.postType})
              </div>

              <div className="flex items-center gap-2">
                {comment.status !== "approved" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(comment.id, "approved")}
                        aria-label="Approve comment"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Approve this comment</TooltipContent>
                  </Tooltip>
                )}
                {comment.status !== "spam" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(comment.id, "spam")}
                        aria-label="Mark as spam"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Spam
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark as spam</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(comment.id)}
                      aria-label="Delete comment"
                      className="text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete permanently</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ activeTab }: { activeTab: string }) {
  const messages = {
    all: "No comments have been submitted yet.",
    pending: "No pending comments to review. Great job staying on top of moderation!",
    approved: "No approved comments yet.",
    spam: "No spam comments. Your site is clean!",
    trash: "Trash is empty.",
  }

  const icons = {
    all: MessageSquare,
    pending: Shield,
    approved: Check,
    spam: AlertTriangle,
    trash: Trash2,
  }

  const Icon = icons[activeTab as keyof typeof icons] || MessageSquare

  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
        <p className="text-gray-600">{messages[activeTab as keyof typeof messages]}</p>
      </CardContent>
    </Card>
  )
}
