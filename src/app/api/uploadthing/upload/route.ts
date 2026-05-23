import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const sessionToken = formData.get("sessionToken");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (typeof sessionToken !== "string" || !sessionToken) {
      return NextResponse.json({ error: "Missing session token" }, { status: 400 });
    }

    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

    console.log("[upload] Starting upload, file size:", file.size, "name:", file.name);
    console.log("[upload] Token present:", !!process.env.UPLOADTHING_TOKEN);

    const result = await utapi.uploadFiles(file);

    console.log("[upload] Result:", JSON.stringify(result));

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error?.message ?? "Upload failed", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: result.data.ufsUrl,
      key: result.data.key,
    });
  } catch (err) {
    console.error("[upload] Caught error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}