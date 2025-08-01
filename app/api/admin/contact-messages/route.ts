import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminAction } from "@/lib/admin-auth";

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  flagged?: boolean;
  scores?: {
    toxicity?: number;
    insult?: number;
    threat?: number;
    [key: string]: unknown;
  } | null;
}

// GET /api/admin/contact-messages
// Supports ?page=1&limit=20&search=foo
export async function GET(req: NextRequest) {
  if (!(await requireAdminAction("canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "20", 10), 1);
  const search = (searchParams.get("search") || "").toLowerCase();

  try {
    // Try new collection first
    let snap = await adminDb
      .collection("contactMessages")
      .orderBy("createdAt", "desc")
      .get();

    // Fallback to legacy collection if empty
    if (snap.empty) {
      snap = await adminDb
        .collection("contact_messages")
        .orderBy("timestamp", "desc")
        .get();
    }

    let messages: ContactMessage[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        firstName: data.firstName || (data.name?.split(" ")[0] ?? "Unknown"),
        lastName: data.lastName || (data.name?.split(" ").slice(1).join(" ") ?? ""),
        email: data.email,
        subject: data.subject,
        message: data.message,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        status: data.status ?? "unread",
        priority: data.priority ?? "medium",
        flagged: !!data.flagged,
        scores: data.scores ?? null,
      };
    });

    if (search) {
      messages = messages.filter((m) => {
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        return (
          fullName.includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.subject.toLowerCase().includes(search)
        );
      });
    }

    const total = messages.length;
    const start = (page - 1) * limit;
    messages = messages.slice(start, start + limit);

    return NextResponse.json({ messages, total, page, limit });
  } catch (err) {
    console.error("[ADMIN_CONTACT_MESSAGES_GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contact-messages
// Body: { id: string, status: "unread"|"read"|"replied"|"archived" }
export async function PUT(req: NextRequest) {
  if (!(await requireAdminAction("canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Update both collections (for legacy support)
    try {
      await adminDb.collection("contactMessages").doc(String(id)).set({ status }, { merge: true });
    } catch (e) {
      console.warn("[ADMIN_CONTACT_MESSAGES_PUT] Failed to update contactMessages", e);
    }
    try {
      await adminDb.collection("contact_messages").doc(String(id)).set({ status }, { merge: true });
    } catch (e) {
      console.warn("[ADMIN_CONTACT_MESSAGES_PUT] Failed to update contact_messages (legacy)", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_CONTACT_MESSAGES_PUT]", err);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
