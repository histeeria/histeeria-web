"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ApiStatusBanner({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div className="panel mx-auto max-w-lg animate-fade-up rounded-2xl p-8 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Connection issue</p>
      <h1 className="mt-3 text-2xl font-semibold">Almost there</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <Button type="button" className="mt-6" onClick={() => router.refresh()}>
        Try again
      </Button>
    </div>
  );
}
