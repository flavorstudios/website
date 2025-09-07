import { getAdminDb } from "@/lib/firebase-admin";
import { extractMediaIds, linkMediaToPost } from "@/lib/media";

async function main() {
  const db = getAdminDb();
  const mediaSnap = await db.collection("media").get();
  const batch = db.batch();
  mediaSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { attachedTo: [] });
  });
  await batch.commit();

  const postsSnap = await db.collection("blogs").get();
  for (const postDoc of postsSnap.docs) {
    const data = postDoc.data();
    const ids = extractMediaIds(
      data.content,
      data.featuredImage,
      data.openGraphImage
    );
    await linkMediaToPost(ids, postDoc.id);
  }
  console.log("Backfill complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});