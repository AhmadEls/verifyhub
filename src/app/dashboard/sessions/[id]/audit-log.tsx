import type { AuditEntry } from "@prisma/client";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";

type AuditEntryWithActor = AuditEntry & {
  actor: {
    name: string;
    email: string;
  } | null;
};

const ACTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  SESSION_CREATED: {
    label: "Session created",
    icon: <FileText className="w-4 h-4" />,
    color:
      "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },

  SESSION_SUBMITTED: {
    label: "Verification submitted",
    icon: <Clock3 className="w-4 h-4" />,
    color:
      "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },

  CHECKS_COMPLETED: {
    label: "Compliance checks completed",
    icon: <ShieldCheck className="w-4 h-4" />,
    color:
      "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },

  STATUS_CHANGED: {
    label: "Status changed",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color:
      "bg-green-500/10 border-green-500/20 text-green-400",
  },

  NOTE_ADDED: {
    label: "Reviewer note added",
    icon: (
      <AlertTriangle className="w-4 h-4" />
    ),
    color:
      "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
};

export function AuditLog({
  entries,
}: {
  entries: AuditEntryWithActor[];
}) {

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="space-y-5">

      {entries.map((entry) => {

        const meta =
          entry.metadata as
            | Record<string, unknown>
            | null;

        const from =
          meta?.from as string | undefined;

        const to =
          meta?.to as string | undefined;

        const notes =
          meta?.notes as
            | string
            | null
            | undefined;

        const config =
          ACTION_CONFIG[entry.action];

        return (
          <li
            key={entry.id}
            className="relative pl-16"
          >

            {/* LINE */}
            <div className="absolute left-[23px] top-12 bottom-[-24px] w-px bg-white/10" />

            {/* ICON */}
            <div
              className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border flex items-center justify-center backdrop-blur-xl ${config?.color}`}
            >
              {config?.icon}
            </div>

            {/* CONTENT */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="font-semibold text-white">
                    {config?.label ??
                      entry.action}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {entry.actor?.name ??
                      "System"}{" "}
                    •{" "}
                    {entry.createdAt.toLocaleString()}
                  </p>
                </div>

                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Audit Event
                </div>
              </div>

              {from && to && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                  <span>{from}</span>

                  <span className="text-slate-500">
                    →
                  </span>

                  <span>{to}</span>
                </div>
              )}

              {notes && (
                <div className="mt-4 border border-white/10 rounded-xl bg-white/[0.03] p-4">
                  <p className="text-sm italic text-slate-300 leading-relaxed">
                    "{notes}"
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}