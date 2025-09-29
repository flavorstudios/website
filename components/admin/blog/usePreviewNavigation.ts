"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logClientError } from "@/lib/log-client";

interface PreviewTokenResponse {
  token?: string;
}

export function usePreviewNavigation() {
  const { error: showError } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openPreview = useCallback(async (postId: string) => {
    setLoadingId(postId);
    try {
      const response = await fetch("/api/admin/preview-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: PreviewTokenResponse = await response.json();
      if (!data?.token) {
        throw new Error("Missing preview token in response");
      }

      const url = `/admin/preview/${postId}?token=${encodeURIComponent(data.token)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error while creating preview token";
      logClientError("preview-navigation", error);
      showError("Unable to open preview", {
        description: message,
        duration: 5000,
      });
    } finally {
      setLoadingId((current) => (current === postId ? null : current));
    }
  }, [showError]);

  return { openPreview, loadingId };
}