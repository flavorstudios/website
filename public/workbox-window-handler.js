import { Workbox } from "workbox-window";

if ("serviceWorker" in navigator) {
  const wb = new Workbox("/service-worker.js");

  wb.addEventListener("waiting", () => {
    if (confirm("⚡ New version available. Refresh now?")) {
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });
      wb.messageSW({ type: "SKIP_WAITING" });
    }
  });

  wb.register();
}
