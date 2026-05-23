import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { SessionStatus } from "@prisma/client";

const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "NEEDS_MORE_INFO"]),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid decision", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { decision, notes } = parsed.data;

  const existing = await prisma.verificationSession.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (existing.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (
    existing.status === "APPROVED" ||
    existing.status === "REJECTED"
  ) {
    return NextResponse.json(
      { error: "Session is already finalized" },
      { status: 409 }
    );
  }

  await prisma.verificationSession.update({
    where: { id },
    data: {
      status: decision as SessionStatus,
      reviewerNotes: notes ?? existing.reviewerNotes,
      reviewedAt: new Date(),
      auditEntries: {
        create: {
          action: "STATUS_CHANGED",
          actorId: session.user.id,
          metadata: {
            from: existing.status,
            to: decision,
            notes: notes ?? null,
          },
        },
      },
    },
  });

  return NextResponse.json({ success: true });
}