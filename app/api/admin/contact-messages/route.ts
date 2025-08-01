import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminAction } from "@/lib/admin-auth";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "unread" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
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
    const snap = await adminDb
      .collection("contact_messages")
      .orderBy("timestamp", "desc")
      .get();
    let messages: ContactMessage[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ContactMessage, "id">),
    }));

    if (search) {
      messages = messages.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.subject.toLowerCase().includes(search)
      );
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

    await adminDb.collection("contact_messages").doc(String(id)).update({ status });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_CONTACT_MESSAGES_PUT]", err);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}