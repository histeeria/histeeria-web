import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,140,255,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="panel relative w-full max-w-md rounded-2xl p-8 backdrop-blur">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-surface-2" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
