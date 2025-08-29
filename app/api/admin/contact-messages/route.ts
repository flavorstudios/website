import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
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

/**
 * Firestore shapes (new + legacy). Optional because historical docs may be sparse.
 */
type FirestoreContactMessageData = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
  status?: ContactMessage["status"];
  priority?: ContactMessage["priority"];
  flagged?: boolean;
  scores?: Record<string, unknown> | null;
};

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
    const db = getAdminDb();
    // Try new collection first
    let snap = await db
      .collection("contactMessages")
      .orderBy("createdAt", "desc")
      .get();

    // Fallback to legacy collection if empty
    if (snap.empty) {
      snap = await db
        .collection("contact_messages")
        .orderBy("timestamp", "desc")
        .get();
    }

    let messages: ContactMessage[] = snap.docs.map((d) => {
      const data = d.data() as unknown as FirestoreContactMessageData;

      const fullName = typeof data.name === "string" ? data.name : "";
      const firstFromName = fullName ? fullName.split(" ")[0] : "";
      const lastFromName =
        fullName && fullName.includes(" ")
          ? fullName.split(" ").slice(1).join(" ")
          : "";

      const createdAt =
        (typeof data.createdAt === "string" && data.createdAt) ||
        (typeof data.timestamp === "string" && data.timestamp) ||
        new Date().toISOString();

      return {
        id: d.id,
        firstName:
          (typeof data.firstName === "string" && data.firstName) ||
          firstFromName ||
          "Unknown",
        lastName:
          (typeof data.lastName === "string" && data.lastName) ||
          lastFromName ||
          "",
        email: typeof data.email === "string" ? data.email : "",
        subject: typeof data.subject === "string" ? data.subject : "",
        message: typeof data.message === "string" ? data.message : "",
        createdAt,
        status: data.status ?? "unread",
        priority: data.priority ?? "medium",
        flagged: Boolean(data.flagged),
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
    type UpdateBody = { id: string; status: ContactMessage["status"] };
    const bodyUnknown = (await req.json()) as unknown;

    if (!bodyUnknown || typeof bodyUnknown !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { id, status } = bodyUnknown as Partial<UpdateBody>;
    const validStatuses: ContactMessage["status"][] = [
      "unread",
      "read",
      "replied",
      "archived",
    ];

    if (
      typeof id !== "string" ||
      typeof status !== "string" ||
      !validStatuses.includes(status as ContactMessage["status"])
    ) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Update both collections (for legacy support)
    const db = getAdminDb();
    try {
      await db
        .collection("contactMessages")
        .doc(String(id))
        .set({ status }, { merge: true });
    } catch (e) {
      console.warn("[ADMIN_CONTACT_MESSAGES_PUT] Failed to update contactMessages", e);
    }
    try {
      await db
        .collection("contact_messages")
        .doc(String(id))
        .set({ status }, { merge: true });
    } catch (e) {
      console.warn(
        "[ADMIN_CONTACT_MESSAGES_PUT] Failed to update contact_messages (legacy)",
        e
      );
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

// DELETE /api/admin/contact-messages
// Body: { ids: string[] }
export async function DELETE(req: NextRequest) {
  if (!(await requireAdminAction("canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as unknown;
    const ids =
      body && typeof body === "object" && Array.isArray((body as any).ids)
        ? ((body as any).ids as unknown[]).filter(
            (id): id is string => typeof id === "string"
          )
        : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Missing ids" }, { status: 400 });
    }

    const db = getAdminDb();
    await Promise.all(
      ids.map(async (id) => {
        await Promise.all([
          db.collection("contactMessages").doc(id).delete().catch((e) => {
            console.warn(
              "[ADMIN_CONTACT_MESSAGES_DELETE] Failed to delete contactMessages",
              e
            );
          }),
          db.collection("contact_messages").doc(id).delete().catch((e) => {
            console.warn(
              "[ADMIN_CONTACT_MESSAGES_DELETE] Failed to delete contact_messages (legacy)",
              e
            );
          }),
        ]);
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_CONTACT_MESSAGES_DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}
