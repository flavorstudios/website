"use client";
import { useEffect, useState } from "react";

// Match your latest Firestore Comment structure
type Comment = {
  id: string;
  author: string;
  email: string;
  website?: string;
  content: string;
  postId: string;
  postType: "blog" | "video";
  createdAt: string;
  status: "pending" | "approved" | "spam" | "trash";
  scores?: { toxicity: number; insult: number; threat: number };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments from admin API
  useEffect(() => {
    fetch("/api/admin/comments")
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || []);
        setLoading(false);
      });
  }, []);

  // Approve a comment
  const approveComment = async (postId: string, id: string) => {
    await fetch(`/api/admin/comments/${postId}/${id}/approve`, { method: "PATCH" });
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "approved" } : c
      )
    );
  };

  // Delete a comment
  const deleteComment = async (postId: string, id: string) => {
    await fetch(`/api/admin/comments/${postId}/${id}/delete`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <div>Loading comments…</div>;

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Flagged & Recent Comments</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <thead>
          <tr style={{ background: "#f6f6f6" }}>
            <th>Author</th>
            <th>Email</th>
            <th>Comment</th>
            <th>Post ID</th>
            <th>Status</th>
            <th>Scores</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr
              key={c.id}
              style={{
                background: c.status === "pending" ? "#fff3cd" : "white",
                borderBottom: "1px solid #eee",
              }}
            >
              <td>{c.author}</td>
              <td>{c.email}</td>
              <td style={{ maxWidth: 240, wordBreak: "break-word" }}>{c.content}</td>
              <td>{c.postId}</td>
              <td>
                {c.status === "approved" && "✅ Approved"}
                {c.status === "pending" && "🚩 Pending"}
                {c.status === "spam" && "❌ Spam"}
                {c.status === "trash" && "🗑️ Trash"}
              </td>
              <td>
                {c.scores
                  ? (
                    <>
                      tox: {c.scores.toxicity?.toFixed(2)}<br />
                      insult: {c.scores.insult?.toFixed(2)}<br />
                      threat: {c.scores.threat?.toFixed(2)}
                    </>
                  )
                  : "N/A"}
              </td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
              <td>
                {c.status === "pending" && (
                  <button
                    style={{ marginRight: 8, background: "#008C4B", color: "white", border: "none", padding: "4px 10px", borderRadius: 3, cursor: "pointer" }}
                    onClick={() => approveComment(c.postId, c.id)}
                  >
                    Approve
                  </button>
                )}
                <button
                  style={{ background: "#D32F2F", color: "white", border: "none", padding: "4px 10px", borderRadius: 3, cursor: "pointer" }}
                  onClick={() => deleteComment(c.postId, c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
