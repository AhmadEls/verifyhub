"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type Decision =
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_MORE_INFO";

const DECISION_LABELS: Record<
  Decision,
  {
    title: string;
    verb: string;
    description: string;
    tone:
      | "default"
      | "destructive"
      | "secondary";
  }
> = {

  APPROVED: {
    title: "Approve Verification",
    verb: "Approve Session",
    description:
      "This will finalize the verification session as approved.",
    tone: "default",
  },

  REJECTED: {
    title: "Reject Verification",
    verb: "Reject Session",
    description:
      "This verification session will be permanently rejected.",
    tone: "destructive",
  },

  NEEDS_MORE_INFO: {
    title: "Request Additional Information",
    verb: "Request Information",
    description:
      "The user will be asked to provide additional verification details.",
    tone: "secondary",
  },
};

export function ActionButtons({
  sessionId,
}: {
  sessionId: string;
}) {

  const router = useRouter();

  const [open, setOpen] =
    useState<Decision | null>(null);

  const [notes, setNotes] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit() {

    if (!open) return;

    setSubmitting(true);

    setError(null);

    const res = await fetch(
      `/api/sessions/${sessionId}/decision`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          decision: open,
          notes,
        }),
      }
    );

    setSubmitting(false);

    if (!res.ok) {

      const data =
        await res.json().catch(() => ({}));

      setError(
        data.error || "Action failed"
      );

      return;
    }

    setOpen(null);

    setNotes("");

    router.refresh();
  }

  const config = open
    ? DECISION_LABELS[open]
    : null;

  return (
    <>
      <div className="space-y-3">

        <Button
          className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
          onClick={() =>
            setOpen("APPROVED")
          }
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />

          Approve Verification
        </Button>

        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl"
          onClick={() =>
            setOpen("REJECTED")
          }
        >
          <XCircle className="w-4 h-4 mr-2" />

          Reject Verification
        </Button>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
          onClick={() =>
            setOpen("NEEDS_MORE_INFO")
          }
        >
          <AlertTriangle className="w-4 h-4 mr-2" />

          Request More Info
        </Button>
      </div>

      <Dialog
        open={open !== null}
        onOpenChange={(o) =>
          !o && setOpen(null)
        }
      >
        <DialogContent className="bg-[#0F172A] border border-white/10 text-white">

          {config && (
            <>
              <DialogHeader>

                <DialogTitle className="text-2xl">
                  {config.title}
                </DialogTitle>

                <DialogDescription className="text-slate-400">
                  {config.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">

                <Label htmlFor="notes">
                  Reviewer Notes
                </Label>

                <Textarea
                  id="notes"
                  placeholder="Add reviewer context, compliance reasoning, or additional notes..."
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={5}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <DialogFooter>

                <Button
                  variant="outline"
                  onClick={() =>
                    setOpen(null)
                  }
                  disabled={submitting}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancel
                </Button>

                <Button
                  variant={
                    config.tone ===
                    "destructive"
                      ? "destructive"
                      : "default"
                  }

                  className={
                    config.tone ===
                    "default"

                      ? "bg-green-600 hover:bg-green-700"

                      : ""
                  }

                  onClick={handleSubmit}

                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : config.verb}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}