// 🚨 LOCKED FILE: DO NOT MODIFY VIA VERCEL AI OR ANY AUTOMATED TOOL!
// This file contains critical admin/auth logic for Flavor Studios.
// To update, remove this notice and proceed manually.

"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import GoogleLoginButton from "@/components/GoogleLoginButton"; // <-- Add this import

// List your admin emails here
const ADMIN_EMAILS = [
  "balgatha77@gmail.com",
  // Add more if needed
];

export default function AdminCommentsPage() {
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Auth UI
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GoogleLoginButton onAuth={setUser} />
      </div>
    );

  // Only allow whitelisted admin emails
  if (!ADMIN_EMAILS.includes(user.email))
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>Access Denied: Your Google account is not authorized to view this page.</p>
        <GoogleLoginButton onAuth={() => {}} />
      </div>
    );

  useEffect(() => {
    const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "comments", id), { approved: true });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteDoc(doc(db, "comments", id));
    }
  };

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">Comment Moderation Panel</h1>
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 && <div>No comments found.</div>}
          {comments.map((c) => (
            <div
              key={c.id}
              className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow transition
                ${c.approved ? "bg-green-50" : c.perspectiveFlag ? "bg-red-50" : "bg-yellow-50"}
                ${c.name === "Flavor Studios" ? "border-primary" : ""}
              `}
            >
              <div>
                <div className="mb-1 text-base">{c.text}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold">
                    {c.name || "Anonymous"}
                    {c.name === "Flavor Studios" && (
                      <span className="ml-2 px-2 py-1 text-xs rounded bg-primary/90 text-white font-bold shadow">
                        Creator
                      </span>
                    )}
                  </span>
                  {" • "}
                  {c.createdAt?.toDate?.()?.toLocaleString() || ""}
                  {c.approved ? (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Approved</span>
                  ) : (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                  )}
                  {c.perspectiveFlag && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Flagged</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!c.approved && (
                  <button
                    className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/80 transition"
                    onClick={() => handleApprove(c.id)}
                  >
                    Approve
                  </button>
                )}
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}