import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const existing =
    await prisma.verificationSession.findUnique({
      where: { id },
    });

  if (!existing) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  if (
    existing.organizationId !==
    session.user.organizationId
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await prisma.auditEntry.deleteMany({
    where: { sessionId: id },
  });

  await prisma.check.deleteMany({
    where: { sessionId: id },
  });

  await prisma.document.deleteMany({
    where: { sessionId: id },
  });

  await prisma.verificationSession.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
  });
}