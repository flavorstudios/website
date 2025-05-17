self.addEventListener("sync", function (event) {
  if (event.tag === "sync-flavor-content") {
    event.waitUntil(
      fetch("/api/sync").then(response => {
        console.log("✔️ Background sync completed.");
      }).catch(err => {
        console.error("❌ Sync failed:", err);
      })
    );
  }
});
