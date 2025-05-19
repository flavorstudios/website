"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore"
import { signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, type User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, LogOut, MessageSquare, Send } from "lucide-react"

// Types
interface Comment {
  id: string
  text: string
  createdAt: Timestamp
  userId: string
  userName: string
  userPhotoURL: string | null
  postId: string
}

interface CommentsProps {
  postId: string
}

export function Comments({ postId }: CommentsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return unsubscribe
  }, [])

  // Comments listener
  useEffect(() => {
    setLoading(true)
    setError(null)

    const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        setComments(commentsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching comments:", err)
        setError("Failed to load comments. Please try again later.")
        setLoading(false)
      },
    )

    return unsubscribe
  }, [postId])

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error("Error signing in with Google:", err)
      setError("Failed to sign in with Google. Please try again.")
    }
  }

  // Sign in anonymously
  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth)
    } catch (err) {
      console.error("Error signing in anonymously:", err)
      setError("Failed to sign in as guest. Please try again.")
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Failed to sign out. Please try again.")
    }
  }

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!newComment.trim()) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "comments"), {
        text: newComment,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || "Guest User",
        userPhotoURL: user.photoURL,
        postId,
      })

      setNewComment("")
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    } catch (err) {
      console.error("Error adding comment:", err)
      setError("Failed to post comment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "Just now"

    const date = timestamp.toDate()
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString()
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name || name === "Guest User") return "G"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-orbitron gradient-text flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Comments
        </h2>

        {user && (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-3">
              {user.isAnonymous ? "Logged in as Guest" : `Logged in as ${user.displayName}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 mb-6"
        >
          {error}
        </motion.div>
      )}

      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-lg p-6 mb-8 text-center"
        >
          <h3 className="text-lg font-bold font-orbitron mb-4">Join the conversation</h3>
          <p className="text-muted-foreground mb-6">Sign in to leave a comment and participate in the discussion.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={signInWithGoogle} className="bg-primary hover:bg-primary/90 transition-colors">
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              onClick={signInAsGuest}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Continue as Guest
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="bg-card border border-primary/20 rounded-lg p-4 mb-8"
        >
          <Textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px] mb-3 bg-background/50 focus:border-primary/50 transition-colors"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-primary hover:bg-primary/90 transition-colors flex items-center"
            >
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Post Comment
            </Button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 border border-primary/10 rounded-lg bg-card/50">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold font-orbitron mb-2">No comments yet</h3>
            <p className="text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-primary/10 rounded-lg p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_10px_rgba(124,58,237,0.1)]"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    {comment.userPhotoURL ? (
                      <AvatarImage src={comment.userPhotoURL || "/placeholder.svg"} alt={comment.userName} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials(comment.userName)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{comment.userName || "Anonymous User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDate(comment.createdAt) : "Just now"}
                      </span>
                    </div>

                    <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
