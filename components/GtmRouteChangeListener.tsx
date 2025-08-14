"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GtmRouteChangeListener() {
  const pathname = usePathname();

  useEffect(() => {
    const prefixes = (
      process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES ||
      "/admin,/wp-admin,/dashboard,/backend"
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const isAdminRoute = prefixes.some((p) =>
      new RegExp("^" + p.replace(/\//g, "\\/") + "(\/|$)", "i").test(pathname),
    );

    (window as { dataLayer: Record<string, unknown>[] }).dataLayer =
      (window as { dataLayer: Record<string, unknown>[] }).dataLayer || [];
    (window as { dataLayer: Record<string, unknown>[] }).dataLayer.push({
      event: "router_change",
      path: pathname,
      isAdminRoute,
    });
  }, [pathname]);

  return null;
}