import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LayoutDashboard,
  BarChart3,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* TOPBAR */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-10">

            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>

              <div>
                <p className="font-bold text-lg tracking-tight">
                  VerifyHub
                </p>

                <p className="text-xs text-slate-400">
                  Compliance Platform
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Sessions
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5">

            <div className="text-right">
              <p className="text-sm font-medium">
                {session.user.name}
              </p>

              <p className="text-xs text-slate-400 uppercase tracking-wide">
                {session.user.role}
              </p>
            </div>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/login",
                });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}