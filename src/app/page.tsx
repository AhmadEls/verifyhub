import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ScanFace,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";

export default function HomePage() {

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-cyan-500/10 blur-[160px]" />

        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-600/10 blur-[160px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">

              <Shield className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                VerifyHub
              </h1>

              <p className="text-xs text-slate-400">
                AI Compliance Platform
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="px-5 py-2 rounded-xl bg-white text-black font-medium hover:bg-slate-200 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-28 pb-20">

        <div className="max-w-4xl">

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm mb-8">

            <Shield className="w-4 h-4" />

            AI-Assisted Verification Infrastructure
          </div>

          <h1 className="text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl">

            Enterprise KYC &
            Identity Verification Platform
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed mt-10 max-w-3xl">

            VerifyHub helps organizations automate compliance workflows,
            monitor operational risk, perform identity screening,
            and manage reviewer decisions through a centralized verification platform.
          </p>

          <div className="flex items-center gap-5 mt-12">

            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all shadow-lg shadow-cyan-500/20"
            >
              Open Dashboard

              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="text-sm text-slate-500">
              Built with Next.js, Prisma, PostgreSQL & NextAuth
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-4 gap-6 mt-28">

          <FeatureCard
            icon={<ScanFace className="w-7 h-7" />}
            title="Identity Screening"
            description="Automated verification workflows and compliance review systems."
          />

          <FeatureCard
            icon={<ShieldAlert className="w-7 h-7" />}
            title="Risk Scoring"
            description="AI-assisted risk escalation and operational compliance monitoring."
          />

          <FeatureCard
            icon={<Fingerprint className="w-7 h-7" />}
            title="Fraud Prevention"
            description="Document validation, liveness workflows, and verification controls."
          />

          <FeatureCard
            icon={<Shield className="w-7 h-7" />}
            title="Audit Infrastructure"
            description="Reviewer actions, decision history, and compliance traceability."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {

  return (
    <div className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-7 hover:border-cyan-500/30 transition-all">

      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">

        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-slate-400 mt-4 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}