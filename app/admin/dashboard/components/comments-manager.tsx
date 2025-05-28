"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Trash2,
  Calendar,
  User,
  Mail,
  Globe,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface Comment {
  id: string
  author: string
  email: string
  website?: string
  content: string
  postTitle: string
  postSlug: string
  status: "pending" | "approved" | "spam" | "trash"
  createdAt: string
  ipAddress: string
  userAgent: string
}

export function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)

  // Mock data
  const mockComments: Comment[] = [
    {
      id: "1",
      author: "John Doe",
      email: "john@example.com",
      website: "https://johndoe.com",
      content:
        "Great article! I really enjoyed reading about the animation process. Looking forward to more content like this.",
      postTitle: "Behind the Scenes: Our Animation Process",
      postSlug: "behind-scenes-animation-process",
      status: "pending",
      createdAt: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      id: "2",
      author: "Jane Smith",
      email: "jane@example.com",
      content:
        "This is amazing work! The attention to detail in your animations is incredible. Keep up the fantastic work!",
      postTitle: "Latest Episode Release",
      postSlug: "latest-episode-release",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      ipAddress: "192.168.1.2",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    {
      id: "3",
      author: "Spam Bot",
      email: "spam@spam.com",
      website: "https://spam-site.com",
      content: "Buy cheap products now! Visit our website for amazing deals!",
      postTitle: "Studio Updates",
      postSlug: "studio-updates",
      status: "spam",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      ipAddress: "192.168.1.3",
      userAgent: "Bot/1.0",
    },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setComments(mockComments)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = comments

    if (statusFilter !== "all") {
      filtered = filtered.filter((comment) => comment.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (comment) =>
          comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredComments(filtered)
  }, [comments, statusFilter, searchQuery])

  const handleStatusChange = (commentId: string, newStatus: Comment["status"]) => {
    setComments((prev) =>
      prev.map((comment) => (comment.id === commentId ? { ...comment, status: newStatus } : comment)),
    )
  }

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  const getStatusColor = (status: Comment["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "spam":
        return "bg-red-100 text-red-800"
      case "trash":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: Comment["status"]) => {
    switch (status) {
      case "approved":
        return <Check className="h-3 w-3" />
      case "pending":
        return <AlertTriangle className="h-3 w-3" />
      case "spam":
        return <X className="h-3 w-3" />
      case "trash":
        return <Trash2 className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const statusCounts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
    trash: comments.filter((c) => c.status === "trash").length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Comments</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-gray-600">Manage and moderate user comments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card
            key={status}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter(status)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status === "all" ? "Total" : status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Comments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments found</h3>
              <p className="text-gray-600">
                {statusFilter === "all" ? "No comments have been submitted yet." : `No ${statusFilter} comments found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Comment Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{comment.author}</span>
                        <Badge className={`${getStatusColor(comment.status)} text-xs`}>
                          {getStatusIcon(comment.status)}
                          <span className="ml-1 capitalize">{comment.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {comment.email}
                        </span>
                        {comment.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <a
                              href={comment.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Post Reference */}
                    <div className="text-sm text-gray-600">
                      On post: <span className="font-medium">{comment.postTitle}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2">
                    {comment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(comment.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Approve</span>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(comment.id, "spam")}>
                          <ThumbsDown className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Spam</span>
                        </Button>
                      </>
                    )}

                    {comment.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(comment.id, "pending")}>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Unapprove</span>
                      </Button>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedComment(comment)}>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Comment Details</DialogTitle>
                          <DialogDescription>Full comment information and metadata</DialogDescription>
                        </DialogHeader>
                        {selectedComment && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Author:</strong> {selectedComment.author}
                              </div>
                              <div>
                                <strong>Email:</strong> {selectedComment.email}
                              </div>
                              <div>
                                <strong>IP Address:</strong> {selectedComment.ipAddress}
                              </div>
                              <div>
                                <strong>Status:</strong>
                                <Badge className={`ml-2 ${getStatusColor(selectedComment.status)}`}>
                                  {selectedComment.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <strong>User Agent:</strong>
                              <p className="text-sm text-gray-600 mt-1">{selectedComment.userAgent}</p>
                            </div>
                            <div>
                              <strong>Comment:</strong>
                              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                                <p>{selectedComment.content}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="destructive" onClick={() => handleDelete(comment.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
