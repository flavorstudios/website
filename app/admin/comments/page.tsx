"use client";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  name: string;
  email: string;
  message: string;
  postSlug: string;
  createdAt: string;
  flagged: boolean;
  scores: { toxicity: number; insult: number; threat: number };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/comments")
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading comments…</div>;

  return (
    <div style={{padding: 32, maxWidth: 900, margin: "0 auto"}}>
      <h1>Flagged & Recent Comments</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Comment</th>
            <th>Post</th>
            <th>Flagged</th>
            <th>Scores</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {comments.map(c => (
            <tr key={c.id} style={{background: c.flagged ? "#fff3cd" : "white"}}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.message}</td>
              <td>{c.postSlug}</td>
              <td>{c.flagged ? "🚩" : ""}</td>
              <td>
                tox: {c.scores.toxicity.toFixed(2)}<br />
                insult: {c.scores.insult.toFixed(2)}<br />
                threat: {c.scores.threat.toFixed(2)}
              </td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
