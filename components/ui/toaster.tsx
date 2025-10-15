"use client";
import dynamic from "next/dynamic";
import type { ToasterProps } from "sonner";

const SonnerToaster = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{ className: "text-sm", duration: 5000 }}
      richColors
      {...props}
    />
  );
}