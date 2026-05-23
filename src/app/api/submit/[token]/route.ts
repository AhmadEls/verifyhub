import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificationSubmissionSchema } from "@/lib/validators";
import { runRiskEngine } from "@/lib/risk-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const body = await req.json();

    const parsed =
      verificationSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid submission",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const verificationSession =
      await prisma.verificationSession.findUnique({
        where: {
          publicToken: token,
        },
      });

    if (!verificationSession) {
      return NextResponse.json(
        {
          error: "Session not found",
        },
        { status: 404 }
      );
    }

    if (
      verificationSession.status !== "PENDING"
    ) {
      return NextResponse.json(
        {
          error: "Session already submitted",
        },
        { status: 409 }
      );
    }

    // RUN COMPLIANCE ENGINE
    const risk = runRiskEngine({
      fullName: data.fullName,
      country: data.country,
      hasSelfie: !!data.documents.selfie,
      hasIdFront: !!data.documents.idFront,
      hasIdBack: !!data.documents.idBack,
    });

    // DETERMINE STATUS
    let nextStatus:
      | "SUBMITTED"
      | "IN_REVIEW" = "SUBMITTED";

    if (risk.riskScore >= 70) {
      nextStatus = "IN_REVIEW";
    }

    await prisma.verificationSession.update({
      where: {
        id: verificationSession.id,
      },

      data: {
        status: nextStatus,

        submittedAt: new Date(),

        fullName: data.fullName,

        dateOfBirth: new Date(
          data.dateOfBirth
        ),

        addressLine: data.addressLine,

        city: data.city,

        country: data.country,

        riskScore: risk.riskScore,

        documents: {
          create: [
            {
              type: "ID_FRONT",
              url: data.documents.idFront.url,
              fileKey:
                data.documents.idFront.key,
            },

            {
              type: "ID_BACK",
              url: data.documents.idBack.url,
              fileKey:
                data.documents.idBack.key,
            },

            {
              type: "SELFIE",
              url: data.documents.selfie.url,
              fileKey:
                data.documents.selfie.key,
            },
          ],
        },

        checks: {
          create: risk.checks.map((check) => ({
            type: check.type,
            status: check.status,
            score: check.score,
          })),
        },

        auditEntries: {
          create: [
            {
              action: "SESSION_SUBMITTED",
              metadata: {
                riskScore: risk.riskScore,
              },
            },

            {
              action: "CHECKS_COMPLETED",
              metadata: {
                score: risk.riskScore,
                flags: risk.flags,
              },
            },

            ...risk.flags.map((flag) => ({
  action: "CHECKS_COMPLETED" as const,
  metadata: {
    flag,
  },
})),
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      riskScore: risk.riskScore,
      flags: risk.flags,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}