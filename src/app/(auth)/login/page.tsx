import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

const oauthProviders = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020202] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(236,168,214,0.18),transparent_32%),radial-gradient(circle_at_24%_14%,rgba(143,156,255,0.16),transparent_30%),linear-gradient(180deg,#020202_0%,#050505_45%,#020202_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10 grid w-full max-w-[1180px] items-stretch gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_35px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:block">
          <div className="relative h-full min-h-[720px] p-10">
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/bridge.png" alt="Histeeria visual" className="h-full w-full object-cover opacity-70" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(2,2,2,0.88)_0%,rgba(2,2,2,0.5)_45%,rgba(2,2,2,0.86)_100%)]" />
            <div className="relative z-10 max-w-[540px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Reliability layer</p>
              <h1 className="mt-4 text-[66px] font-medium leading-[0.92] tracking-[-0.06em] text-white">
                Connect.
                <br />
                Evaluate.
                <br />
                Improve.
              </h1>
              <p className="mt-5 max-w-[460px] text-[17px] leading-[1.8] text-white/68">
                Monitor AI agent decisions, verify judgment quality, and prevent mistakes before user impact.
              </p>
            </div>
          </div>
        </section>

        <div className="relative w-full">
          <div className="max-h-[86vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#070707]/86 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.72)] backdrop-blur-2xl md:p-7">
          <Suspense fallback={
            <div className="flex h-[320px] flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-surface-2" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
            </div>
          }>
            <LoginForm oauthProviders={oauthProviders} />
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
