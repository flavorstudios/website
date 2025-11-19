import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { serverEnv } from "@/env/server";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
  type RequestContext,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

const PERSPECTIVE_API_KEY = serverEnv.PERSPECTIVE_API_KEY;
const THRESHOLD = 0.75;

const externalBackendBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") || "";

function respondWithExternalRedirect(context: RequestContext) {
  if (!externalBackendBase) {
    return null;
  }
  return jsonResponse(
    context,
    {
      error: "This route moved to the standalone backend.",
      next: `${externalBackendBase}/comments`,
    },
    { status: 410 },
  );
}

type ModerationScores = {
  toxicity: number;
  insult: number;
  threat: number;
};

async function moderateComment(
  text: string,
  context: RequestContext,
): Promise<ModerationScores | null> {
  if (!PERSPECTIVE_API_KEY) {
    logError("comments:moderate:config", undefined, {
      requestId: context.requestId,
      message: "Perspective API key not configured",
    });
    return null;
  }

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": context.requestId,
        },
        cache: "no-store",
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            INSULT: {},
            THREAT: {},
          },
          doNotStore: true,
        }),
      },
    );

    if (!response.ok) {
      logError("comments:moderate:response", undefined, {
        requestId: context.requestId,
        status: response.status,
      });
      return null;
    }

    const data = await response.json();
    return {
      toxicity: data.attributeScores?.TOXICITY?.summaryScore.value ?? 0,
      insult: data.attributeScores?.INSULT?.summaryScore.value ?? 0,
      threat: data.attributeScores?.THREAT?.summaryScore.value ?? 0,
    };
  } catch (error) {
    logError("comments:moderate:error", error, {
      requestId: context.requestId,
    });
    return null;
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["POST"] });
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);

  const redirect = respondWithExternalRedirect(context);
  if (redirect) {
    return redirect;
  }

  try {
    const {
      author,
      email,
      website,
      content,
      postId,
      postType,
      parentId,
      ip,
      userAgent,
    } = (await request.json()) as {
      author?: string;
      email?: string;
      website?: string;
      content?: string;
      postId?: string;
      postType?: string;
      parentId?: string;
      ip?: string;
      userAgent?: string;
    };

    if (!author || !content || !postId || !postType) {
      return jsonResponse(
        context,
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const scores = await moderateComment(content, context);

    let isFlagged: boolean;
    let status: "approved" | "pending";

    if (!scores) {
      isFlagged = true;
      status = "pending";
    } else {
      isFlagged =
        scores.toxicity > THRESHOLD ||
        scores.insult > THRESHOLD ||
        scores.threat > THRESHOLD;
      status = isFlagged ? "pending" : "approved";
    }

    const db = getAdminDb();
    const ref = db
      .collection("comments")
      .doc(postId)
      .collection("entries")
      .doc();

    await ref.set({
      id: ref.id,
      author: author || "Anonymous",
      email: email || "",
      website: website || "",
      content,
      postId,
      postType,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      ip: ip || "",
      userAgent: userAgent || "",
      flagged: isFlagged,
      status,
      scores: scores || {
        toxicity: null,
        insult: null,
        threat: null,
      },
    });

    return jsonResponse(context, {
      success: true,
      status,
      flagged: isFlagged,
      message: !scores
        ? "Comment submitted but could not be automatically moderated. Pending manual review."
        : isFlagged
        ? "Comment submitted but flagged for moderation."
        : "Comment submitted successfully.",
    });
  } catch (error) {
    logError("comments:submit", error, { requestId: context.requestId });
    return errorResponse(context, { error: "Server error" }, 500);
  }
}
