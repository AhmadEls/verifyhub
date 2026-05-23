import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "../../status-badge";
import { ActionButtons } from "./action-buttons";
import { AuditLog } from "./audit-log";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authSession = await auth();

  if (!authSession?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const verificationSession = await prisma.verificationSession.findUnique({
    where: { id },
    include: {
      documents: true,
      checks: {
        orderBy: {
          createdAt: "asc",
        },
      },
      auditEntries: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!verificationSession) {
    notFound();
  }

  if (
    verificationSession.organizationId !==
    authSession.user.organizationId
  ) {
    notFound();
  }

  const isFinalized =
    verificationSession.status === "APPROVED" ||
    verificationSession.status === "REJECTED";

  const flags = generateFlags(
    verificationSession.country,
    verificationSession.riskScore ?? 0,
    verificationSession.checks
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 transition"
        >
          ← Back to sessions
        </Link>

        <div className="flex items-start justify-between mt-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {verificationSession.fullName || "Unnamed session"}
              </h1>

              <StatusBadge status={verificationSession.status} />
            </div>

            <p className="text-sm text-slate-500 font-mono mt-2">
              {verificationSession.id}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {verificationSession.riskScore !== null && (
                <RiskBadge score={verificationSession.riskScore} />
              )}

              {flags.map((flag) => (
                <FlagBadge key={flag.label} {...flag} />
              ))}
            </div>
          </div>

          <div className="w-48">
            <RiskMeter score={verificationSession.riskScore ?? 0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-lg">
                Personal Information
              </h2>
            </div>

            <dl className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm">
              <Field
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={verificationSession.fullName}
              />

              <Field
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={
                  verificationSession.dateOfBirth
                    ? verificationSession.dateOfBirth.toLocaleDateString()
                    : null
                }
              />

              <Field
                icon={<MapPin className="w-4 h-4" />}
                label="Address"
                value={verificationSession.addressLine}
              />

              <Field
                icon={<MapPin className="w-4 h-4" />}
                label="City"
                value={verificationSession.city}
              />

              <Field
                icon={<ShieldAlert className="w-4 h-4" />}
                label="Country"
                value={verificationSession.country}
              />

              <Field
                icon={<Calendar className="w-4 h-4" />}
                label="Submitted"
                value={
                  verificationSession.submittedAt
                    ? verificationSession.submittedAt.toLocaleString()
                    : null
                }
              />
            </dl>
          </section>

          {/* Documents */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-lg">
                Uploaded Documents
              </h2>
            </div>

            {verificationSession.documents.length === 0 ? (
              <p className="text-sm text-slate-500">
                No documents uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {verificationSession.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border rounded-xl overflow-hidden bg-slate-50 hover:shadow-md hover:-translate-y-1 transition"
                  >
                    <div className="relative">
                      <img
                        src={doc.url}
                        alt={doc.type}
                        className="w-full h-44 object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </div>

                    <div className="p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Checks */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-lg">
                Compliance Checks
              </h2>
            </div>

            {verificationSession.checks.length === 0 ? (
              <p className="text-sm text-slate-500">
                No checks have run yet.
              </p>
            ) : (
              <div className="space-y-3">
                {verificationSession.checks.map((check) => (
                  <div
                    key={check.id}
                    className="border rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {check.type.replace(/_/g, " ")}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Verification engine result
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {check.score !== null && (
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {(check.score * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-slate-500">
                            confidence
                          </p>
                        </div>
                      )}

                      <CheckStatusBadge status={check.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes */}
          {verificationSession.reviewerNotes && (
            <section className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">
                Reviewer Notes
              </h2>

              <div className="bg-slate-50 border rounded-xl p-4">
                <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {verificationSession.reviewerNotes}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {!isFinalized && (
            <section className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">
                Reviewer Decision
              </h2>

              <ActionButtons
                sessionId={verificationSession.id}
              />
            </section>
          )}

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">
              Audit Timeline
            </h2>

            <AuditLog
              entries={verificationSession.auditEntries}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-slate-500 flex items-center gap-2 mb-1">
        {icon}
        {label}
      </dt>

      <dd className="font-medium text-slate-900">
        {value || (
          <span className="text-slate-400">—</span>
        )}
      </dd>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-red-100 text-red-700 border-red-200"
      : score >= 40
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-green-100 text-green-700 border-green-200";

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full border ${color}`}
    >
      Risk Score {score}
    </span>
  );
}

function CheckStatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<string, string> = {
    PASS: "bg-green-100 text-green-700",
    FAIL: "bg-red-100 text-red-700",
    REVIEW: "bg-amber-100 text-amber-700",
    PENDING: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${config[status] ?? config.PENDING}`}
    >
      {status}
    </span>
  );
}

function RiskMeter({ score }: { score: number }) {
  const percentage = Math.min(score, 100);

  const color =
    score >= 70
      ? "bg-red-500"
      : score >= 40
      ? "bg-amber-500"
      : "bg-green-500";

  return (
    <div className="border rounded-2xl p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">
          Risk Analysis
        </p>

        <p className="text-sm font-bold">
          {score}/100
        </p>
      </div>

      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Automated compliance evaluation
      </p>
    </div>
  );
}

function FlagBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${color}`}
    >
      <AlertTriangle className="w-3 h-3" />
      {label}
    </span>
  );
}

function generateFlags(
  country: string | null,
  riskScore: number,
  checks: any[]
) {
  const flags = [];

  const highRiskCountries = [
    "Iran",
    "North Korea",
    "Syria",
    "Russia",
  ];

  if (
    country &&
    highRiskCountries.includes(country)
  ) {
    flags.push({
      label: "High Risk Geography",
      color:
        "bg-red-100 text-red-700 border-red-200",
    });
  }

  if (riskScore >= 70) {
    flags.push({
      label: "Manual Review Required",
      color:
        "bg-amber-100 text-amber-700 border-amber-200",
    });
  }

  const failedChecks = checks.filter(
    (check) => check.status === "FAIL"
  );

  if (failedChecks.length > 0) {
    flags.push({
      label: "Failed Verification Check",
      color:
        "bg-red-100 text-red-700 border-red-200",
    });
  }

  return flags;
}