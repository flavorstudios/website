import { NextRequest } from "next/server";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

async function saveTokenToDatabase(_token: string) {
  void _token;
  return true;
}

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["POST"] });
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return jsonResponse(context, { error: "No token provided" }, { status: 400 });
    }

    await saveTokenToDatabase(token);

    return jsonResponse(context, { success: true });
  } catch (error) {
    logError("notifications:register-token", error, {
      requestId: context.requestId,
    });
    return errorResponse(context, { error: "Failed to save token" }, 500);
  }
}
