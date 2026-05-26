import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { CreateSessionButton } from "./create-session-button";
import { StatusBadge } from "./status-badge";
import { SessionFilters } from "./session-filters";
import { SessionStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

const ALL_STATUSES: SessionStatus[] = [
  "PENDING",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "NEEDS_MORE_INFO",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}) {

  const session = await auth();

  if (!session?.user) return null;

  const { status, q } =
    await searchParams;

  const where: Prisma.VerificationSessionWhereInput =
    {
      organizationId:
        session.user.organizationId,
    };

  if (
    status &&
    ALL_STATUSES.includes(
      status as SessionStatus
    )
  ) {
    where.status =
      status as SessionStatus;
  }

  if (q && q.trim().length > 0) {
    where.OR = [
      {
        fullName: {
          contains: q,
          mode: "insensitive",
        },
      },

      {
        country: {
          contains: q,
          mode: "insensitive",
        },
      },

      {
        city: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  const [
    sessions,
    totalCount,
    approved,
    rejected,
    inReview,
  ] = await Promise.all([
    prisma.verificationSession.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),

    prisma.verificationSession.count({
      where: {
        organizationId:
          session.user.organizationId,
      },
    }),

    prisma.verificationSession.count({
      where: {
        organizationId:
          session.user.organizationId,

        status: "APPROVED",
      },
    }),

    prisma.verificationSession.count({
      where: {
        organizationId:
          session.user.organizationId,

        status: "REJECTED",
      },
    }),

    prisma.verificationSession.count({
      where: {
        organizationId:
          session.user.organizationId,

        status: "IN_REVIEW",
      },
    }),
  ]);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Verification Operations
          </h1>

          <div className="mt-2 space-y-3">
  <p className="text-slate-400">
    Monitor verification workflows,
    compliance reviews, and risk
    activity.
  </p>

  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
    Automated compliance screening powered by configurable AML/KYC rules
  </p>
</div>
        </div>

        <CreateSessionButton />
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-4 gap-5">

        <MetricCard
          title="Total Sessions"
          value={totalCount}
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
        />

        <MetricCard
          title="Approved"
          value={approved}
          icon={
            <CheckCircle2 className="w-5 h-5" />
          }
          color="green"
        />

        <MetricCard
          title="Rejected"
          value={rejected}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />

        <MetricCard
          title="In Review"
          value={inReview}
          icon={
            <ShieldAlert className="w-5 h-5" />
          }
          color="amber"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
        <SessionFilters
          currentStatus={status}
          currentQuery={q}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-lg">
              Verification Sessions
            </h2>

            <p className="text-sm text-slate-400">
              {sessions.length} visible
              sessions
            </p>
          </div>

          <div className="text-xs text-slate-500 uppercase tracking-wider">
            Real-time monitoring
          </div>
        </div>

        {sessions.length === 0 ? (
  <div className="p-16">
    <div className="flex flex-col items-center justify-center text-center">
      <ShieldAlert className="h-10 w-10 text-slate-600 mb-4" />

      <p className="text-lg font-medium text-white">
        No verification sessions found
      </p>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        Start by creating a new verification request or adjusting the current filters.
      </p>
    </div>
  </div>
) : (

          <table className="w-full text-sm">

            <thead className="border-b border-white/10 text-left text-slate-400 bg-black/20">
              <tr>
                <th className="px-6 py-4 font-medium">
                  User
                </th>

                <th className="px-6 py-4 font-medium">
                  Country
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium">
                  Risk
                </th>

                <th className="px-6 py-4 font-medium">
                  Last Updated
                </th>

                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((s) => (

                <tr
                  key={s.id}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition"
                >

                  <td className="px-6 py-5">
                    <div>
                      <p className="font-medium text-white">
                        {s.fullName || "Unknown"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {s.id.slice(0, 16)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-300">
                    {s.country || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={s.status} />
                  </td>

                  <td className="px-6 py-5">
                    {s.riskScore !== null ? (
                      <RiskScore
                        score={s.riskScore}
                      />
                    ) : (
                      <span className="text-slate-500">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-slate-400">
                    {new Date(
  s.reviewedAt ||
  s.submittedAt ||
  s.createdAt
).toLocaleString()}
                  </td>

                  <td className="px-6 py-5 text-right">

                    {s.status === "PENDING" ? (

                      <Link
                        href={`/verify/${s.publicToken}`}
                        target="_blank"
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Open →
                      </Link>

                    ) : (

                      <Link
                        href={`/dashboard/sessions/${s.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Open Case →
                      </Link>

                    )}
                  </td>
                </tr>

              ))}
            </tbody>
          </table>

        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {

  const styles: Record<string, string> = {
    cyan:
      "from-cyan-500/20 to-blue-500/10 border-cyan-500/20",

    green:
      "from-green-500/20 to-emerald-500/10 border-green-500/20",

    red:
      "from-red-500/20 to-rose-500/10 border-red-500/20",

    amber:
      "from-amber-500/20 to-orange-500/10 border-amber-500/20",
  };

  return (
    <div
      className={`bg-gradient-to-br ${styles[color]} border rounded-2xl p-6 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="text-4xl font-bold mt-3">
            {value}
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RiskScore({
  score,
}: {
  score: number;
}) {

  const color =
    score >= 70
      ? "text-red-400"

      : score >= 40
      ? "text-amber-400"

      : "text-green-400";

  return (
    <div className="flex items-center gap-3">

      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full ${
            score >= 70
              ? "bg-red-500"

              : score >= 40
              ? "bg-amber-500"

              : "bg-green-500"
          }`}
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      <span
        className={`font-semibold ${color}`}
      >
        {score}
      </span>
    </div>
  );
}