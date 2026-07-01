"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function SudoHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing sudo token.");
      return;
    }

    async function run() {
      const res = await signIn("credentials", {
        sudoToken: token,
        callbackUrl: "/onboarding",
        redirect: false,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      window.location.href = res?.url ?? "/onboarding";
    }

    void run();
  }, [token]);

  if (error) {
    return (
      <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-4 py-3 text-[13px] text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-[#71717a]">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-[13px]">Opening sudo session…</p>
    </div>
  );
}

export default function SudoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-[#71717a]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        }
      >
        <SudoHandler />
      </Suspense>
    </div>
  );
}
