// Server-only file route. We don't use the client SDK callback flow
// because UploadThing's callback can't reach localhost in dev.
// Uploads happen via /api/uploadthing/upload instead (see route.ts).
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Stub router — kept so imports don't break. Not actually used.
export const ourFileRouter = {
  noop: f({ image: { maxFileSize: "8MB" } }).onUploadComplete(async () => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;