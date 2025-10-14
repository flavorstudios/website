import {
  type PreviewTokenPayload,
  validatePreviewTokenOrThrow,
} from "@/lib/preview-token";
import {
  ExpiredPreviewTokenError,
  InvalidPreviewTokenError,
} from "@/lib/preview-token-errors";

export interface ValidatePreviewTokenInput {
  id: string;
  token?: string | null;
  isE2E?: boolean;
}

export type ValidatePreviewTokenResult =
  | { ok: true; payload: PreviewTokenPayload }
  | { ok: false; reason: "expired" | "invalid" };

export async function validatePreviewToken({
  id,
  token,
  isE2E = false,
}: ValidatePreviewTokenInput): Promise<ValidatePreviewTokenResult> {
  const value = token ?? "";

  if (isE2E && value.startsWith("e2e-token:")) {
    const [, state, postId, uid] = value.split(":");
    if (postId && postId !== id) {
      return { ok: false, reason: "invalid" };
    }
    if (state === "expired") {
      return { ok: false, reason: "expired" };
    }

    return {
      ok: true,
      payload: {
        postId: postId || id,
        uid: uid || "bypass",
        exp: Math.floor(Date.now() / 1000) + 60,
      },
    };
  }

  try {
    const payload = validatePreviewTokenOrThrow(value || null, { postId: id });
    return { ok: true, payload };
  } catch (error) {
    if (error instanceof ExpiredPreviewTokenError) {
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "invalid" };
  }
}