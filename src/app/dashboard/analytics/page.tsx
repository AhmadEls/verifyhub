import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock3,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default async function AnalyticsPage() {

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [
    totalSessions,
    approved,
    rejected,
    inReview,
    submitted,
    highRisk,
  ] = await Promise.all([

    prisma.verificationSession.count(),

    prisma.verificationSession.count({
      where: {
        status: "APPROVED",
      },
    }),

    prisma.verificationSession.count({
      where: {
        status: "REJECTED",
      },
    }),

    prisma.verificationSession.count({
      where: {
        status: "IN_REVIEW",
      },
    }),

    prisma.verificationSession.count({
      where: {
        status: "SUBMITTED",
      },
    }),

    prisma.verificationSession.count({
      where: {
        riskScore: {
          gte: 70,
        },
      },
    }),
  ]);

  const approvalRate =
    totalSessions === 0
      ? 0
      : Math.round(
          (approved / totalSessions) * 100
        );

  const rejectionRate =
    totalSessions === 0
      ? 0
      : Math.round(
          (rejected / totalSessions) * 100
        );

  const reviewRate =
    totalSessions === 0
      ? 0
      : Math.round(
          (inReview / totalSessions) * 100
        );

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Compliance Analytics
        </h1>

        <p className="text-slate-400 mt-2">
          Operational insights, risk activity,
          and verification metrics.
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <MetricCard
          title="Total Sessions"
          value={totalSessions}
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

        <MetricCard
          title="Submitted"
          value={submitted}
          icon={<Clock3 className="w-5 h-5" />}
          color="blue"
        />

        <MetricCard
          title="High Risk"
          value={highRisk}
          icon={
            <AlertTriangle className="w-5 h-5" />
          }
          color="red"
        />
      </div>

      {/* MAIN ANALYTICS */}
      <div className="grid grid-cols-2 gap-6">

        {/* APPROVAL RATE */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Approval Rate
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Overall verification success
              </p>
            </div>

            <div className="text-4xl font-bold text-green-400">
              {approvalRate}%
            </div>
          </div>

          <ProgressBar
            value={approvalRate}
            color="green"
          />
        </div>

        {/* REJECTION RATE */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Rejection Rate
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Rejected or suspicious users
              </p>
            </div>

            <div className="text-4xl font-bold text-red-400">
              {rejectionRate}%
            </div>
          </div>

          <ProgressBar
            value={rejectionRate}
            color="red"
          />
        </div>
      </div>

      {/* RISK DISTRIBUTION */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h2 className="text-2xl font-semibold">
              Risk Distribution
            </h2>

            <p className="text-slate-400 mt-1">
              Compliance engine risk analysis
            </p>
          </div>

          <div className="text-sm text-slate-500 uppercase tracking-wider">
            AI-assisted screening
          </div>
        </div>

        <div className="space-y-6">

          <RiskBar
            label="Low Risk"
            value={Math.max(
              100 -
                approvalRate -
                rejectionRate -
                reviewRate,
              10
            )}
            color="green"
          />

          <RiskBar
            label="Medium Risk"
            value={reviewRate}
            color="amber"
          />

          <RiskBar
            label="High Risk"
            value={rejectionRate}
            color="red"
          />
        </div>
      </div>

      {/* ENGINE STATUS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h2 className="text-2xl font-semibold">
              Verification Engine
            </h2>

            <p className="text-slate-400 mt-1">
              Automated compliance checks
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm border border-green-500/20">
            Operational
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <EngineCard
            title="Sanctions Screening"
            status="Active"
          />

          <EngineCard
            title="PEP Monitoring"
            status="Active"
          />

          <EngineCard
            title="Face Match Analysis"
            status="Operational"
          />

          <EngineCard
            title="Liveness Detection"
            status="Enabled"
          />

          <EngineCard
            title="Risk Escalation"
            status="Enabled"
          />

          <EngineCard
            title="Audit Logging"
            status="Real-time"
          />
        </div>
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

    blue:
      "from-blue-500/20 to-indigo-500/10 border-blue-500/20",
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

        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {

  const colors: Record<string, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
  };

  return (
    <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">

      <div
        className={`h-full ${colors[color]}`}
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

function RiskBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {

  const colors: Record<string, string> = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <p className="font-medium">
          {label}
        </p>

        <p className="text-sm text-slate-400">
          {value}%
        </p>
      </div>

      <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">

        <div
          className={`h-full ${colors[color]}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function EngineCard({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-5 bg-black/20">

      <p className="font-medium">
        {title}
      </p>

      <p className="text-sm text-slate-400 mt-2">
        {status}
      </p>
    </div>
  );
}