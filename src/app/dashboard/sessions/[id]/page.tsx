import { DeleteSessionButton } from "@/components/delete-session-button";
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
  ArrowLeft,
  BrainCircuit,
  ScanFace,
  Fingerprint,
  ShieldCheck,
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
      checks: { orderBy: { createdAt: "asc" } },
      auditEntries: {
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!verificationSession) notFound();

  if (verificationSession.organizationId !== authSession.user.organizationId) {
    notFound();
  }

  const isFinalized =
    verificationSession.status === "APPROVED" ||
    verificationSession.status === "REJECTED";

  const riskScore = verificationSession.riskScore ?? 0;

  const flags = generateFlags(
    verificationSession.country,
    riskScore,
    verificationSession.checks
  );

  const riskSummary = getRiskSummary(riskScore, flags.length);

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sessions
        </Link>

        <div className="flex items-start justify-between mt-8 gap-8">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight">
                {verificationSession.fullName || "Unnamed applicant"}
              </h1>

              <StatusBadge status={verificationSession.status} />
            </div>

            <p className="text-sm text-slate-500 font-mono mt-3">
              {verificationSession.id}
            </p>

            <p className="text-slate-400 mt-5 max-w-2xl leading-relaxed">
              {riskSummary}
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <RiskBadge score={riskScore} />

              {flags.map((flag) => (
                <FlagBadge key={flag.label} {...flag} />
              ))}
            </div>
          </div>

          <div className="w-72">
            <RiskMeter score={riskScore} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <SectionTitle
              icon={<User className="w-5 h-5" />}
              title="Applicant Profile"
              subtitle="Submitted identity and onboarding information"
            />

            <dl className="grid grid-cols-2 gap-5 text-sm mt-6">
              <Field icon={<User className="w-4 h-4" />} label="Full Name" value={verificationSession.fullName} />

              <Field
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={
                  verificationSession.dateOfBirth
                    ? verificationSession.dateOfBirth.toLocaleDateString()
                    : null
                }
              />

              <Field icon={<MapPin className="w-4 h-4" />} label="Address" value={verificationSession.addressLine} />
              <Field icon={<MapPin className="w-4 h-4" />} label="City" value={verificationSession.city} />
              <Field icon={<ShieldAlert className="w-4 h-4" />} label="Country" value={verificationSession.country} />

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

<section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-3xl p-6">
  <div className="flex items-start justify-between gap-6">
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
        Automated Compliance Decision
      </p>

      <h2 className="text-3xl font-bold mt-3">
        {riskScore >= 70
          ? "Escalated Risk Profile"
          : riskScore >= 40
          ? "Enhanced Due Diligence Required"
          : "Low Risk Verification"}
      </h2>

      <p className="text-slate-300 mt-4 max-w-2xl leading-relaxed">
        Automated AML/KYC screening completed using configurable compliance scoring rules and verification checks.
      </p>
    </div>

    <div className="text-right">
      <p className="text-sm text-slate-400">
        Risk Score
      </p>

      <p className="text-6xl font-bold text-white mt-2">
        {riskScore}
      </p>
    </div>
  </div>
</section>

<section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <SectionTitle
              icon={<BrainCircuit className="w-5 h-5" />}
              title="Risk Intelligence"
              subtitle="Automated screening result generated from submitted verification data"
            />

            <div className="grid grid-cols-3 gap-4 mt-6">
              <RiskInsight title="Risk Level" value={getRiskLevel(riskScore)} />
              <RiskInsight title="Escalation" value={riskScore >= 70 ? "Manual Review" : riskScore >= 40 ? "Enhanced Review" : "Standard"} />
              <RiskInsight title="Flags" value={`${flags.length} detected`} />
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <SectionTitle
              icon={<FileText className="w-5 h-5" />}
              title="Uploaded Documents"
              subtitle="Identity evidence submitted by the applicant"
            />

            {verificationSession.documents.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
  No verification documents uploaded yet.
</div>
            ) : (
              <div className="grid grid-cols-3 gap-5 mt-6">
                {verificationSession.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-white/10 rounded-2xl overflow-hidden bg-black/20 hover:border-cyan-500/30 transition"
                  >
                    <div className="relative">
                      <img src={doc.url} alt={doc.type} className="w-full h-44 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    </div>

                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <SectionTitle
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="Compliance Checks"
              subtitle="Automated verification checks and confidence results"
            />

            {verificationSession.checks.length === 0 ? (
              <div className="mt-6 border border-white/10 rounded-2xl p-5 bg-black/20">
                <p className="text-sm text-slate-400">
                  No checks have run yet. Submit the public verification form to trigger the compliance engine.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {verificationSession.checks.map((check) => {
                  const details = getCheckDetails(check.type, check.status);

                  return (
                    <div
                      key={check.id}
                      className="border border-white/10 rounded-2xl p-5 bg-black/20"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${details.iconClass}`}>
                            {details.icon}
                          </div>

                          <div>
                            <p className="font-semibold text-white">
                              {details.title}
                            </p>

                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                              {details.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {check.score !== null && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">
                                {(check.score * 100).toFixed(0)}%
                              </p>
                              <p className="text-xs text-slate-500">confidence</p>
                            </div>
                          )}

                          <CheckStatusBadge status={check.status} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {verificationSession.reviewerNotes && (
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <SectionTitle
                icon={<FileText className="w-5 h-5" />}
                title="Reviewer Notes"
                subtitle="Final compliance reasoning and manual review context"
              />

              <div className="mt-6 bg-black/20 border border-white/10 rounded-2xl p-5">
                <p className="text-sm whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {verificationSession.reviewerNotes}
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {!isFinalized && (
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="font-semibold text-lg mb-2">Reviewer Decision</h2>
              <p className="text-sm text-slate-400 mb-5">
                Finalize, reject, or request additional information.
              </p>

              <ActionButtons sessionId={verificationSession.id} />

<div className="mt-4">
  <DeleteSessionButton
    sessionId={verificationSession.id}
  />
</div>
            </section>
          )}

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="font-semibold text-lg mb-2">Audit Timeline</h2>
            <p className="text-sm text-slate-400 mb-6">
              Full trace of automated and manual actions.
            </p>

            <AuditLog entries={verificationSession.auditEntries} />
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
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
    <div className="border border-white/10 rounded-2xl p-4 bg-black/20">
      <dt className="text-slate-400 flex items-center gap-2 mb-2">
        {icon}
        {label}
      </dt>

      <dd className="font-medium text-white">
        {value || <span className="text-slate-500">—</span>}
      </dd>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-red-500/10 text-red-300 border-red-500/20"
      : score >= 40
      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
      : "bg-green-500/10 text-green-300 border-green-500/20";

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${color}`}>
      Risk Score {score}
    </span>
  );
}

function CheckStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    PASS: "bg-green-500/10 text-green-300 border-green-500/20",
    FAIL: "bg-red-500/10 text-red-300 border-red-500/20",
    REVIEW: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    PENDING: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${config[status] ?? config.PENDING}`}>
      {status}
    </span>
  );
}

function RiskMeter({ score }: { score: number }) {
  const percentage = Math.min(score, 100);

  const color =
    score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="border border-white/10 rounded-3xl p-5 bg-black/20">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-300">Risk Analysis</p>
        <p className="text-sm font-bold text-white">{score}/100</p>
      </div>

      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Automated compliance evaluation
      </p>
    </div>
  );
}

function FlagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${color}`}>
      <AlertTriangle className="w-3 h-3" />
      {label}
    </span>
  );
}

function RiskInsight({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-white/10 rounded-2xl p-4 bg-black/20">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="font-semibold text-white mt-2">{value}</p>
    </div>
  );
}

function getRiskLevel(score: number) {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
}

function getRiskSummary(score: number, flagCount: number) {
  if (score >= 70) {
    return `High-risk verification profile detected with ${flagCount} active risk flag(s). Manual compliance review is required before approval.`;
  }

  if (score >= 40) {
    return `Moderate-risk applicant profile detected with ${flagCount} active risk flag(s). Enhanced due diligence is recommended.`;
  }

  return `Low-risk applicant profile detected. Automated screening found no major escalation triggers.`;
}

function getCheckDetails(type: string, status: string) {
  const base: Record<
    string,
    {
      title: string;
      icon: React.ReactNode;
      iconClass: string;
      pass: string;
      review: string;
      fail: string;
    }
  > = {
    DOCUMENT_VALIDITY: {
      title: "Document Validity",
      icon: <FileText className="w-5 h-5" />,
      iconClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      pass: "All required identity documents were submitted and accepted by the onboarding workflow.",
      review: "Document metadata or submission quality requires manual verification.",
      fail: "Required documentation is incomplete or failed validation.",
    },
    FACE_MATCH: {
      title: "Face Match",
      icon: <ScanFace className="w-5 h-5" />,
      iconClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      pass: "Biometric similarity is within the expected verification confidence range.",
      review: "Face match confidence is below the automatic approval threshold.",
      fail: "Biometric comparison failed to reach minimum verification confidence.",
    },
    LIVENESS: {
      title: "Liveness Detection",
      icon: <Fingerprint className="w-5 h-5" />,
      iconClass: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      pass: "Liveness verification completed successfully.",
      review: "Liveness score requires additional reviewer attention.",
      fail: "Liveness verification failed.",
    },
    SANCTIONS_SCREEN: {
      title: "Sanctions Screening",
      icon: <ShieldAlert className="w-5 h-5" />,
      iconClass: "bg-red-500/10 border-red-500/20 text-red-400",
      pass: "No sanctions exposure detected.",
      review: "Jurisdiction or profile requires enhanced sanctions review.",
      fail: "Potential sanctions exposure detected.",
    },
    PEP_SCREEN: {
      title: "PEP Screening",
      icon: <ShieldCheck className="w-5 h-5" />,
      iconClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      pass: "No politically exposed person or watchlist match detected.",
      review: "Possible PEP exposure requires additional review.",
      fail: "Potential watchlist or politically exposed person match detected.",
    },
  };

  const item = base[type] ?? base.DOCUMENT_VALIDITY;

  return {
    title: item.title,
    icon: item.icon,
    iconClass: item.iconClass,
    reason:
      status === "FAIL"
        ? item.fail
        : status === "REVIEW"
        ? item.review
        : item.pass,
  };
}

function generateFlags(country: string | null, riskScore: number, checks: any[]) {
  const flags = [];

  const normalizedCountry = country?.trim().toLowerCase();

  const highRiskCountries = ["iran", "north korea", "syria", "russia", "afghanistan"];
  const mediumRiskCountries = ["lebanon", "iraq", "pakistan"];

  if (normalizedCountry && highRiskCountries.includes(normalizedCountry)) {
    flags.push({
      label: "High Risk Jurisdiction",
      color: "bg-red-500/10 text-red-300 border-red-500/20",
    });
  }

  if (normalizedCountry && mediumRiskCountries.includes(normalizedCountry)) {
    flags.push({
      label: "Enhanced Due Diligence",
      color: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    });
  }

  if (riskScore >= 70) {
    flags.push({
      label: "Manual Review Required",
      color: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    });
  }

  const failedChecks = checks.filter((check) => check.status === "FAIL");
  const reviewChecks = checks.filter((check) => check.status === "REVIEW");

  if (failedChecks.length > 0) {
    flags.push({
      label: "Failed Verification Check",
      color: "bg-red-500/10 text-red-300 border-red-500/20",
    });
  }

  if (reviewChecks.length > 0) {
    flags.push({
      label: "Reviewer Attention",
      color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    });
  }

  return flags;
}