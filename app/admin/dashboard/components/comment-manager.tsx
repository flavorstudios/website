"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Trash2, MessageSquare, Search, AlertTriangle, Shield } from "lucide-react"
import { updateCommentStatus, deleteComment } from "../../actions"
import type { Comment } from "@/lib/admin-store"

interface CommentManagerProps {
  initialComments: Comment[]
}

export function CommentManager({ initialComments }: CommentManagerProps) {
  const [comments, setComments] = useState(initialComments)
  const [searchTerm, setSearchTerm] = useState("")

  const handleStatusUpdate = async (id: string, status: Comment["status"]) => {
    await updateCommentStatus(id, status)
    window.location.reload()
  }

  const handleDeleteComment = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment permanently?")) {
      await deleteComment(id)
      window.location.reload()
    }
  }

  const getStatusBadge = (status: Comment["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "spam":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Spam</Badge>
      case "trash":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Trash</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const filterComments = (status?: Comment["status"]) => {
    const filtered = status ? comments.filter((c) => c.status === status) : comments
    return filtered.filter(
      (comment) =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {comment.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
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
              <div className="flex items-center space-x-2">{getStatusBadge(comment.status)}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Post:</span> {comment.postType} • ID: {comment.postId}
              </div>

              <div className="flex items-center space-x-2">
                {comment.status !== "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(comment.id, "approved")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                )}
                {comment.status !== "spam" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(comment.id, "spam")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Spam
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
        <p className="text-gray-600">{message}</p>
      </CardContent>
    </Card>
  )

  const stats = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
    trash: comments.filter((c) => c.status === "trash").length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comment Manager</h1>
          <p className="text-gray-600 mt-2">Review and moderate user comments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.spam}</div>
            <div className="text-sm text-gray-600">Spam</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.trash}</div>
            <div className="text-sm text-gray-600">Trash</div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="relative">
            All
            {stats.all > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {stats.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {stats.pending > 0 && <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-800">{stats.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {stats.approved > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {stats.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="spam">
            Spam
            {stats.spam > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {stats.spam}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trash">
            Trash
            {stats.trash > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {stats.trash}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterComments().length > 0 ? (
            filterComments().map((comment) => <CommentCard key={comment.id} comment={comment} />)
          ) : (
            <EmptyState message="No comments have been submitted yet." icon={MessageSquare} />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterComments("pending").length > 0 ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Comments Awaiting Review</h4>
                  <p className="text-sm text-yellow-700">
                    These comments need your approval before they appear publicly.
                  </p>
                </div>
              </div>
              {filterComments("pending").map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No pending comments to review. Great job staying on top of moderation!"
              icon={Shield}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterComments("approved").length > 0 ? (
            filterComments("approved").map((comment) => <CommentCard key={comment.id} comment={comment} />)
          ) : (
            <EmptyState message="No approved comments yet." icon={Check} />
          )}
        </TabsContent>

        <TabsContent value="spam" className="space-y-4">
          {filterComments("spam").length > 0 ? (
            filterComments("spam").map((comment) => <CommentCard key={comment.id} comment={comment} />)
          ) : (
            <EmptyState message="No spam comments. Your site is clean!" icon={AlertTriangle} />
          )}
        </TabsContent>

        <TabsContent value="trash" className="space-y-4">
          {filterComments("trash").length > 0 ? (
            filterComments("trash").map((comment) => <CommentCard key={comment.id} comment={comment} />)
          ) : (
            <EmptyState message="Trash is empty." icon={Trash2} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
