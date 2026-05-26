import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const verificationSession = await prisma.verificationSession.create({
    data: {
      organizationId: session.user.organizationId,
      status: "PENDING",
      auditEntries: {
        create: {
          action: "SESSION_CREATED",
          actorId: session.user.id,
        },
      },
    },
  });

  return NextResponse.json({
    id: verificationSession.id,
    publicToken: verificationSession.publicToken,
    url: `/verify/${verificationSession.publicToken}`,
  });
}