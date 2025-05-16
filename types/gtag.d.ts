interface Window {
  gtag: (command: "config" | "event" | "js" | "set", targetId: string, config?: Record<string, any> | Date) => void
  dataLayer: any[]
}
