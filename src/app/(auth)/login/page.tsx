import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030407] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,137,220,0.08)_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-2xl border border-[#27272a] bg-[#0a0a0a]/85 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.78)] backdrop-blur-[10px]">
          <Suspense fallback={
            <div className="flex h-[320px] flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-surface-2" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
