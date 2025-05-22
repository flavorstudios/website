"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Avatar: colorful, based on name initials
function Avatar({ name = "?" }: { name?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  // Generate color from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = `hsl(${hash % 360}, 65%, 70%)`;
  return (
    <div
      className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg mr-2"
      style={{ background: color, boxShadow: "0 1px 4px #0002" }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

// Recursive CommentList for threads
function CommentList({ comments, parentId = null, onReply }: any) {
  return comments
    .filter((c: any) => c.parentId === parentId)
    .map((c: any) => (
      <div
        key={c.id}
        className={`mb-4 p-3 rounded-lg border relative ${
          c.name === "Flavor Studios"
            ? "border-primary bg-primary/5 shadow-lg"
            : "bg-background"
        }`}
        style={parentId ? { marginLeft: 32 } : {}}
      >
        <div className="flex items-center">
          <Avatar name={c.name || "Anonymous"} />
          <span className="font-semibold">
            {c.name || "Anonymous"}
            {c.name === "Flavor Studios" && (
              <span className="ml-2 px-2 py-1 text-xs rounded bg-primary/90 text-white font-bold shadow">
                Creator
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {c.createdAt?.toDate?.()?.toLocaleString() || ""}
          </span>
        </div>
        <div className="ml-10 mt-1">{c.text}</div>
        <button
          className="ml-10 mt-2 text-xs text-primary hover:underline"
          onClick={() => onReply(c.id)}
        >
          Reply
        </button>
        {/* Recursively show replies */}
        <CommentList comments={comments} parentId={c.id} onReply={onReply} />
      </div>
    ));
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch approved comments for this post
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      where("approved", "==", true),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        text: comment.trim(),
        name: name.trim() || "Anonymous",
        parentId: parentId || null,
        createdAt: Timestamp.now(),
        approved: false, // For moderation
      });
      setSuccess(true);
      setComment("");
      setName("");
      setParentId(null);
      setReplyingTo(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Something went wrong! Try again.");
    }
    setLoading(false);
  }

  const handleReply = (id: string) => {
    setParentId(id);
    setReplyingTo(id);
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3" id="comment-form">
        <input
          className="border rounded-lg p-2 text-base"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <textarea
          className="border rounded-lg p-2 text-base resize-none min-h-[80px]"
          placeholder={
            replyingTo
              ? "Write your reply here…"
              : "Share your thoughts (be kind!)"
          }
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading}
        />
        {replyingTo && (
          <div className="text-xs text-muted-foreground ml-2">
            Replying to a comment.{" "}
            <button
              type="button"
              className="underline text-primary"
              onClick={() => {
                setParentId(null);
                setReplyingTo(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : replyingTo
            ? "Reply"
            : "Post Comment"}
        </button>
        {success && (
          <div className="text-green-500">
            Thank you! Your comment will appear after moderation.
          </div>
        )}
      </form>
      <div>
        {comments.length === 0 && (
          <div className="text-muted-foreground">
            No comments yet. Be the first!
          </div>
        )}
        <CommentList comments={comments} parentId={null} onReply={handleReply} />
      </div>
    </div>
  );
}