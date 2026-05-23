import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VerifyForm } from "./verify-form";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await prisma.verificationSession.findUnique({
    where: { publicToken: token },
  });

  if (!session) notFound();

  if (session.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
  <div className="max-w-md w-full bg-white rounded-2xl border p-8 text-center shadow-sm">

    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>

    <h1 className="text-3xl font-bold mb-3 text-slate-900">
      Submission received
    </h1>

    <p className="text-slate-600 leading-relaxed">
      Thank you. Your verification has been submitted successfully and is now under compliance review.
    </p>

    <div className="mt-8">
      <a
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
      >
        Return to Dashboard
      </a>
    </div>
  </div>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Identity Verification</h1>
          <p className="text-slate-600 mt-2">
            Please provide your information and upload the required documents.
          </p>
        </div>
        <VerifyForm token={token} />
      </div>
    </div>
  );
}