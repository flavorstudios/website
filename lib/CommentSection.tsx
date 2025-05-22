"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CommentSection({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [name, setName] = useState(""); // <-- NEW for name input
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch approved comments for this post
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      where("approved", "==", true),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [postId]);

  // Handle comment submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        text: comment.trim(),
        name: name.trim() || "Anonymous", // <-- Save name
        createdAt: Timestamp.now(),
        approved: false // Will be set true by your Perspective API moderation function
      });
      setSuccess(true);
      setComment("");
      setName(""); // <-- Reset name input
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Something went wrong! Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
        {/* Name input */}
        <input
          className="border rounded-lg p-2 text-base"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <textarea
          className="border rounded-lg p-2 text-base resize-none min-h-[80px]"
          placeholder="Share your thoughts (be kind!)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Post Comment"}
        </button>
        {success && <div className="text-green-500">Thank you! Your comment will appear after moderation.</div>}
      </form>
      <div>
        {comments.length === 0 && <div className="text-muted-foreground">No comments yet. Be the first!</div>}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`mb-4 p-3 rounded-lg border ${
              c.name === "Flavor Studios" ? "border-primary bg-primary/5 shadow-lg" : "bg-background"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {c.name || "Anonymous"}
                {c.name === "Flavor Studios" && (
                  <span className="ml-2 px-2 py-1 text-xs rounded bg-primary/90 text-white font-bold shadow">
                    Creator
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {c.createdAt?.toDate?.() ? c.createdAt.toDate().toLocaleString() : ""}
              </span>
            </div>
            <div className="text-base mt-1">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}