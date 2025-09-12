import "dotenv/config";
import { getAdminDb } from "../lib/firebase-admin";

async function main() {
  const db = getAdminDb();
  const snap = await db
    .collection("cronLog")
    .orderBy("timestamp", "desc")
    .limit(10)
    .get();

  if (snap.empty) {
    console.log("No cron logs found");
    return;
  }

  snap.docs.forEach((doc) => {
    console.log(doc.data());
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});