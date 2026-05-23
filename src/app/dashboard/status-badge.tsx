import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    className: string;
  }
> = {

  PENDING: {
    label: "Pending",
    className:
      "bg-slate-500/10 text-slate-300 border border-slate-500/20 hover:bg-slate-500/20",
  },

  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20",
  },

  IN_REVIEW: {
    label: "In Review",
    className:
      "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20",
  },

  APPROVED: {
    label: "Approved",
    className:
      "bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20",
  },

  NEEDS_MORE_INFO: {
    label: "Needs Info",
    className:
      "bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20",
  },
};

export function StatusBadge({
  status,
}: {
  status: SessionStatus;
}) {

  const config =
    STATUS_CONFIG[status];

  return (
    <Badge
      variant="secondary"
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}