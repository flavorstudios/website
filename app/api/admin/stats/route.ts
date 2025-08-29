// app/api/admin/stats/route.ts
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  AggregateField,
  Timestamp,
  Query,
  AggregateQuery,
  Firestore,
} from "firebase-admin/firestore";
import { createHash, randomUUID } from "crypto";
import { z } from "zod";

export const runtime = "nodejs";

// Base stats shape
type Stats = {
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  totalViews: number;
  pendingComments: number;
  publishedPosts: number;
  featuredVideos: number;
  monthlyGrowth: number;
};

type MonthlyStats = {
  month: string; // e.g. "Jan"
  posts: number;
  videos: number;
  comments: number;
};

// Whitelisted ranges. Any other value results in a 400 response.
const RangeSchema = z.enum(["7d", "30d", "3mo", "6mo", "12mo"]);
type Range = z.infer<typeof RangeSchema>;

// Compute start/end dates in UTC for each range
const calcRange = (range: Range): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date(end.getTime());
  switch (range) {
    case "7d":
      start.setUTCDate(start.getUTCDate() - 7);
      break;
    case "30d":
      start.setUTCDate(start.getUTCDate() - 30);
      break;
    case "3mo":
      start.setUTCMonth(start.getUTCMonth() - 3);
      break;
    case "6mo":
      start.setUTCMonth(start.getUTCMonth() - 6);
      break;
    case "12mo":
      start.setUTCMonth(start.getUTCMonth() - 12);
      break;
  }
  return { start, end };
};

// Response for client (always consistent)
type StatsResponse = {
  ok: true;
  range: Range;
  from: string;
  to: string;
} & Stats & { history?: MonthlyStats[] };

// Short-lived cache (60s), keyed by `range`
const statsCache: Record<string, { data: StatsResponse; expires: number }> = {};

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const sessionInfo = await getSessionInfo(request);

  if (process.env.DEBUG_ADMIN === "true") {
    console.log("[admin-stats] Incoming request at", new Date().toISOString());
    console.log("[admin-stats] sessionInfo:", sessionInfo);
  }

  const hasAccess = await requireAdmin(request, "canViewAnalytics");

  if (process.env.DEBUG_ADMIN === "true") {
    console.log(
      "[admin-stats] hasAccess:",
      hasAccess,
      "| role:",
      sessionInfo?.role,
      "| email:",
      sessionInfo?.email
    );
  }

  if (!hasAccess) {
    if (process.env.DEBUG_ADMIN === "true") {
      console.warn("[admin-stats] ACCESS DENIED. Details:", {
        ip: request.headers.get("x-forwarded-for"),
        role: sessionInfo?.role,
        email: sessionInfo?.email,
        uid: sessionInfo?.uid,
      });
    }
    return NextResponse.json(
      {
        error: "Unauthorized",
        role: sessionInfo?.role || "unknown",
        email: sessionInfo?.email || "unknown",
        uid: sessionInfo?.uid || "unknown",
      },
      { status: 401 }
    );
  }

  try {
    // Validate range strictly; reject invalids with 400
    const rangeParam = request.nextUrl.searchParams.get("range") ?? "30d";
    const parsed = RangeSchema.safeParse(rangeParam);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid range", allowed: RangeSchema.options },
        { status: 400 }
      );
    }
    const range = parsed.data;
    const { start, end } = calcRange(range);

    const now = Date.now();
    const ifNoneMatch = request.headers.get("if-none-match");

    console.info(
      JSON.stringify({
        requestId,
        user: sessionInfo?.uid,
        role: sessionInfo?.role,
        range,
        start: start.toISOString(),
        end: end.toISOString(),
      })
    );

    // Early fallback if Firestore is not configured
    if (!adminDb) {
      const empty: StatsResponse = {
        ok: true,
        range,
        from: start.toISOString(),
        to: end.toISOString(),
        totalPosts: 0,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
        ...(range === "12mo" ? { history: [] } : {}),
      };
      const etag = `"${createHash("md5")
        .update(JSON.stringify(empty))
        .digest("hex")}"`;
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache",
          },
        });
      }
      return NextResponse.json(empty, {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      });
    }

    // At this point, adminDb is guaranteed.
    const db: Firestore = adminDb;

    // Serve from cache if available (TTL: 60s)
    const cached = statsCache[range];
    if (cached && cached.expires > now) {
      const etag = `"${createHash("md5")
        .update(JSON.stringify(cached.data))
        .digest("hex")}"`;
      if (process.env.DEBUG_ADMIN === "true") {
        console.log(
          "[admin-stats] Returning cached stats (range:",
          range,
          "):",
          cached.data
        );
      }
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache",
          },
        });
      }
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Helper functions to guard against Firestore query errors
    const safeCount = async (query: Query, label: string): Promise<number> => {
      try {
        const snap = await query.count().get();
        return snap.data().count ?? 0;
      } catch (e) {
        console.error(
          JSON.stringify({
            requestId,
            step: `count:${label}`,
            error: e instanceof Error ? e.message : String(e),
          })
        );
        return 0;
      }
    };

    const safeAggregate = async (
      query: AggregateQuery<{ views: AggregateField<number> }>,
      label: string
    ): Promise<number> => {
      try {
        const snap = await query.get();
        return snap.data().views ?? 0;
      } catch (e) {
        console.error(
          JSON.stringify({
            requestId,
            step: `aggregate:${label}`,
            error: e instanceof Error ? e.message : String(e),
          })
        );
        return 0;
      }
    };

    // Fetch Firestore stats in parallel (guarded)
    const baseFetch = async (): Promise<Stats> => {
      const [
        totalPosts,
        totalVideos,
        totalComments,
        blogViews,
        videoViews,
        pendingComments,
        publishedPosts,
        featuredVideos,
      ] = await Promise.all([
        safeCount(db.collection("blogs"), "totalPosts"),
        safeCount(db.collection("videos"), "totalVideos"),
        safeCount(db.collection("comments"), "totalComments"),
        safeAggregate(
          db
            .collection("blogs")
            .aggregate({ views: AggregateField.sum("views") }),
          "blogViews"
        ),
        safeAggregate(
          db
            .collection("videos")
            .aggregate({ views: AggregateField.sum("views") }),
          "videoViews"
        ),
        safeCount(
          db.collection("comments").where("approved", "==", false),
          "pendingComments"
        ),
        safeCount(
          db.collection("blogs").where("status", "==", "published"),
          "publishedPosts"
        ),
        safeCount(
          db.collection("videos").where("featured", "==", true),
          "featuredVideos"
        ),
      ]);

      return {
        totalPosts,
        totalVideos,
        totalComments,
        totalViews: blogViews + videoViews,
        pendingComments,
        publishedPosts,
        featuredVideos,
        monthlyGrowth: 0,
      };
    };

    let base: Stats;
    try {
      base = await baseFetch();
    } catch (e) {
      console.error(
        JSON.stringify({
          requestId,
          step: "baseFetch",
          error: e instanceof Error ? e.message : String(e),
        })
      );
      return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
    }

    let history: MonthlyStats[] | undefined;

    // Optional 12-month history for charts (guarded per month)
    if (range === "12mo") {
      history = [];
      const current = new Date();

      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(
          Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i, 1)
        );
        const monthEnd = new Date(
          Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i + 1, 1)
        );

        const startTs = Timestamp.fromDate(monthStart);
        const endTs = Timestamp.fromDate(monthEnd);

        try {
          const [postSnap, videoSnap, commentSnap] = await Promise.all([
            db
              .collection("blogs")
              .where("createdAt", ">=", startTs)
              .where("createdAt", "<", endTs)
              .count()
              .get(),
            db
              .collection("videos")
              .where("createdAt", ">=", startTs)
              .where("createdAt", "<", endTs)
              .count()
              .get(),
            // Adjust to your comments structure; this uses a collectionGroup example.
            db
              .collectionGroup("entries")
              .where("createdAt", ">=", startTs)
              .where("createdAt", "<", endTs)
              .count()
              .get(),
          ]);

          history.push({
            month: monthStart.toLocaleString("default", { month: "short" }),
            posts: postSnap.data().count,
            videos: videoSnap.data().count,
            comments: commentSnap.data().count,
          });
        } catch (err) {
          console.error(
            JSON.stringify({
              requestId,
              msg: "monthly aggregation failed",
              month: monthStart.toISOString(),
              error: err instanceof Error ? err.message : String(err),
            })
          );
          history.push({
            month: monthStart.toLocaleString("default", { month: "short" }),
            posts: 0,
            videos: 0,
            comments: 0,
          });
        }
      }
    }

    const response: StatsResponse = {
      ok: true,
      range,
      from: start.toISOString(),
      to: end.toISOString(),
      ...base,
      ...(history ? { history } : {}),
    };

    // Update cache for this range
    statsCache[range] = { data: response, expires: now + 60_000 };

    if (process.env.DEBUG_ADMIN === "true") {
      console.log("[admin-stats] Returning stats (range:", range, "):", response);
    }

    // Compute ETag and honor If-None-Match
    const etag = `"${createHash("md5")
      .update(JSON.stringify(response))
      .digest("hex")}"`;
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        ETag: etag,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}
