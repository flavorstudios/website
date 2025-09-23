"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Check,
  X,
  Trash2,
  MessageSquare,
  Search,
  AlertTriangle,
  Shield,
  Info,
  Flag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/date"
import CommentBulkActions from "@/components/admin/comment/CommentBulkActions"
import CommentStatsChart from "@/components/admin/comment/CommentStatsChart"
import AdminPageHeader from "@/components/AdminPageHeader"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { logClientError } from "@/lib/log-client"

const QUICK_REPLIES = [
  { label: "Thanks for your feedback!", value: "Thanks for your feedback!" },
  {
    label: "We'll look into this.",
    value: "We'll look into this and get back to you.",
  },
  {
    label: "Please keep comments respectful.",
    value: "Please keep comments respectful.",
  },
]

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
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)
  const [postTypeFilter, setPostTypeFilter] = useState<"all" | "blog" | "video">("all")
  const [sortBy, setSortBy] = useState<"date" | "toxicity">("date")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000)
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [replyLoading, setReplyLoading] = useState(false)
  const [toxicityRange, setToxicityRange] = useState<[number, number]>([0, 1])
  const [autoApprove, setAutoApprove] = useState(false)
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(0.2)
  const [autoSpam, setAutoSpam] = useState(false)
  const [autoSpamThreshold, setAutoSpamThreshold] = useState(0.8)
  const { toast } = useToast()

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/comments", { credentials: "include" })
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      logClientError("Failed to load comments", error)
      toast("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadComments()

  }, [loadComments])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(loadComments, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadComments])

  const updateCommentStatus = useCallback(
    async (id: string, postId: string, status: Comment["status"]) => {
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
      } catch (error) {
        logClientError("Failed to update comment", error)
        toast("Failed to update comment")
      }
    },
    [loadComments, toast]
  )

  useEffect(() => {
    if (!autoApprove) return
    const pending = comments.filter(
      (c) => c.status === "pending" && (c.scores?.toxicity ?? 1) <= autoApproveThreshold
    )
    pending.forEach((c) => updateCommentStatus(c.id, c.postId, "approved"))
  }, [comments, autoApprove, autoApproveThreshold, updateCommentStatus])

  useEffect(() => {
    if (!autoSpam) return
    const pending = comments.filter(
      (c) => c.status === "pending" && (c.scores?.toxicity ?? 0) >= autoSpamThreshold
    )
    pending.forEach((c) => updateCommentStatus(c.id, c.postId, "spam"))
  }, [comments, autoSpam, autoSpamThreshold, updateCommentStatus])

  const deleteComment = async (id: string, postId: string) => {
    setDeleteTargets([{ id, postId }])
  }

  const confirmDelete = async () => {
    if (!deleteTargets) return

    const targets = [...deleteTargets]
    const results = await Promise.all(
      targets.map(async ({ id, postId }) => {
        try {
          const res = await fetch(`/api/admin/comments/${postId}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, commentId: id }),
            credentials: "include",
          })
          if (res.ok) {
            return { id, ok: true as const }
          }
          const data = await res.json().catch(() => ({}))
          return { id, ok: false as const, error: data.error || "Failed to delete comment" }
        } catch {
          return { id, ok: false as const, error: "Failed to delete comment" }
        }
      })
    )

    // Summarized toasts
    const successCount = results.filter((r) => r.ok).length
    const firstError = results.find((r) => !r.ok)?.error
    if (successCount > 0) {
      toast(successCount === 1 ? "Comment deleted." : `${successCount} comments deleted.`)
    }
    if (firstError) {
      toast(firstError)
    }

    // Remove only successfully deleted ids from selection
    setSelectedIds((ids) => ids.filter((id) => !results.some((r) => r.ok && r.id === id)))
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

  const handleBulkFlag = async () => {
    for (const id of selectedIds) {
      const comment = comments.find((c) => c.id === id)
      if (comment) {
        await toggleFlagged(comment)
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

  const handleBulkExport = () => {
    const rows = comments.filter((c) => selectedIds.includes(c.id))
    const header = [
      "id",
      "postId",
      "postType",
      "postTitle",
      "author",
      "email",
      "website",
      "content",
      "status",
      "createdAt",
      "ip",
      "flagged",
      "toxicity",
      "insult",
      "threat",
    ]
    const csv = [
      header.join(","),
      ...rows.map((c) =>
        [
          c.id,
          c.postId,
          c.postType,
          JSON.stringify(c.postTitle),
          JSON.stringify(c.author),
          c.email,
          c.website ?? "",
          JSON.stringify(c.content),
          c.status,
          c.createdAt,
          c.ip,
          String(c.flagged ?? false),
          c.scores?.toxicity ?? "",
          c.scores?.insult ?? "",
          c.scores?.threat ?? "",
        ].join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "comments.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFlagged = async (comment: Comment) => {
    try {
      const res = await fetch(`/api/admin/comments/${comment.postId}/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagged: !comment.flagged,
          postId: comment.postId,
          commentId: comment.id,
        }),
        credentials: "include",
      })
      if (res.ok) {
        await loadComments()
        toast(!comment.flagged ? "Comment flagged." : "Flag removed.")
      } else {
        const data = await res.json()
        toast(data.error || "Failed to update flag")
      }
    } catch {
      toast("Failed to update flag")
    }
  }

  const submitReply = async () => {
    if (!replyTarget) return
    setReplyLoading(true)
    try {
      const res = await fetch(
        `/api/admin/comments/${replyTarget.postId}/${replyTarget.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyContent,
            postType: replyTarget.postType,
          }),
          credentials: "include",
        }
      )
      if (res.ok) {
        toast("Reply posted.")
        setReplyTarget(null)
        setReplyContent("")
        await loadComments()
      } else {
        const data = await res.json()
        toast(data.error || "Failed to post reply")
      }
    } catch {
      toast("Failed to post reply")
    } finally {
      setReplyLoading(false)
    }
  }

  const filteredComments = comments.filter((comment) => {
    const lower = searchTerm.toLowerCase()
    const matchesSearch =
      comment.content.toLowerCase().includes(lower) ||
      comment.author.toLowerCase().includes(lower) ||
      comment.postTitle.toLowerCase().includes(lower) ||
      comment.email.toLowerCase().includes(lower) ||
      comment.ip.toLowerCase().includes(lower)
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "flagged"
        ? Boolean(comment.flagged)
        : comment.status === activeTab
    const matchesFlagged =
      activeTab === "flagged"
        ? true
        : showFlaggedOnly
        ? Boolean(comment.flagged)
        : true
    const matchesType = postTypeFilter === "all" || comment.postType === postTypeFilter
    const matchesDate =
      (!startDate || new Date(comment.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(comment.createdAt) <= new Date(endDate))
    const matchesToxicity =
      comment.scores
        ? comment.scores.toxicity >= toxicityRange[0] &&
          comment.scores.toxicity <= toxicityRange[1]
        : true
    return (
      matchesSearch &&
      matchesTab &&
      matchesFlagged &&
      matchesType &&
      matchesDate &&
      matchesToxicity
    )
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    const aVal =
      sortBy === "date"
        ? new Date(a.createdAt).getTime()
        : a.scores?.toxicity ?? 0
    const bVal =
      sortBy === "date"
        ? new Date(b.createdAt).getTime()
        : b.scores?.toxicity ?? 0
    return sortDirection === "desc" ? bVal - aVal : aVal - bVal
  })

  const totalPages = Math.max(1, Math.ceil(sortedComments.length / pageSize))
  const paginatedComments = sortedComments.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    setPage(1)
  }, [
    searchTerm,
    activeTab,
    showFlaggedOnly,
    postTypeFilter,
    startDate,
    endDate,
    toxicityRange,
    pageSize,
  ])

  const getStatusCounts = () => ({
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
    trash: comments.filter((c) => c.status === "trash").length,
    flagged: comments.filter((c) => c.flagged).length,
  })

  const statusCounts = getStatusCounts()

  const FilterControls = () => (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={postTypeFilter}
        onValueChange={(v) => setPostTypeFilter(v as "all" | "blog" | "video")}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="blog">Blog</SelectItem>
          <SelectItem value="video">Video</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "toxicity")}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="toxicity">Toxicity</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={sortDirection}
        onValueChange={(v) => setSortDirection(v as "desc" | "asc")}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Desc</SelectItem>
          <SelectItem value="asc">Asc</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-[150px]"
        aria-label="Start date"
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-[150px]"
        aria-label="End date"
      />
      <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 / page</SelectItem>
          <SelectItem value="25">25 / page</SelectItem>
          <SelectItem value="50">50 / page</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2 pl-2">
        <Checkbox
          id="flagged-only"
          checked={showFlaggedOnly}
          onCheckedChange={(v) => setShowFlaggedOnly(Boolean(v))}
        />
        <Label htmlFor="flagged-only" className="text-sm">
          Flagged
        </Label>
      </div>
      <div className="flex items-center space-x-2 pl-2">
        <Switch
          id="auto-refresh"
          checked={autoRefresh}
          onCheckedChange={(v) => setAutoRefresh(Boolean(v))}
        />
        <Label htmlFor="auto-refresh" className="text-sm">
          Auto
        </Label>
      </div>
      {autoRefresh && (
        <Select
          value={String(refreshInterval)}
          onValueChange={(v) => setRefreshInterval(Number(v))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30000">30s</SelectItem>
            <SelectItem value="60000">1m</SelectItem>
            <SelectItem value="300000">5m</SelectItem>
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center space-x-2 pl-2">
        <Label htmlFor="toxicity-range" className="text-sm">
          Toxicity
        </Label>
        <div className="w-32">
          <Slider
            id="toxicity-range"
            min={0}
            max={1}
            step={0.01}
            value={toxicityRange}
            onValueChange={(v) => setToxicityRange(v as [number, number])}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{toxicityRange[0].toFixed(2)}</span>
            <span>{toxicityRange[1].toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 pl-2">
        <Switch
          id="auto-approve"
          checked={autoApprove}
          onCheckedChange={(v) => setAutoApprove(Boolean(v))}
        />
        <Label htmlFor="auto-approve" className="text-sm">
          Auto approve
        </Label>
      </div>
      {autoApprove && (
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={autoApproveThreshold}
          onChange={(e) =>
            setAutoApproveThreshold(parseFloat(e.target.value))
          }
          className="w-[90px]"
          aria-label="Auto-approve toxicity threshold"
        />
      )}
      <div className="flex items-center space-x-2 pl-2">
        <Switch
          id="auto-spam"
          checked={autoSpam}
          onCheckedChange={(v) => setAutoSpam(Boolean(v))}
        />
        <Label htmlFor="auto-spam" className="text-sm">
          Auto spam
        </Label>
      </div>
      {autoSpam && (
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={autoSpamThreshold}
          onChange={(e) =>
            setAutoSpamThreshold(parseFloat(e.target.value))
          }
          className="w-[90px]"
          aria-label="Auto-spam toxicity threshold"
        />
      )}
    </div>
  )

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
        <div className="hidden sm:block">
          <FilterControls />
        </div>
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-4 space-y-4">
              <FilterControls />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            View Stats
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-6">
          <CommentStatsChart />
        </DialogContent>
      </Dialog>

      <CommentStatsChart />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
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
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.flagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </CardContent>
        </Card>
      </div>

      <CommentBulkActions
        count={selectedIds.length}
        onApprove={handleBulkApprove}
        onSpam={handleBulkSpam}
        onFlag={handleBulkFlag}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-2 w-full">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="spam">Spam ({statusCounts.spam})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({statusCounts.flagged})</TabsTrigger>
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={paginatedComments.every((c) => selectedIds.includes(c.id)) && paginatedComments.length > 0}
                  onCheckedChange={(v) => {
                    const checked = Boolean(v)
                    setSelectedIds((ids) =>
                      checked
                        ? Array.from(new Set([...ids, ...paginatedComments.map((c) => c.id)]))
                        : ids.filter((id) => !paginatedComments.some((c) => c.id === id))
                    )
                  }}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select all
                </Label>
              </div>
              {paginatedComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onUpdateStatus={(id, postId, status) =>
                    updateCommentStatus(id, postId, status)
                  }
                  onDelete={() => deleteComment(comment.id, comment.postId)}
                  onToggleFlag={() => toggleFlagged(comment)}
                  onReply={() => setReplyTarget(comment)}
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
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
      {replyTarget && (
        <Dialog open onOpenChange={(open) => !open && setReplyTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to {replyTarget.author}</DialogTitle>
              <DialogDescription>Send a public response.</DialogDescription>
            </DialogHeader>
            <Select onValueChange={(v) => setReplyContent(v)}>
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Quick reply" />
              </SelectTrigger>
              <SelectContent>
                {QUICK_REPLIES.map((qr) => (
                  <SelectItem key={qr.value} value={qr.value}>
                    {qr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[120px]"
            />
            <DialogFooter className="mt-4">
              <Button
                onClick={() => setReplyTarget(null)}
                disabled={replyLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReply}
                disabled={replyLoading || !replyContent.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
              >
                {replyLoading ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CommentCard({
  comment,
  onUpdateStatus,
  onDelete,
  onToggleFlag,
  onReply,
  selected,
  onSelect,
}: {
  comment: Comment
  onUpdateStatus: (id: string, postId: string, status: Comment["status"]) => void
  onDelete: () => void
  onToggleFlag?: () => void
  onReply?: () => void
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
                {onReply && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={onReply}
                        aria-label="Reply to comment"
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply to this comment</TooltipContent>
                  </Tooltip>
                )}
                {comment.status !== "approved" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(comment.id, comment.postId, "approved")}
                        aria-label="Approve comment"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
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
                        size="sm"
                        onClick={() => onUpdateStatus(comment.id, comment.postId, "spam")}
                        aria-label="Mark as spam"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Spam
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark as spam</TooltipContent>
                  </Tooltip>
                )}
                {onToggleFlag && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={onToggleFlag}
                        aria-label={comment.flagged ? "Unflag comment" : "Flag comment"}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {comment.flagged ? "Remove flag" : "Flag for review"}
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={onDelete}
                      aria-label="Delete comment"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
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
    flagged: "No flagged comments.",
  }

  const icons = {
    all: MessageSquare,
    pending: Shield,
    approved: Check,
    spam: AlertTriangle,
    trash: Trash2,
    flagged: Flag,
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
