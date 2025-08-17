"use client";
import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{ className: "text-sm", duration: 5000 }}
      richColors
    />
  );
}