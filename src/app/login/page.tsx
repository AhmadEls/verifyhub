import { LoginForm } from "./login-form";
import {
  Shield,
  ScanFace,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center px-20">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm mb-8">

              <Shield className="w-4 h-4" />

              AI-Powered Compliance Infrastructure
            </div>

            <h1 className="text-6xl font-bold leading-tight tracking-tight">

              Modern Identity Verification & Risk Intelligence
            </h1>

            <p className="text-xl text-slate-400 mt-8 leading-relaxed">

              VerifyHub enables organizations to automate KYC workflows, monitor compliance risk, perform identity screening, and manage reviewer operations through a unified verification platform.
            </p>

            <div className="grid grid-cols-2 gap-5 mt-12">

              <FeatureCard
                icon={<ScanFace className="w-6 h-6" />}
                title="Face Match"
                description="AI-assisted identity similarity analysis"
              />

              <FeatureCard
                icon={<ShieldAlert className="w-6 h-6" />}
                title="Risk Scoring"
                description="Automated compliance escalation logic"
              />

              <FeatureCard
                icon={<Fingerprint className="w-6 h-6" />}
                title="Liveness Checks"
                description="Fraud prevention & spoof detection"
              />

              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Audit Trails"
                description="Operational reviewer transparency"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-12">

          <div className="w-full max-w-md">

            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">

              <div className="text-center mb-8">

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">

                  <Shield className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold mt-6">
                  VerifyHub
                </h2>

                <p className="text-slate-400 mt-2">
                  Secure compliance operations
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-5 backdrop-blur-xl">

      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
        {icon}
      </div>

      <h3 className="font-semibold text-lg">
        {title}
      </h3>

      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}