"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, X, Trash2, MessageSquare, Search, AlertTriangle, Shield, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/date"
import CommentBulkActions from "@/components/admin/comment/CommentBulkActions"
import CommentStatsChart from "@/components/admin/comment/CommentStatsChart"
import AdminPageHeader from "@/components/AdminPageHeader"

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
  flagged?: boolean
  scores?: {
    toxicity: number
    insult: number
    threat: number
  }
}

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [deleteTargets, setDeleteTargets] = useState<{ id: string; postId: string }[] | null>(null)
  const { toast } = useToast()

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/comments", { credentials: "include" })
      const data = await response.json()
      setComments(data.comments || [])
    } catch {
      console.error("Failed to load comments")
      toast("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const updateCommentStatus = async (
    id: string,
    postId: string,
    status: Comment["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/comments/${postId}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, postId, commentId: id }),
        credentials: "include",
      })
      if (response.ok) {
        await loadComments()
        toast(
          status === "approved"
            ? "Comment approved."
            : status === "spam"
            ? "Comment marked as spam."
            : "Comment updated."
        )
      } else {
        const data = await response.json()
        toast(data.error || "Failed to update comment")
      }
    } catch {
      console.error("Failed to update comment")
      toast("Failed to update comment")
    }
  }

  const deleteComment = async (id: string, postId: string) => {
    setDeleteTargets([{ id, postId }])
  }

  const confirmDelete = async () => {
    if (!deleteTargets) return
    for (const { id, postId } of deleteTargets) {
      try {
        const res = await fetch(`/api/admin/comments/${postId}/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, commentId: id }),
          credentials: "include",
        })
        if (res.ok) {
          toast("Comment deleted.")
        } else {
          const data = await res.json()
          toast(data.error || "Failed to delete comment")
        }
      } catch {
        toast("Failed to delete comment")
      }
    }
    setSelectedIds((ids) =>
      ids.filter((id) => !deleteTargets.some((t) => t.id === id))
    )
    setDeleteTargets(null)
    await loadComments()
  }

  // Bulk Actions
  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      const postId = comments.find((c) => c.id === id)?.postId
      if (postId) {
        await updateCommentStatus(id, postId, "approved")
      }
    }
    setSelectedIds([])
  }

  const handleBulkSpam = async () => {
    for (const id of selectedIds) {
      const postId = comments.find((c) => c.id === id)?.postId
      if (postId) {
        await updateCommentStatus(id, postId, "spam")
      }
    }
    setSelectedIds([])
  }

  const handleBulkDelete = async () => {
    const targets = comments
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({ id: c.id, postId: c.postId }))
    setDeleteTargets(targets)
  }

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || comment.status === activeTab
    return matchesSearch && matchesTab
  })

  const getStatusCounts = () => ({
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
    trash: comments.filter((c) => c.status === "trash").length,
  })

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
      {/* --- Standardized Admin Section Header --- */}
      <AdminPageHeader
        title="Comments & Reviews"
        subtitle="Moderate user comments and feedback"
      />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        {/* Responsive search input */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
            aria-label="Search comments"
          />
        </div>
      </div>

      <CommentStatsChart />

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

      <CommentBulkActions
        count={selectedIds.length}
        onApprove={handleBulkApprove}
        onSpam={handleBulkSpam}
        onDelete={handleBulkDelete}
      />

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
                  onUpdateStatus={(id, postId, status) =>
                    updateCommentStatus(id, postId, status)
                  }
                  onDelete={() => deleteComment(comment.id, comment.postId)}
                  selected={selectedIds.includes(comment.id)}
                  onSelect={() =>
                    setSelectedIds((ids) =>
                      ids.includes(comment.id)
                        ? ids.filter((i) => i !== comment.id)
                        : [...ids, comment.id]
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </TabsContent>
      </Tabs>

      {deleteTargets && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleteTargets(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteTargets.length > 1 ? "Comments" : "Comment"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Are you sure you want to delete {deleteTargets.length > 1 ? "these" : "this"} comment
              {deleteTargets.length > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

// ...CommentCard and EmptyState remain unchanged (as in your provided code)...
function CommentCard({
  comment,
  onUpdateStatus,
  onDelete,
  selected,
  onSelect,
}: {
  comment: Comment
  onUpdateStatus: (id: string, postId: string, status: Comment["status"]) => void
  onDelete: () => void
  selected?: boolean
  onSelect?: () => void
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
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow flex",
        comment.flagged && "border-red-500 bg-red-50"
      )}
    >
      <CardContent className="p-6 flex w-full">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mt-2 mr-4 accent-purple-600 h-5 w-5"
          aria-label="Select comment"
        />
        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {comment.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
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
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={getStatusBadge(comment.status)}
                  aria-label={`Status: ${comment.status}`}
                >
                  {comment.status}
                </Badge>
                {comment.flagged && (
                  <Badge variant="destructive" aria-label="Flagged comment">
                    Flagged
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              {comment.scores && (
                <span className="inline-flex items-center mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 inline ml-1 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-0">
                      <table className="text-xs text-gray-600">
                        <tbody>
                          <tr>
                            <td className="pr-2">Toxicity:</td>
                            <td>{comment.scores.toxicity.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="pr-2">Insult:</td>
                            <td>{comment.scores.insult.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="pr-2">Threat:</td>
                            <td>{comment.scores.threat.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </TooltipContent>
                  </Tooltip>
                  <span className="ml-2 text-xs text-gray-400">(Moderation scores)</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                        onClick={() => onUpdateStatus(comment.id, comment.postId, "approved")}
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
                        onClick={() => onUpdateStatus(comment.id, comment.postId, "spam")}
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
                      onClick={onDelete}
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
