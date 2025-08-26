"use client";
import { useEffect, useMemo, useState } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import CommentStatsChart from "@/components/admin/comment/CommentStatsChart";

// Comment structure matching Firestore
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
  flagged?: boolean;
  scores?: { toxicity: number; insult: number; threat: number };
};

type BulkAction = "approve" | "spam" | "trash" | "delete";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Comment["status"]
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replying, setReplying] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/comments");
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  };

  useEffect(() => {
    
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return comments
      .filter((c) => statusFilter === "all" || c.status === statusFilter)
      .filter((c) =>
        q
          ? [c.author, c.email, c.content].some((v) =>
              v?.toLowerCase().includes(q)
            )
          : true
      )
      .sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? bDate - aDate : aDate - bDate;
      });
  }, [comments, query, statusFilter, sortOrder]);

  const counts = useMemo(
    () => ({
      all: comments.length,
      pending: comments.filter((c) => c.status === "pending").length,
      approved: comments.filter((c) => c.status === "approved").length,
      spam: comments.filter((c) => c.status === "spam").length,
      trash: comments.filter((c) => c.status === "trash").length,
    }),
    [comments]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((c) => c.id));
    });
  };

  const updateStatus = async (
    postId: string,
    id: string,
    status: Comment["status"]
  ) => {
    await fetch(`/api/admin/comments/${postId}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteComment = async (postId: string, id: string) => {
    await fetch(`/api/admin/comments/${postId}/${id}`, {
      method: "DELETE",
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const bulkAction = async (action: BulkAction) => {
    const ids = Array.from(selected);
    await Promise.all(
      ids.map(async (id) => {
        const comment = comments.find((c) => c.id === id);
        if (!comment) return;
        if (action === "delete") {
          await deleteComment(comment.postId, comment.id);
        } else {
          await updateStatus(
            comment.postId,
            comment.id,
            action === "approve"
              ? "approved"
              : (action as Comment["status"])
          );
        }
      })
    );
    setSelected(new Set());
  };

  const sendReply = async (comment: Comment) => {
    if (!reply.trim()) return;
    await fetch("/api/comments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: "Admin",
        content: reply,
        postId: comment.postId,
        postType: comment.postType,
        parentId: comment.id,
      }),
    });
    setReply("");
    setReplying(null);
    fetchComments();
  };

  if (loading) return <div>Loading comments…</div>;

  return (
    <AdminAuthGuard>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-4">Comment Manager</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64 rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pending", "approved", "spam", "trash"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded text-sm border whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                </button>
              )
            )}
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="rounded border px-2 py-1 text-sm md:ml-auto"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        <div className="mb-4">
          <CommentStatsChart />
        </div>

        {selected.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span>{selected.size} selected</span>
            <button
              onClick={() => bulkAction("approve")}
              className="rounded bg-green-600 px-2 py-1 text-white"
            >
              Approve
            </button>
            <button
              onClick={() => bulkAction("spam")}
              className="rounded bg-yellow-600 px-2 py-1 text-white"
            >
              Spam
            </button>
            <button
              onClick={() => bulkAction("trash")}
              className="rounded bg-orange-600 px-2 py-1 text-white"
            >
              Trash
            </button>
            <button
              onClick={() => bulkAction("delete")}
              className="rounded bg-red-600 px-2 py-1 text-white"
            >
              Delete
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === filtered.length && filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-2 text-left">Author</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left w-1/3">Comment</th>
                <th className="p-2 text-left">Post ID</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Scores</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t ${
                    c.status === "pending" ? "bg-yellow-50" : ""
                  } ${c.flagged ? "border-l-4 border-red-500" : ""}`}
                >
                  <td className="p-2 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td className="p-2 align-top">{c.author}</td>
                  <td className="p-2 align-top">{c.email}</td>
                  <td className="p-2 align-top max-w-xs break-words">{c.content}</td>
                  <td className="p-2 align-top">{c.postId}</td>
                  <td className="p-2 align-top capitalize">{c.status}</td>
                  <td className="p-2 align-top">
                    {c.scores ? (
                      <div>
                        tox: {c.scores.toxicity?.toFixed(2)}<br />
                        insult: {c.scores.insult?.toFixed(2)}<br />
                        threat: {c.scores.threat?.toFixed(2)}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2 align-top whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 align-top">
                    <div className="flex flex-wrap gap-2">
                      {c.status !== "approved" && (
                        <button
                          onClick={() =>
                            updateStatus(c.postId, c.id, "approved")
                          }
                          className="rounded bg-green-600 px-2 py-1 text-white"
                        >
                          Approve
                        </button>
                      )}
                      {c.status !== "spam" && (
                        <button
                          onClick={() => updateStatus(c.postId, c.id, "spam")}
                          className="rounded bg-yellow-600 px-2 py-1 text-white"
                        >
                          Spam
                        </button>
                      )}
                      {c.status !== "trash" && (
                        <button
                          onClick={() => updateStatus(c.postId, c.id, "trash")}
                          className="rounded bg-orange-600 px-2 py-1 text-white"
                        >
                          Trash
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(c.postId, c.id)}
                        className="rounded bg-red-600 px-2 py-1 text-white"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setReplying(replying === c.id ? null : c.id);
                          setReply("");
                        }}
                        className="rounded bg-blue-600 px-2 py-1 text-white"
                      >
                        Reply
                      </button>
                    </div>
                    {replying === c.id && (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          className="w-full rounded border px-2 py-1"
                          rows={3}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendReply(c)}
                            className="rounded bg-blue-600 px-2 py-1 text-white"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => {
                              setReplying(null);
                              setReply("");
                            }}
                            className="rounded border px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

