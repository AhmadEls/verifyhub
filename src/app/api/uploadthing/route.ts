import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const sessionToken = formData.get("sessionToken");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof sessionToken !== "string" || !sessionToken) {
    return NextResponse.json({ error: "Missing session token" }, { status: 400 });
  }

  const result = await utapi.uploadFiles(file);
  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error?.message ?? "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: result.data.ufsUrl,
    key: result.data.key,
  });
}